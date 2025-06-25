import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FileTreeNode from "../FileTreeNode";
import useFileTreeSocket from "../../hooks/useFileTreeSocket";
import {
  getFileTree,
  createNode,
  deleteNode,
  renameNode,
  buildFileTree,
} from "../../utils/fileTreeApi";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/socket";

function Filebar({ setSelectedFile, selectedFile }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Real-time socket events
  useFileTreeSocket(socket, projectId, {
    onFileTreeUpdated: () => fetchTree(),
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

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1.5px solid #23272f',
      bgcolor: '#23272f',
      borderRadius: '18px 0 0 18px',
      boxShadow: '0 4px 24px #0008, 0 0 0 1.5px #333',
      p: 0.5,
      m: 1,
      minWidth: 90,
      maxWidth: 400,
      transition: 'box-shadow 0.2s, border 0.2s',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderBottom: '1.5px solid #23272f', bgcolor: 'transparent' }}>
        <IconButton size="small" sx={{ color: '#58A6FF', transition: 'color 0.2s', '&:hover': { color: '#1F6FEB' } }} disabled>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{
          background: 'linear-gradient(90deg, #58A6FF 30%, #1F6FEB 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          ml: 1, flex: 1, fontWeight: 900, letterSpacing: 1, fontSize: '1.2rem',
          textShadow: '0 2px 12px #58A6FF22',
        }}>
          Files
        </Typography>
      </Box>
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
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
    </Box>
  );
}

export default Filebar; 