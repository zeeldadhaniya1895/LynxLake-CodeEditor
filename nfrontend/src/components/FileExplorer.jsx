import React, { useEffect, useState } from "react";

// Components
import Folder from "./Folder";

// Hooks
import useAPI from "../hooks/api";
import useTraverseTree from "../hooks/use-traverse-tree";
import { useAuth } from "../context/auth";

// Material UI Components
import { Box, Skeleton } from "@mui/material";

// Build the tree from flat file structure
const buildFileTree = (fileTreeData, parentId = null) => {
  const items = fileTreeData
    .filter((item) => item.parent_id === parentId)
    .map((item) => ({
      id: item.file_tree_id,
      parentId: item.parent_id,
      name: item.name,
      isFolder: item.is_folder,
      expand: item.expand,
      fileTreeTimestamp: item.file_tree_timestamp,
      items: buildFileTree(fileTreeData, item.file_tree_id), // Recursively build the tree
    }))
    .sort((a, b) => {
      // Sort folders first, then files
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      // If both are the same type (both folders or both files), sort by name
      return a.name.localeCompare(b.name);
    });

  if (parentId === null) {
    return items; // Return all root-level folders/files as an array
  }

  return items;
};

function FileExplorer(props) {
  const { GET } = useAPI();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const {
    handleFileClick,
    selectedFileId,
    socket,
    projectId,
    setTabs,
    tabs,
    explorerData,
    setExplorerData,
  } = props;

  const { insertNode, deleteNode } = useTraverseTree();

  // Emit an event to add a node (file/folder)
  const handleInsertNode = (folderId, name, isFolder) => {
    socket.emit("file-explorer:insert-node", {
      new_node_parent_id: folderId,
      name: name,
      is_folder: isFolder,
    });
  };

  // Emit an event to delete a node
  const handleDeleteNode = (nodeId) => {
    setTabs(tabs.filter((tab) => tab.id !== nodeId));
    socket.emit("file-explorer:delete-node", { node_id: nodeId });
  };

  useEffect(() => {
    if (!socket) return;

    // Handler for inserting a node
    const insertHandler = (new_node) => {
      const finalTree = insertNode(explorerData, new_node);
      setExplorerData(finalTree); // Ensure immutability to trigger re-render
    };

    // Handler for deleting a node
    const deleteHandler = ({ node_id: nodeId }) => {
      const finalTree = deleteNode(explorerData, nodeId);
      setExplorerData(finalTree); // Ensure immutability to trigger re-render
    };

    socket.on("file-explorer:insert-node", insertHandler);
    socket.on("file-explorer:delete-node", deleteHandler);

    return () => {
      socket.off("file-explorer:insert-node", insertHandler);
      socket.off("file-explorer:delete-node", deleteHandler);
    };
  }, [socket, explorerData]); // Add explorerData as dependency

  // Fetch file tree from server
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    console.log('[FileExplorer] Fetching file tree for projectId:', projectId);
    fetch(`/api/editor/${projectId}/file-tree`)
      .then(res => res.json())
      .then(data => {
        console.log('[FileExplorer] file tree response:', data);
        if (data.success) {
          const tree = buildFileTree(data.data);
          setExplorerData(tree);
        } else {
          console.error('[FileExplorer] file tree error:', data.message);
        }
      })
      .catch(err => console.error('[FileExplorer] fetch error:', err))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Create file/folder
  const handleCreate = (name, isFolder, parentId) => {
    console.log('[FileExplorer] Creating', isFolder ? 'folder' : 'file', 'name:', name, 'parentId:', parentId);
    fetch(`/api/editor/${projectId}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, is_folder: isFolder, parent_id: parentId })
    })
      .then(res => res.json())
      .then(data => {
        console.log('[FileExplorer] create response:', data);
        if (data.success) setExplorerData(prev => [...prev, data.data]);
        else console.error('[FileExplorer] create error:', data.message);
      })
      .catch(err => console.error('[FileExplorer] create fetch error:', err));
  };

  // Delete file/folder
  const handleDelete = (fileId) => {
    console.log('[FileExplorer] Deleting file/folder:', fileId);
    fetch(`/api/editor/${projectId}/files/${fileId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        console.log('[FileExplorer] delete response:', data);
        if (data.success) setExplorerData(prev => prev.filter(f => f.file_tree_id !== fileId));
        else console.error('[FileExplorer] delete error:', data.message);
      })
      .catch(err => console.error('[FileExplorer] delete fetch error:', err));
  };

  // Rename file/folder
  const handleRename = (fileId, newName) => {
    console.log('[FileExplorer] Renaming file/folder:', fileId, 'to:', newName);
    fetch(`/api/editor/${projectId}/files/${fileId}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName })
    })
      .then(res => res.json())
      .then(data => {
        console.log('[FileExplorer] rename response:', data);
        if (data.success) setExplorerData(prev => prev.map(f => f.file_tree_id === fileId ? { ...f, name: newName } : f));
        else console.error('[FileExplorer] rename error:', data.message);
      })
      .catch(err => console.error('[FileExplorer] rename fetch error:', err));
  };

  // Expand/collapse
  const handleExpand = (file_tree_id, expand) => {
    console.log('[FileExplorer] setExpandData:', file_tree_id, expand);
    fetch('/editor/set-expand-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', username: user?.username },
      body: JSON.stringify({ file_tree_id, expand })
    })
      .then(res => res.json())
      .then(data => {
        console.log('[FileExplorer] setExpandData response:', data);
        if (!data.success) console.error('[FileExplorer] setExpandData error:', data.message);
      })
      .catch(err => console.error('[FileExplorer] setExpandData fetch error:', err));
  };

  return (
    <>
      {loading ? (Array.from({ length: 5 }, (_, index) => (
        <Box key={index} sx={{ px: "4px", py: "2px" }}>
          <Skeleton
            key={index}
            animation="wave"
            variant="rounded"
            height={26}
            sx={{ width: "100%", bgcolor: "#A6A6A6" }}
          />
        </Box>
      ))) : (
        Array.isArray(explorerData) && explorerData.length > 0
          ? (
              <Folder
                explorer={explorerData[0]} // Only use the single root folder
                handleInsertNode={handleInsertNode}
                handleDeleteNode={handleDeleteNode}
                handleFileClick={handleFileClick}
                selectedFileId={selectedFileId}
                makeExpandFolderParent={() => { }}
                paddingLeft={0}
              />
            )
          : null
      )}
    </>
  );
}

export default FileExplorer;
