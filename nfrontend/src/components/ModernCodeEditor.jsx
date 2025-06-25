import React, { useState, useEffect, useRef } from "react";
import MonaLynxLakeor from "@monaco-editor/react";
import { Box, Typography, CircularProgress, Button, Alert, Chip, IconButton, Avatar, Stack, Tooltip, Menu, MenuItem } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socket";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import SaveIcon from "@mui/icons-material/Save";

import MoreVertIcon from '@mui/icons-material/MoreVert';
import InteractiveBackground from "./InteractiveBackground";
import logo from '../images/logo.jpg';

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

export default function ModernCodeEditor({
  value = "",
  language = DEFAULT_LANGUAGE,
  theme = DEFAULT_THEME,
  onChange,
  selectedFile,
  onLiveUsersChange,
  onCodeChange,
  onLanguageChange,
  ...props
}) {
  const { projectId } = useParams();
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
    if (onCodeChange) onCodeChange(value);
  }, [value, onCodeChange]);

  useEffect(() => {
    if (onLanguageChange) onLanguageChange(language);
  }, [language, onLanguageChange]);

  // Socket connection status
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Initial state sync
    setIsConnected(socket.connected);

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
    if (!socket || !selectedFile) {
      console.log("[ModernCodeEditor] Socket or selectedFile missing", { socket, selectedFile: selectedFile });
      return;
    }

    console.log("[ModernCodeEditor] Joining file for real-time sync", selectedFile.id);
    socket.emit("code-editor:join-file", { 
      file_id: selectedFile.id,
      project_id: projectId,
      username: localStorage.getItem('username')
    });

    // Listen for code changes from others
    const handleReceiveChange = (data) => {
      console.log("[ModernCodeEditor] Received code change", data);
      if (data.file_id === selectedFile.id && data.code !== value) {
        onCodeChange(data.code);
      }
    };

    // Listen for live users updates
    const handleLoadLiveUsers = (data) => {
      console.log("[ModernCodeEditor] Loading live users", data);
      if (data.file_id === selectedFile.id) {
        socket.emit("code-editor:load-live-users-send-back", {
          file_id: selectedFile.id,
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
      if (data.aUser && data.aUser.file_id === selectedFile.id) {
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
      if (data.file_id === selectedFile.id) {
        setLiveUsers(prev => prev.filter(user => user.username !== data.username));
      }
    };

    // Listen for cursor updates
    const handleReceiveCursor = (data) => {
      console.log("[CURSOR] handleReceiveCursor called", data, "local username:", localStorage.getItem('username'));
      if (data.file_id === selectedFile.id && data.username !== localStorage.getItem('username')) {
        updateCursorDecoration(data);
      }
    };

    const handleRemoveCursor = (data) => {
      if (data.file_id === selectedFile.id) {
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
        file_id: selectedFile.id,
        project_id: projectId,
        username: localStorage.getItem('username')
      });
    };
  }, [socket, selectedFile, value]);

  // Notify parent on liveUsers change
  useEffect(() => {
    if (onLiveUsersChange) onLiveUsersChange(liveUsers);
  }, [liveUsers, onLiveUsersChange]);

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
      if (socket && selectedFile) {
        socket.emit("code-editor:send-cursor", {
          file_id: selectedFile.id,
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
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    setSaveMsg("");
    setLiveUsers([]);
    
    fetch(`/api/editor/${projectId}/files/${selectedFile.id}/content`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) onCodeChange(data.data.file_data || "");
        else setError(data.message || "Failed to load file content");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedFile, projectId]);

  // Save file content
  const handleSave = async () => {
    if (!selectedFile) return;
    setSaving(true);
    setError("");
    setSaveMsg("");
    try {
      const res = await fetch(`/api/editor/${projectId}/files/${selectedFile.id}/save`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ file_data: value })
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
      const formatted = prettier.format(value, {
        parser: "babel",
        plugins: [parserBabel],
        singleQuote: true,
        semi: true,
      });
      onCodeChange(formatted);
      if (editorRef.current) editorRef.current.setValue(formatted);
    } catch (e) {
      setError("Formatting error: " + e.message);
    }
  };

  // AI Suggestion placeholder
  const handleAISuggestion = async () => {
    // Call your AI API here, get suggestion, insert at cursor
    // Example: onCodeChange(value + "\n// AI suggestion here");
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
  }, [value]);

  // Emit code changes to others
  const handleEditorChange = (newValue) => {
    console.log("[ModernCodeEditor] handleEditorChange called", newValue);
    onCodeChange(newValue);
    if (onChange) onChange(newValue);
    if (socket && selectedFile) {
      console.log("[ModernCodeEditor] Emitting code change", { file_id: selectedFile.id, code: newValue });
      socket.emit("code-editor:send-change", {
        file_id: selectedFile.id,
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

  // Temporary filename/tab
  const filename = selectedFile?.name || "Untitled";
  if (!selectedFile) {
    return (
      <Box sx={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <InteractiveBackground />
        <Box sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          textAlign: 'center',
          p: 4,
          bgcolor: '#23272f',
          borderRadius: 5,
          boxShadow: '0 8px 32px #0008, 0 0 0 2px #58A6FF44',
          border: '1.5px solid #23272f',
          minWidth: 340,
          maxWidth: 440,
          backdropFilter: 'blur(12px)',
          transition: 'box-shadow 0.3s, border 0.3s',
          '&:hover': {
            boxShadow: '0 12px 40px #1F6FEB33, 0 0 0 3px #58A6FF88',
            border: '1.5px solid #58A6FF',
          }
        }}>
          <img src={logo} alt="LynxLake Logo" style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 18, boxShadow: '0 2px 16px #58A6FF44', background: '#161B22', border: '2.5px solid #58A6FF' }} />
          <Typography variant="h5" sx={{ background: 'linear-gradient(90deg, #58A6FF 30%, #1F6FEB 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, mb: 1, letterSpacing: 1, fontSize: '2rem', textShadow: '0 2px 12px #58A6FF22' }}>
            Select a file to start
          </Typography>
          <Typography sx={{ color: '#A0B3D6', mb: 2, fontSize: '1.08rem' }}>
            To start editing, select a file or create a new one.
          </Typography>
          <Typography sx={{ color: '#58A6FF', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
            Welcome to LynxLake 🚀
          </Typography>
          <Typography sx={{ color: '#A0B3D6', fontSize: '1rem', fontStyle: 'italic' }}>
            "Let's make some bugs together! 🐞"
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar for language/theme selection and live users */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, bgcolor: '#23272f', borderBottom: '1.5px solid #23272f', boxShadow: '0 1px 6px #0004' }}>
        <Typography variant="subtitle1" sx={{ color: '#A0B3D6', fontWeight: 700, letterSpacing: 0.5, mr: 2, fontSize: '1.08rem' }}>
          Monaco Code Editor
        </Typography>
        <Chip 
          label={isConnected ? "Connected" : "Disconnected"} 
          sx={{
            bgcolor: isConnected ? '#00b894' : '#ff6b6b',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderRadius: 2,
            px: 1.5,
            height: 28,
          }}
          size="small"
        />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: '#A0B3D6', fontWeight: 500, fontSize: '1rem', mr: 1 }}>Language:</Typography>
          <select
            value={language}
            onChange={e => onLanguageChange(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, background: '#181c23', color: '#E6EDF3', border: '1.5px solid #23272f', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: '#A0B3D6', fontWeight: 500, fontSize: '1rem', mr: 1 }}>Theme:</Typography>
          <select
            value={currentTheme}
            onChange={e => setCurrentTheme(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, background: '#181c23', color: '#E6EDF3', border: '1.5px solid #23272f', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
          >
            {THEMES.map(theme => (
              <option key={theme.value} value={theme.value}>{theme.label}</option>
            ))}
          </select>
          </Box>
          {/* Save icon and more options inline */}
          <Tooltip title="Save">
            <IconButton onClick={handleSave} sx={{ color: '#58A6FF', bgcolor: '#181c23', border: '1.5px solid #23272f', borderRadius: 2, ml: 2, '&:hover': { bgcolor: '#23272f', color: '#1F6FEB', borderColor: '#58A6FF' }, transition: 'all 0.2s' }}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <MenuMoreOptions
            onFormat={handleFormat}
            onAISuggest={handleAISuggestion}
            iconSx={{ color: '#A0B3D6', ml: 0.5 }}
          />
        </Box>
      </Box>

      {/* Error and save messages */}
      {error && <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>}
      {saveMsg && <Alert severity="success" sx={{ m: 1 }}>{saveMsg}</Alert>}

      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
          </Box>
        ) : (
        <MonaLynxLakeor
          height="100%"
          width="100%"
          language={language}
          theme={currentTheme}
          value={value}
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
    </div>
  );
}

function MenuMoreOptions({ onFormat, onAISuggest, iconSx }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Tooltip title="More">
        <IconButton size="small" onClick={handleClick} sx={{ ...iconSx }}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <MenuItem onClick={() => { handleClose(); onFormat(); }}>Format</MenuItem>
        <MenuItem onClick={() => { handleClose(); onAISuggest(); }}>AI Suggest</MenuItem>
      </Menu>
    </>
  );
} 