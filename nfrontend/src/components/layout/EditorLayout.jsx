import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Filebar from "./Filebar";
import ModernCodeEditor from "../ModernCodeEditor";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CodeIcon from "@mui/icons-material/Code";
import ChatIcon from "@mui/icons-material/Chat";
import TerminalIcon from "@mui/icons-material/Terminal";
import Split from "react-split";
import '../../CSS/SplitGutter.css';
import { useState, useRef, useEffect } from "react";
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import { Typography, Avatar, Tooltip } from "@mui/material";
import Chat from '../Chat';
import { useUser } from '../../context/user';
import { getAuthHeaders } from '../../utils/fileTreeApi';

// Placeholder modules
// const Filebar = () => <Box sx={{ bgcolor: '#23272f', color: '#fff', height: '100%', p: 2 }}>Filebar</Box>;
const Terminal = ({ input, setInput, output, loading }) => (
  <Box sx={{
    bgcolor: '#23272f',
    borderRadius: 5,
    zIndex: 10,
    boxShadow: '0 8px 32px #0008, 0 0 0 2px #58A6FF44',
    border: '1.5px solid #23272f',
    color: '#E6EDF3',
    height: 320,
    p: 2,
    m: 2,
    width: 'calc(100% - 32px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textAlign: 'center',
    backdropFilter: 'blur(12px)',
    transition: 'box-shadow 0.3s, border 0.3s',
    '&:hover': {
      boxShadow: '0 12px 40px #1F6FEB33, 0 0 0 3px #58A6FF88',
      border: '1.5px solid #58A6FF',
    }
  }}>
    <Typography variant="h6" sx={{ background: 'linear-gradient(90deg, #58A6FF 30%, #1F6FEB 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, mb: 2, letterSpacing: 1, fontSize: '1.3rem', textShadow: '0 2px 12px #58A6FF22' }}>
      Terminal
    </Typography>
    <Split
      className="split"
      sizes={[50, 50]}
      minSize={120}
      width={'98vh'}
      expandToMin={true}
      gutterSize={8}
      direction="horizontal"
      style={{ display: 'flex', width: '100%', height: '100%' }}
    >
      {/* Input Section */}
      <Box sx={{
        bgcolor: '#161B22',
        borderRadius: 3,
        boxShadow: '0 1px 6px #0004',
        border: '1.5px solid #23272f',
        p: 2,
        m: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        height: '90%',
        minWidth: 120,
        gap: 2,
      }}>
        <input
          type="text"
          placeholder="Type your input..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#E6EDF3',
            fontSize: '1rem',
            fontFamily: 'JetBrains Mono, monospace',
            padding: '8px 0',
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
      </Box>
      {/* Output Section */}
      <Box sx={{
        bgcolor: '#181c23',
        borderRadius: 3,
        boxShadow: '0 1px 6px #0004',
        border: '1.5px solid #23272f',
        p: 2,
        m: 1,
        minWidth: 120,
        height: '90%',
        overflowY: 'auto',
        color: '#A0B3D6',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.98rem',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'flex-start',
      }}>
        {loading ? 'Running...' : (output || 'Output will appear here...')}
      </Box>
    </Split>
  </Box>
);

export default function EditorLayout() {
  // All useState hooks at the top
  const [terminalOpen, setTerminalOpen] = React.useState(true);
  const [overlayMode, setOverlayMode] = React.useState('full');
  const [filebarOpen, setFilebarOpen] = React.useState(true);
  const [chatOpen, setChatOpen] = React.useState(true);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [editorCode, setEditorCode] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('python');
  const [overlayPos, setOverlayPos] = useState({ left: 0, width: '100%' });
  const [liveUsers, setLiveUsers] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalLoading, setTerminalLoading] = useState(false);
  const { userInfo } = useUser();
  // refs
  const filebarRef = React.useRef(null);
  const editorRef = React.useRef(null);
  const chatRef = React.useRef(null);
  const rowRef = React.useRef(null);
  // splitSizes, minSize, maxSize helpers
  const getDefaultSplitSizes = (filebarOpen, chatOpen) => {
    if (filebarOpen && chatOpen) return [18, 64, 18];
    else if (filebarOpen && !chatOpen) return [20, 80, 0];
    else if (!filebarOpen && chatOpen) return [0, 80, 20];
    else return [0, 100, 0];
  };
  const getMinSizes = (filebarOpen, chatOpen) => [
    filebarOpen ? 80 : 0,
    120,
    chatOpen ? 80 : 0
  ];
  const getMaxSizes = (filebarOpen, chatOpen) => [
    filebarOpen ? 400 : 0,
    9999,
    chatOpen ? 400 : 0
  ];
  const [splitSizes, setSplitSizes] = useState(getDefaultSplitSizes(true, true));

  // Persistent state key
  const LAYOUT_STATE_KEY = 'editorLayoutState';

  // State restore on mount
  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_STATE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (typeof state.filebarOpen === 'boolean') setFilebarOpen(state.filebarOpen);
        if (typeof state.chatOpen === 'boolean') setChatOpen(state.chatOpen);
        if (typeof state.terminalOpen === 'boolean') setTerminalOpen(state.terminalOpen);
        if (Array.isArray(state.splitSizes)) setSplitSizes(state.splitSizes);
      } catch (e) { /* ignore */ }
    }
  }, []);

  // State save on change
  useEffect(() => {
    const state = {
      filebarOpen,
      chatOpen,
      terminalOpen,
      splitSizes
    };
    localStorage.setItem(LAYOUT_STATE_KEY, JSON.stringify(state));
  }, [filebarOpen, chatOpen, terminalOpen, splitSizes]);

  // splitPanels: Always render 3 panels (Filebar, Editor, Chat)
  let splitPanels = [
    <Box ref={filebarRef} key="filebar" sx={{ height: '100%', minWidth: 0, maxWidth: 400, overflow: 'hidden', display: filebarOpen ? 'block' : 'none' }}>
        <Filebar setSelectedFile={setSelectedFile} selectedFile={selectedFile} />
    </Box>,
    <Box ref={editorRef} key="editor" sx={{ height: '100%', minWidth: 120, width: '100%' }}>
      <ModernCodeEditor
        selectedFile={selectedFile}
        value={editorCode}
        language={editorLanguage}
        onCodeChange={setEditorCode}
        onLanguageChange={setEditorLanguage}
        onLiveUsersChange={setLiveUsers}
      />
    </Box>,
    <Box ref={chatRef} key="chat" sx={{ height: '100%', minWidth: 0, maxWidth: 400, overflow: 'hidden', display: chatOpen ? 'block' : 'none' }}>
      <Chat />
    </Box>
  ];

  // splitPanels.length change/scaffold ત્યારે splitSizes scaffold/reset
  useEffect(() => {
    setSplitSizes(getDefaultSplitSizes(filebarOpen, chatOpen));
  }, [filebarOpen, chatOpen]);

  // Overlay width calculation (update on split move)
  useEffect(() => {
    function updateOverlayPos() {
      if (overlayMode === 'editor' && editorRef.current && rowRef.current) {
        const rowRect = rowRef.current.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        setOverlayPos({
          left: editorRect.left - rowRect.left,
          width: editorRect.width,
        });
      } else {
        setOverlayPos({ left: 0, width: '100%' });
      }
    }
    updateOverlayPos();
    window.addEventListener('resize', updateOverlayPos);
    return () => window.removeEventListener('resize', updateOverlayPos);
  }, [overlayMode, filebarOpen, chatOpen]);

  // Split handle move/resize પછી overlayPos update/scaffold અને splitSizes update
  function handleSplitDrag(sizes) {
    // mismatch avoid: sizes length always match splitPanels.length
    if (Array.isArray(sizes) && sizes.length === splitPanels.length) {
      setSplitSizes(sizes);
    }
    setTimeout(() => {
      if (overlayMode === 'editor' && editorRef.current && rowRef.current) {
        const rowRect = rowRef.current.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        setOverlayPos({
          left: editorRect.left - rowRect.left,
          width: editorRect.width,
        });
      }
    }, 0);
  }

  // Run button handler
  const handleRun = async () => {
    if (!selectedFile) return;
    setTerminalLoading(true);
    setTerminalOutput('');
    try {
      // 1. Save code (fire-and-forget)
      fetch(`/api/editor/${selectedFile.projectId}/files/${selectedFile.id}/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ file_data: editorCode })
      });
      // 2. Execute code (await output)
      const res = await fetch('http://localhost:5002/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorCode, language: editorLanguage, input: terminalInput })
      });
      const data = await res.json();
      setTerminalOutput(data.output || data.error || 'No output');
    } catch (err) {
      setTerminalOutput('Error: ' + err.message);
    }
    setTerminalLoading(false);
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#0d1117', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Global Navbar */}
      <Box sx={{ width: '100%', bgcolor: '#23272f', borderBottom: '1.5px solid #23272f', minHeight: 48, display: 'flex', alignItems: 'center', px: 2, py: 1, zIndex: 40, boxShadow: '0 2px 12px #0006' }}>
        {/* Left: Project logo/name */}
        <Typography variant="h6" sx={{
          background: 'linear-gradient(90deg, #58A6FF 30%, #1F6FEB 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 900,
          letterSpacing: 1,
          mr: 3,
          fontSize: '1.5rem',
          textShadow: '0 2px 12px #58A6FF22',
          userSelect: 'none',
        }}>
          LynxLake
        </Typography>
        {/* Center: Filename/tab */}
        <Typography variant="subtitle1" sx={{ color: '#E6EDF3', fontWeight: 500, flex: 1, textAlign: 'center', letterSpacing: 0.5, fontSize: '1.1rem' }}>
          {selectedFile?.name || "Untitled"}
        </Typography>
        {/* Right: User/avatar/settings */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Live Users Avatars */}
          {liveUsers && liveUsers.length > 0 && (
            <Stack direction="row" spacing={-1} alignItems="center" sx={{ mr: 2 }}>
              {liveUsers.slice(0, 4).map((user, idx) => (
                <Tooltip key={user.username || user.userName || idx} title={user.username || user.userName}>
                  <Avatar
                    src={user.image || user.profileImage || undefined}
                    alt={user.username || user.userName || 'User'}
                    sx={{ width: 28, height: 28, border: '2px solid #58A6FF', boxShadow: '0 2px 8px #58A6FF33', ml: idx === 0 ? 0 : -1.5, bgcolor: '#181c23', fontWeight: 700, fontSize: '1rem' }}
                  >
                    {(user.username || user.userName || '?')[0]?.toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
              {liveUsers.length > 4 && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#23272f', color: '#58A6FF', fontWeight: 700, fontSize: '1rem', ml: -1.5 }}>
                  +{liveUsers.length - 4}
                </Avatar>
              )}
            </Stack>
          )}
          <Tooltip title={userInfo.fullName || userInfo.userName || 'Profile'}>
            <IconButton size="small" sx={{ color: '#A0B3D6', transition: 'color 0.2s', '&:hover': { color: '#58A6FF' } }}>
              <Avatar
                src={userInfo.profileImage || userInfo.image || undefined}
                alt={userInfo.fullName || userInfo.userName || 'U'}
                sx={{ width: 28, height: 28, bgcolor: '#161B22', border: '2px solid #23272f', transition: 'border 0.2s', '&:hover': { border: '2px solid #58A6FF' } }}
              >
                {(userInfo.fullName || userInfo.userName || 'U')[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      {/* Global Toolbar */}
      <Box sx={{ width: '100%', bgcolor: '#23272f', borderBottom: '1.5px solid #23272f', minHeight: 40, display: 'flex', alignItems: 'center', px: 2, py: 0.5, gap: 1, zIndex: 39, boxShadow: '0 1px 6px #0004' }}>
        <Tooltip title="Save"><IconButton size="small" sx={{ color: '#58A6FF', transition: 'color 0.2s', '&:hover': { color: '#1F6FEB' } }}><SaveIcon /></IconButton></Tooltip>
        <Tooltip title="Run"><IconButton size="small" sx={{ color: '#58A6FF', transition: 'color 0.2s', '&:hover': { color: '#1F6FEB' } }} onClick={handleRun}><PlayArrowIcon /></IconButton></Tooltip>
        <Tooltip title="Format"><IconButton size="small" sx={{ color: '#58A6FF', transition: 'color 0.2s', '&:hover': { color: '#1F6FEB' } }}><FormatAlignLeftIcon /></IconButton></Tooltip>
        <Tooltip title="Undo"><IconButton size="small" sx={{ color: '#A0B3D6', transition: 'color 0.2s', '&:hover': { color: '#58A6FF' } }}><UndoIcon /></IconButton></Tooltip>
        <Tooltip title="Redo"><IconButton size="small" sx={{ color: '#A0B3D6', transition: 'color 0.2s', '&:hover': { color: '#58A6FF' } }}><RedoIcon /></IconButton></Tooltip>
        {/* Section toggles: Filebar, Chat, Terminal */}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Toggle Filebar"><IconButton onClick={() => setFilebarOpen((v) => !v)} color={filebarOpen ? 'primary' : 'default'} size="small" sx={{ transition: 'color 0.2s', '&:hover': { color: '#58A6FF' } }}><MenuIcon /></IconButton></Tooltip>
        <Tooltip title="Toggle Chat"><IconButton onClick={() => setChatOpen((v) => !v)} color={chatOpen ? 'primary' : 'default'} size="small" sx={{ transition: 'color 0.2s', '&:hover': { color: '#58A6FF' } }}><ChatIcon /></IconButton></Tooltip>
        <Tooltip title="Toggle Terminal"><IconButton onClick={() => setTerminalOpen((v) => !v)} color={terminalOpen ? 'primary' : 'default'} size="small" sx={{ transition: 'color 0.2s', '&:hover': { color: '#58A6FF' } }}><TerminalIcon /></IconButton></Tooltip>
      </Box>
      {/* Overlay mode toggle buttons */}
      <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, right: 24, zIndex: 30 }}>
        <Button
          variant={overlayMode === 'full' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setOverlayMode('full')}
        >
          Overlay Full Width
        </Button>
        <Button
          variant={overlayMode === 'editor' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setOverlayMode('editor')}
        >
          Overlay Editor Only
        </Button>
      </Stack>
      {/* Main row + Terminal: vertical split */}
      <Split
        key={`${filebarOpen}-${chatOpen}-${terminalOpen}`}
        className="split"
        sizes={[75, 25]}
        minSize={[120, 80]}
        direction="vertical"
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
        gutterSize={8}
      >
        {/* Top: Main row (filebar/editor/chat) */}
        <Box ref={rowRef} sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flex: 1 }}>
          <Split
            key={splitPanels.length}
            className="split"
            sizes={splitSizes}
            minSize={getMinSizes(filebarOpen, chatOpen)}
            maxSize={getMaxSizes(filebarOpen, chatOpen)}
            expandToMin={true}
            gutterSize={8}
            direction="horizontal"
            style={{ display: 'flex', width: '100%', height: '100%' }}
            onDrag={handleSplitDrag}
            onDragEnd={handleSplitDrag}
          >
            {splitPanels}
          </Split>
        </Box>
        {/* Bottom: Terminal */}
        {terminalOpen ? <Terminal input={terminalInput} setInput={setTerminalInput} output={terminalOutput} loading={terminalLoading} /> : null}
      </Split>
    </Box>
  );
} 