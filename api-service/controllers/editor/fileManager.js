const pool = require('../../db');
const { v4: uuidv4 } = require('uuid');

/**
 * File Manager Controller
 * Handles all file and folder operations
 */

// Get file tree for a project
const getFileTree = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('[getFileTree] projectId:', projectId);
    const query = `
      SELECT 
        file_tree_id,
        name,
        is_folder,
        parent_id,
        project_id,
        file_tree_timestamp
      FROM file_tree
      WHERE project_id = $1
      ORDER BY name ASC
    `;
    const result = await pool.query(query, [projectId]);
    console.log('[getFileTree] result:', result.rows);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[getFileTree] error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file tree',
      error: error.message
    });
  }
};

// ======= NEW INDUSTRY-LEVEL CRUD LOGIC =======

// Helper: Access control check (role + file_permissions)
async function checkAccess(req, projectId, fileTreeId, requiredAction) {
  // 1. Get user role from project_owners
  // 2. Get file/folder permissions from file_tree (file_permissions)
  // 3. Check if user has requiredAction (read/write/delete) permission
  // 4. Return true/false
  // NOTE: Implement actual logic as per your access model
  return true; // Placeholder: always allow
}

// Create file or folder
const createFileOrFolder = async (req, res) => {
  const io = req.app.get('io'); // Socket.io instance
  try {
    const { projectId } = req.params;
    const { name, is_folder, parent_id } = req.body;
    const username = req.user.username;
    // Access check
    const hasAccess = await checkAccess(req, projectId, parent_id, 'write');
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }
    // Create file_tree entry
    const file_tree_id = require('uuid').v4();
    const now = new Date();
    const fileTreeQuery = `
      INSERT INTO file_tree (file_tree_id, name, is_folder, parent_id, project_id, file_tree_timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const fileTreeResult = await pool.query(fileTreeQuery, [
      file_tree_id, name, is_folder, parent_id, projectId, now
    ]);
    // If file, create files entry
    if (!is_folder) {
      const filesQuery = `
        INSERT INTO files (file_id, project_id, file_created_by, file_name, file_extension, file_data, file_timestamp, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      await pool.query(filesQuery, [
        file_tree_id, projectId, username, name, 'txt', '', now, now
      ]);
    }
    // Emit socket event
    if (io) io.to(projectId).emit('file_tree_updated', { type: 'add', updatedTreeId: file_tree_id });
    res.json({ success: true, data: fileTreeResult.rows[0], message: `${is_folder ? 'Folder' : 'File'} created successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create file or folder', error: error.message });
  }
};

// Rename file or folder
const renameFileOrFolder = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { projectId, fileTreeId } = req.params;
    const { newName } = req.body;
    // Access check
    const hasAccess = await checkAccess(req, projectId, fileTreeId, 'write');
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }
    // Update file_tree
    const updateTreeQuery = `
      UPDATE file_tree SET name = $1, file_tree_timestamp = $2 WHERE file_tree_id = $3 AND project_id = $4 RETURNING *
    `;
    const treeResult = await pool.query(updateTreeQuery, [newName, new Date(), fileTreeId, projectId]);
    if (treeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'File or folder not found' });
    }
    // If file, update files table
    if (!treeResult.rows[0].is_folder) {
      const updateFileQuery = `
        UPDATE files SET file_name = $1, updated_at = $2 WHERE file_id = $3 AND project_id = $4
      `;
      await pool.query(updateFileQuery, [newName, new Date(), fileTreeId, projectId]);
    }
    // Emit socket event
    if (io) io.to(projectId).emit('file_tree_updated', { type: 'rename', updatedTreeId: fileTreeId });
    res.json({ success: true, data: treeResult.rows[0], message: 'File or folder renamed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to rename file or folder', error: error.message });
  }
};

// Delete file or folder
const deleteFileOrFolder = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { projectId, fileTreeId } = req.params;
    // Access check
    const hasAccess = await checkAccess(req, projectId, fileTreeId, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }
    // Get is_folder
    const getQuery = `SELECT is_folder, name FROM file_tree WHERE file_tree_id = $1 AND project_id = $2`;
    const getResult = await pool.query(getQuery, [fileTreeId, projectId]);
    if (getResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'File or folder not found' });
    }
    const { is_folder, name } = getResult.rows[0];
    // If folder, delete all children recursively (implement as needed)
    if (is_folder) {
      // TODO: Recursive delete logic
    }
    // Delete from file_tree
    const deleteTreeQuery = `DELETE FROM file_tree WHERE file_tree_id = $1 AND project_id = $2`;
    await pool.query(deleteTreeQuery, [fileTreeId, projectId]);
    // If file, delete from files table
    if (!is_folder) {
      const deleteFileQuery = `DELETE FROM files WHERE file_id = $1 AND project_id = $2`;
      await pool.query(deleteFileQuery, [fileTreeId, projectId]);
    }
    // Emit socket event
    if (io) io.to(projectId).emit('file_tree_updated', { type: 'delete', updatedTreeId: fileTreeId });
    res.json({ success: true, message: `${is_folder ? 'Folder' : 'File'} deleted successfully`, data: { id: fileTreeId, name, is_folder } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete file or folder', error: error.message });
  }
};

// ======= END NEW CRUD LOGIC =======

// ======= SOCKET.IO INTEGRATION PLACEHOLDER =======
// Socket emit karva mate io instance required che. CRUD operation pachi:
// io.to(projectId).emit('file_tree_updated', { type: 'add'|'delete'|'rename', updatedTree: [...] })
// ======= END SOCKET.IO PLACEHOLDER =======

// Set expand/collapse state for folders (store in file_tree_expand_user)
const setExpandData = async (req, res) => {
  try {
    const { file_tree_id, expand } = req.body;
    const { username } = req.headers;
    console.log('[setExpandData] file_tree_id:', file_tree_id, 'expand:', expand, 'username:', username);
    const query = `
      INSERT INTO file_tree_expand_user (user_id, file_tree_id, is_expand)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, file_tree_id)
      DO UPDATE SET is_expand = $3, file_tree_expand_user_timestamp = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [username, file_tree_id, expand]);
    console.log('[setExpandData] updated:', result.rows[0]);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Expand state updated successfully'
    });
  } catch (error) {
    console.error('[setExpandData] error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expand state',
      error: error.message
    });
  }
};

module.exports = {
  getFileTree,
  createFileOrFolder,
  deleteFileOrFolder,
  renameFileOrFolder,
  setExpandData
}; 