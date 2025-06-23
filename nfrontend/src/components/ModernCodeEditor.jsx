import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Box, Typography, CircularProgress, Button, Alert, Chip } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socket";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";

const THEMES = [
  { label: "VS Dark", value: "vs-dark" },
  { label: "VS Light", value: "vs-light" },
  { label: "High Contrast", value: "hc-black" },
];

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "JSON", value: "json" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Markdown", value: "markdown" },
  { label: "Shell", value: "shell" },
];

const DEFAULT_LANGUAGE = "javascript";
const DEFAULT_THEME = "vs-dark";

function ModernCodeEditor({
  value = "",
  language = DEFAULT_LANGUAGE,
  theme = DEFAULT_THEME,
  onChange,
  ...props
}) {
  const { projectId } = useParams();
  const [code, setCode] = useState(value);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [liveUsers, setLiveUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { socket } = useSocket();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const cursorWidgetsRef = useRef({});
  const userColorsRef = useRef({});
  const colorPalette = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#a29bfe', '#fd79a8', '#00b894', '#fdcb6e', '#e17055', '#00bcd4', '#6c5ce7', '#fab1a0', '#636e72', '#e17055', '#00b894', '#fdcb6e', '#e17055', '#00bcd4', '#6c5ce7', '#fab1a0', '#636e72'
  ];

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Auth-Token': localStorage.getItem('authToken') || '',
    'X-Username': localStorage.getItem('username') || ''
  });

  useEffect(() => {
    setCode(value);
  }, [value]);

  // Socket connection status
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("[ModernCodeEditor] Socket connected!");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("[ModernCodeEditor] Socket disconnected!");
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  // Join project room
  useEffect(() => {
    if (!socket || !projectId) return;

    const username = localStorage.getItem('username');
    const image = localStorage.getItem('image');

    console.log("User joining project:", { project_id: projectId, username, image });
    socket.emit("editor:join-project", {
      project_id: projectId,
      username: username,
      image: image
    });

    return () => {
      socket.emit("editor:live-user-left-from-editor", { 
        username: username,
        project_id: projectId
      });
    };
  }, [socket, projectId]);

  // Real-time code sync logic
  useEffect(() => {
    if (!socket || !props.selectedFile) {
      console.log("[ModernCodeEditor] Socket or selectedFile missing", { socket, selectedFile: props.selectedFile });
      return;
    }

    console.log("[ModernCodeEditor] Joining file for real-time sync", props.selectedFile.id);
    socket.emit("code-editor:join-file", { 
      file_id: props.selectedFile.id,
      project_id: projectId,
      username: localStorage.getItem('username')
    });

    // Listen for code changes from others
    const handleReceiveChange = (data) => {
      console.log("[ModernCodeEditor] Received code change", data);
      if (data.file_id === props.selectedFile.id && data.code !== code) {
        setCode(data.code);
      }
    };

    // Listen for live users updates
    const handleLoadLiveUsers = (data) => {
      console.log("[ModernCodeEditor] Loading live users", data);
      if (data.file_id === props.selectedFile.id) {
        socket.emit("code-editor:load-live-users-send-back", {
          file_id: props.selectedFile.id,
          project_id: projectId,
          username: localStorage.getItem('username'),
          image: localStorage.getItem('image')
        });
      }
    };

    const handleLoadLiveUsersSendBack = (data) => {
      console.log("[ModernCodeEditor] Live users data received", data);
      if (data.allUsers) {
        setLiveUsers(data.allUsers);
      }
    };

    const handleUserJoined = (data) => {
      console.log("[ModernCodeEditor] User joined file", data);
      if (data.aUser && data.aUser.file_id === props.selectedFile.id) {
        setLiveUsers(prev => {
          const exists = prev.find(user => user.username === data.aUser.username);
          if (!exists) {
            return [...prev, { ...data.aUser, image: data.image }];
          }
          return prev;
        });
      }
    };

    const handleUserLeft = (data) => {
      console.log("[ModernCodeEditor] User left file", data);
      if (data.file_id === props.selectedFile.id) {
        setLiveUsers(prev => prev.filter(user => user.username !== data.username));
      }
    };

    // Listen for cursor updates
    const handleReceiveCursor = (data) => {
      console.log("[CURSOR] handleReceiveCursor called", data, "local username:", localStorage.getItem('username'));
      if (data.file_id === props.selectedFile.id && data.username !== localStorage.getItem('username')) {
        updateCursorDecoration(data);
      }
    };

    const handleRemoveCursor = (data) => {
      if (data.file_id === props.selectedFile.id) {
        removeCursorDecoration(data.username);
      }
    };

    socket.on("code-editor:receive-change", handleReceiveChange);
    socket.on("code-editor:load-live-users", handleLoadLiveUsers);
    socket.on("code-editor:load-live-users-send-back", handleLoadLiveUsersSendBack);
    socket.on("code-editor:user-joined", handleUserJoined);
    socket.on("code-editor:user-left", handleUserLeft);
    socket.on("code-editor:receive-cursor", handleReceiveCursor);
    socket.on("code-editor:remove-cursor", handleRemoveCursor);

    // Clean up on file change or unmount
    return () => {
      socket.off("code-editor:receive-change", handleReceiveChange);
      socket.off("code-editor:load-live-users", handleLoadLiveUsers);
      socket.off("code-editor:load-live-users-send-back", handleLoadLiveUsersSendBack);
      socket.off("code-editor:user-joined", handleUserJoined);
      socket.off("code-editor:user-left", handleUserLeft);
      socket.off("code-editor:receive-cursor", handleReceiveCursor);
      socket.off("code-editor:remove-cursor", handleRemoveCursor);
      socket.emit("code-editor:leave-file", { 
        file_id: props.selectedFile.id,
        project_id: projectId,
        username: localStorage.getItem('username')
      });
    };
  }, [socket, props.selectedFile, code]);

  // Helper: generate color from username
  function getUserColor(username) {
    if (!userColorsRef.current[username]) {
      // Assign next color from palette, or random hsl if palette exhausted
      const keys = Object.keys(userColorsRef.current);
      if (keys.length < colorPalette.length) {
        userColorsRef.current[username] = colorPalette[keys.length];
      } else {
        // Generate random hsl
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
          hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        userColorsRef.current[username] = `hsl(${hash % 360}, 70%, 50%)`;
      }
    }
    return userColorsRef.current[username];
  }

  // Add/Update remote cursor decoration + badge
  const updateCursorDecoration = (data) => {
    console.log("[CURSOR] updateCursorDecoration called", data);
    if (!editorRef.current || !monacoRef.current) return;
    const { username, position } = data;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    removeCursorDecoration(username);

    // Decoration: thicker colored vertical bar with shadow
    const color = getUserColor(username);
    const decorationIds = editor.deltaDecorations([], [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1),
      options: {
        className: 'remote-cursor',
        inlineClassName: '',
        hoverMessage: { value: `${username}'s cursor` },
        beforeContentClassName: '',
        afterContentClassName: '',
        inlineClassNameAffectsLetterSpacing: true,
      }
    }]);
    decorationsRef.current.push({ username, decoration: decorationIds[0] });

    // Content widget: username badge (just above cursor)
    const widgetId = `remote-cursor-badge-${username}`;
    const domNode = document.createElement('div');
    domNode.textContent = username;
    domNode.style.background = color;
    domNode.style.color = 'white';
    domNode.style.padding = '1px 7px 1px 7px';
    domNode.style.borderRadius = '5px';
    domNode.style.fontSize = '11px';
    domNode.style.fontWeight = 'bold';
    domNode.style.position = 'absolute';
    domNode.style.transform = 'translateY(-105%)';
    domNode.style.pointerEvents = 'auto';
    domNode.style.zIndex = 1000;
    domNode.style.boxShadow = '0 1px 4px rgba(0,0,0,0.12)';
    domNode.style.border = `1.5px solid ${color}`;
    domNode.style.opacity = '0';
    domNode.style.transition = 'opacity 0.3s';
    // Add a small arrow below the badge
    const arrow = document.createElement('div');
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '5px solid transparent';
    arrow.style.borderRight = '5px solid transparent';
    arrow.style.borderTop = `6px solid ${color}`;
    arrow.style.margin = '0 auto';
    arrow.style.position = 'relative';
    arrow.style.top = '-2px';
    domNode.appendChild(arrow);

    // Show label for 2s on activity, then fade out
    if (!window._cursorLabelTimers) window._cursorLabelTimers = {};
    if (window._cursorLabelTimers[username]) {
      clearTimeout(window._cursorLabelTimers[username]);
    }
    domNode.style.opacity = '1';
    window._cursorLabelTimers[username] = setTimeout(() => {
      domNode.style.opacity = '0';
    }, 2000);

    // Show label on hover, hide on mouseleave
    domNode.addEventListener('mouseenter', () => {
      domNode.style.opacity = '1';
      if (window._cursorLabelTimers[username]) {
        clearTimeout(window._cursorLabelTimers[username]);
      }
    });
    domNode.addEventListener('mouseleave', () => {
      domNode.style.opacity = '0';
    });

    // Monaco content widget
    const widget = {
      getId: () => widgetId,
      getDomNode: () => domNode,
      getPosition: () => ({
        position: { lineNumber: position.lineNumber, column: position.column },
        preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
      })
    };
    editor.addContentWidget(widget);
    cursorWidgetsRef.current[username] = widget;

    // Inject dynamic CSS for thicker cursor line with shadow
    const styleId = `remote-cursor-style-${username}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .remote-cursor {
          border-left: 4px solid ${color} !important;
          height: 20px !important;
          position: absolute !important;
          z-index: 1000 !important;
          pointer-events: none;
          box-shadow: 0 0 4px ${color}99;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Remove remote cursor decoration + badge
  const removeCursorDecoration = (username) => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    // Remove decoration
    const idx = decorationsRef.current.findIndex((d) => d.username === username);
    if (idx !== -1) {
      const decoId = decorationsRef.current[idx].decoration;
      editor.deltaDecorations([decoId], []);
      decorationsRef.current.splice(idx, 1);
    }
    // Remove content widget
    if (cursorWidgetsRef.current[username]) {
      editor.removeContentWidget(cursorWidgetsRef.current[username]);
      delete cursorWidgetsRef.current[username];
    }
    console.log('[CURSOR] removeCursorDecoration called for', username);
  };

  // Handle editor cursor position changes
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (socket && props.selectedFile) {
        socket.emit("code-editor:send-cursor", {
          file_id: props.selectedFile.id,
          project_id: projectId,
          username: localStorage.getItem('username'),
          position: {
            lineNumber: e.position.lineNumber,
            column: e.position.column
          }
        });
      }
    });
  };

  // Fetch file content when selectedFile changes
  useEffect(() => {
    if (!props.selectedFile) return;
    setLoading(true);
    setError("");
    setCode("");
    setSaveMsg("");
    setLiveUsers([]);
    
    fetch(`/api/editor/${projectId}/files/${props.selectedFile.id}/content`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setCode(data.data.file_data || "");
        else setError(data.message || "Failed to load file content");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [props.selectedFile, projectId]);

  // Save file content
  const handleSave = async () => {
    if (!props.selectedFile) return;
    setSaving(true);
    setError("");
    setSaveMsg("");
    try {
      const res = await fetch(`/api/editor/${projectId}/files/${props.selectedFile.id}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ file_data: code })
      });
      const data = await res.json();
      if (data.success) setSaveMsg("Saved!");
      else setError(data.message || "Failed to save file");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 1500);
    }
  };

  // Format code with Prettier
  const handleFormat = () => {
    try {
      const formatted = prettier.format(code, {
        parser: "babel",
        plugins: [parserBabel],
        singleQuote: true,
        semi: true,
      });
      setCode(formatted);
      if (editorRef.current) editorRef.current.setValue(formatted);
    } catch (e) {
      setError("Formatting error: " + e.message);
    }
  };

  // AI Suggestion placeholder
  const handleAISuggestion = async () => {
    // Call your AI API here, get suggestion, insert at cursor
    // Example: setCode(code + "\n// AI suggestion here");
    setError("AI Suggestion feature coming soon!");
  };

  // Add Ctrl+S keybinding for save+format
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code]);

  // Emit code changes to others
  const handleEditorChange = (newValue) => {
    console.log("[ModernCodeEditor] handleEditorChange called", newValue);
    setCode(newValue);
    if (onChange) onChange(newValue);
    if (socket && props.selectedFile) {
      console.log("[ModernCodeEditor] Emitting code change", { file_id: props.selectedFile.id, code: newValue });
      socket.emit("code-editor:send-change", {
        file_id: props.selectedFile.id,
        project_id: projectId,
        username: localStorage.getItem('username'),
        code: newValue,
        newLog: {
          username: localStorage.getItem('username'),
          origin: 'user',
          removed: '',
          text: newValue,
          from_line: 1,
          from_ch: 0,
          to_line: 1,
          to_ch: 0,
          log_timestamp: new Date().toISOString()
        }
      });
    }
  };

  if (!props.selectedFile) {
    return (
      <Box sx={{ p: 3, color: "#666", display: "flex", alignItems: "center", height: "100%" }}>
        <Typography variant="h6">Select a file to start editing</Typography>
      </Box>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar for language/theme selection and live users */}
      <div style={{ padding: "8px", background: "#23272f", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ marginRight: 16, fontWeight: 600 }}>Monaco Code Editor</span>
        
        {/* Connection status */}
        <Chip 
          label={isConnected ? "Connected" : "Disconnected"} 
          color={isConnected ? "success" : "error"}
          size="small"
        />
        
        {/* Live users */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Live Users:</span>
          {liveUsers.map(user => (
            <Chip 
              key={user.username}
              label={user.username}
              size="small"
              variant="outlined"
              style={{ color: "#fff", borderColor: "#fff" }}
            />
          ))}
        </div>

        <label style={{ marginRight: 8 }}>
          Language:
          <select
            value={currentLanguage}
            onChange={e => setCurrentLanguage(e.target.value)}
            style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </label>
        <label style={{ marginRight: 8 }}>
          Theme:
          <select
            value={currentTheme}
            onChange={e => setCurrentTheme(e.target.value)}
            style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
          >
            {THEMES.map(theme => (
              <option key={theme.value} value={theme.value}>{theme.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Error and save messages */}
      {error && <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>}
      {saveMsg && <Alert severity="success" sx={{ m: 1 }}>{saveMsg}</Alert>}

      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
          </Box>
        ) : (
        <MonacoEditor
          height="100%"
          width="100%"
          language={currentLanguage}
          theme={currentTheme}
          value={code}
          onChange={handleEditorChange}
            onMount={handleEditorDidMount}
          options={{
            fontSize: 16,
            minimap: { enabled: true },
            automaticLayout: true,
            autoClosingBrackets: "always",
            formatOnType: true,
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
          }}
          />
        )}
      </div>

      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        <Button onClick={handleFormat} variant="outlined">Format</Button>
        <Button onClick={handleAISuggestion} variant="outlined">AI Suggest</Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
        {liveUsers.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {liveUsers.length} user(s) editing this file
          </Typography>
        )}
          </Box>
    </div>
  );
}

export default ModernCodeEditor; 