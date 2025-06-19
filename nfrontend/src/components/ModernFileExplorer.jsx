import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
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

function ModernFileExplorer({ setSelectedFile, selectedFile }) {
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

  // CRUD handlers
  const handleAdd = async (parentNode, name, isFolder) => {
    const res = await createNode(projectId, {
      name,
      isFolder,
      parentId: parentNode.id,
    });
    if (!res.success) setError(res.message || "Failed to add node");
    // fetchTree(); // Real-time will update
  };

  const handleRename = async (node, newName) => {
    const res = await renameNode(projectId, node.id, newName);
    if (!res.success) setError(res.message || "Failed to rename node");
    // fetchTree(); // Real-time will update
  };

  const handleDelete = async (node) => {
    const res = await deleteNode(projectId, node.id);
    if (!res.success) setError(res.message || "Failed to delete node");
    // fetchTree(); // Real-time will update
  };

  const handleSelect = (node) => {
    if (!node.isFolder && setSelectedFile) setSelectedFile(node);
  };

  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#23272f" }}>
      <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
        Files
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} sx={{ color: "white" }} />
          <Typography sx={{ color: "#bbb" }}>Loading...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : !tree ? (
        <Typography sx={{ color: "#bbb" }}>(No files yet)</Typography>
      ) : (
        <FileTreeNode
          node={tree}
          onAdd={handleAdd}
          onRename={handleRename}
          onDelete={handleDelete}
          onSelect={handleSelect}
          selectedId={selectedFile?.id}
        />
      )}
    </Box>
  );
}

export default ModernFileExplorer; 