// File tree real-time socket handlers for file manager (create, delete, etc.)
const { insertAndGetNewNodeToFileExplorer, deleteFileAndChildren } = require('./fileTreeUtils');
const pool = require('../db');

// Register all file explorer related socket events (CRUD, join/leave)
function registerFileExplorerEvents(io, socket, getProjectId, getUsername) {
  /**
   * Single CRUD event for add, delete, rename (acknowledgement based)
   * data.action: 'add' | 'delete' | 'rename'
   * data: { parentId, name, isFolder, nodeId, newName }
   */
  socket.on('file-explorer:crud', async (data, cb) => {
    const project_id = getProjectId();
    const username = getUsername();
    try {
      if (!project_id || !username) throw new Error('Missing project or user context');
      let result = null;
      switch (data.action) {
        case 'add':
          result = await insertAndGetNewNodeToFileExplorer(
            username, project_id, data.parentId, data.name, data.isFolder
          );
          io.to(project_id).emit('file_tree_updated', { type: 'add', updatedTreeId: result.file_tree_id, project_id });
          return cb && cb({ success: true, data: result });
        case 'delete':
          await deleteFileAndChildren(data.nodeId);
          io.to(project_id).emit('file_tree_updated', { type: 'delete', updatedTreeId: data.nodeId, project_id });
          return cb && cb({ success: true });
        case 'rename':
          await pool.query('UPDATE file_tree SET name = $1 WHERE file_tree_id = $2', [data.newName, data.nodeId]);
          io.to(project_id).emit('file_tree_updated', { type: 'rename', updatedTreeId: data.nodeId, project_id });
          return cb && cb({ success: true });
        default:
          throw new Error('Unknown action');
      }
    } catch (err) {
      return cb && cb({ success: false, message: err.message });
    }
  });

  // (If you want to keep legacy events for compatibility, you can keep them here)
  // ...
}

module.exports = function registerFileTreeSocketHandlers(io, socket, getProjectId, getUsername) {
  // Room join/leave for file tree
  socket.on('file-tree:join', ({ projectId }) => socket.join(projectId));
  socket.on('file-tree:leave', ({ projectId }) => socket.leave(projectId));
  // Register file explorer CRUD
  registerFileExplorerEvents(io, socket, getProjectId, getUsername);
  // (If you want to keep legacy events for compatibility, you can keep them here)
};

// Note: insertAndGetNewNodeToFileExplorer and deleteFileAndChildren are imported from fileTreeUtils.js for reuse. 