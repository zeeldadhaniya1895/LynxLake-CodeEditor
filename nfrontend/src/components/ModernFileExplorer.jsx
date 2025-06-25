import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert, IconButton, Paper } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FileTreeNode from "./FileTreeNode";
import useFileTreeSocket from "../hooks/useFileTreeSocket";
import {
  getFileTree,
  createNode,
  deleteNode,
  renameNode,
  buildFileTree,
} from "../utils/fileTreeApi";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socket";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

function ModernFileExplorer({ setSelectedFile, selectedFile, sidebarOpen, setSidebarOpen, sidebarWidth, setSidebarWidth }) {
  const { projectId } = useParams();
  const { socket } = useSocket();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch file tree from server
  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getFileTree(projectId);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      // Build tree from flat array
      const treeArr = buildFileTree(res.data);
      setTree(treeArr[0] || null); // Only use the single root folder
    } else if (res.success && Array.isArray(res.data) && res.data.length === 0) {
      setTree(null);
    } else {
      setError(res.message || "Failed to load file tree");
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Real-time socket events
  useFileTreeSocket(socket, projectId, {
    onFileTreeUpdated: () => fetchTree(),
    // ======= OLD CUSTOM EVENTS COMMENTED OUT =======
    // onNodeAdded: () => fetchTree(),
    // onNodeDeleted: () => fetchTree(),
    // onNodeRenamed: () => fetchTree(),
    // onNodeExpanded: () => fetchTree(),
    // ======= END OLD EVENTS =======
  });

  // CRUD handlers (professional socket+REST fallback)
  const handleAdd = async (parentNode, name, isFolder) => {
    if (socket && socket.connected) {
      socket.emit('file-explorer:crud', {
        action: 'add',
        parentId: parentNode.id,
        name,
        isFolder
      }, (response) => {
        if (!response?.success) setError(response?.message || 'Failed to add node');
      });
    } else {
      setError('Socket not connected, using fallback. Changes may not sync in real-time.');
    const res = await createNode(projectId, {
      name,
      isFolder,
      parentId: parentNode.id,
    });
    if (!res.success) setError(res.message || "Failed to add node");
      else fetchTree();
    }
  };

  const handleRename = async (node, newName) => {
    if (socket && socket.connected) {
      socket.emit('file-explorer:crud', {
        action: 'rename',
        nodeId: node.id,
        newName
      }, (response) => {
        if (!response?.success) setError(response?.message || 'Failed to rename node');
      });
    } else {
      setError('Socket not connected, using fallback. Changes may not sync in real-time.');
    const res = await renameNode(projectId, node.id, newName);
    if (!res.success) setError(res.message || "Failed to rename node");
      else fetchTree();
    }
  };

  const handleDelete = async (node) => {
    if (socket && socket.connected) {
      socket.emit('file-explorer:crud', {
        action: 'delete',
        nodeId: node.id
      }, (response) => {
        if (!response?.success) setError(response?.message || 'Failed to delete node');
      });
    } else {
      setError('Socket not connected, using fallback. Changes may not sync in real-time.');
    const res = await deleteNode(projectId, node.id);
    if (!res.success) setError(res.message || "Failed to delete node");
      else fetchTree();
    }
  };

  // Custom CSS for resizer handle
  const resizerStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
    height: '100%',
    cursor: 'ew-resize',
    background: 'rgba(0,0,0,0.08)',
    borderRadius: '0 8px 8px 0',
    zIndex: 10,
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'transparent', zIndex: 2 }}>
      {/* Sidebar: Resizable, toggleable */}
      <ResizableBox
        width={sidebarOpen ? sidebarWidth : 0}
        height={Infinity}
        minConstraints={[180, 0]}
        maxConstraints={[500, 9999]}
        axis="x"
        onResizeStop={(e, data) => setSidebarWidth(data.size.width)}
        handle={<span style={resizerStyle} />}
        resizeHandles={sidebarOpen ? ['e'] : []}
        style={{ transition: 'width 0.3s', zIndex: 20, display: sidebarOpen ? 'block' : 'none' }}
      >
        <Paper elevation={6} sx={{
          width: sidebarOpen ? sidebarWidth : 0,
          minWidth: sidebarOpen ? 180 : 0,
          maxWidth: 500,
          height: '100vh',
          transition: 'width 0.3s',
          overflow: 'hidden',
          borderRadius: '0 12px 12px 0',
          boxShadow: 6,
          bgcolor: '#161B22',
          borderRight: '1.5px solid #23272f',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderBottom: '1.5px solid #23272f', bgcolor: '#23272f' }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small" sx={{ color: '#58A6FF' }}>
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" sx={{ color: '#E6EDF3', ml: 1, flex: 1, fontWeight: 700, letterSpacing: 1 }}>
        Files
      </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} sx={{ color: "#58A6FF" }} />
                <Typography sx={{ color: "#A0B3D6" }}>Loading...</Typography>
        </Box>
      ) : error ? (
              <Alert severity="error" sx={{ mt: 2, bgcolor: '#2d2d2d', color: '#ff5252', border: '1px solid #ff5252' }}>{error}</Alert>
      ) : !tree ? (
              <Typography sx={{ color: "#A0B3D6" }}>(No files yet)</Typography>
      ) : (
        <FileTreeNode
          node={tree}
          onAdd={handleAdd}
          onRename={handleRename}
          onDelete={handleDelete}
                onSelect={setSelectedFile ? (node) => setSelectedFile(node) : undefined}
          selectedId={selectedFile?.id}
        />
      )}
          </Box>
        </Paper>
      </ResizableBox>
    </Box>
  );
}

export default ModernFileExplorer; 