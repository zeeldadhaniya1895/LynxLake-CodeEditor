import { useEffect } from "react";

/**
 * useFileTreeSocket
 * @param {object} socket - socket.io instance
 * @param {string} projectId - current project id
 * @param {object} handlers - { onFileTreeUpdated }
 */
function useFileTreeSocket(socket, projectId, handlers = {}) {
  useEffect(() => {
    if (!socket || !projectId) return;
    // Join project room for file tree
    socket.emit("file-tree:join", { projectId });

    // Listen for new backend event
    if (handlers.onFileTreeUpdated) socket.on("file_tree_updated", handlers.onFileTreeUpdated);

    // ======= OLD CUSTOM EVENTS COMMENTED OUT =======
    /*
    if (handlers.onNodeAdded) socket.on("file-tree:node-added", handlers.onNodeAdded);
    if (handlers.onNodeDeleted) socket.on("file-tree:node-deleted", handlers.onNodeDeleted);
    if (handlers.onNodeRenamed) socket.on("file-tree:node-renamed", handlers.onNodeRenamed);
    if (handlers.onNodeExpanded) socket.on("file-tree:node-expanded", handlers.onNodeExpanded);
    */
    // ======= END OLD EVENTS =======

    return () => {
      // Leave project room
      socket.emit("file-tree:leave", { projectId });
      // Remove listeners
      if (handlers.onFileTreeUpdated) socket.off("file_tree_updated", handlers.onFileTreeUpdated);
      /*
      if (handlers.onNodeAdded) socket.off("file-tree:node-added", handlers.onNodeAdded);
      if (handlers.onNodeDeleted) socket.off("file-tree:node-deleted", handlers.onNodeDeleted);
      if (handlers.onNodeRenamed) socket.off("file-tree:node-renamed", handlers.onNodeRenamed);
      if (handlers.onNodeExpanded) socket.off("file-tree:node-expanded", handlers.onNodeExpanded);
      */
    };
  }, [socket, projectId, handlers]);

  // Emit helpers (optional, if needed for UI actions)
  // const emitAddNode = (data) => socket?.emit("file-tree:add-node", data);
  // const emitDeleteNode = (data) => socket?.emit("file-tree:delete-node", data);
  // const emitRenameNode = (data) => socket?.emit("file-tree:rename-node", data);
  // const emitExpandNode = (data) => socket?.emit("file-tree:expand-node", data);

  // return { emitAddNode, emitDeleteNode, emitRenameNode, emitExpandNode };
  return {};
}

export default useFileTreeSocket; 