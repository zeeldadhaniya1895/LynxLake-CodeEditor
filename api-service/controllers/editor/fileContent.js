const pool = require('../../db');

/**
 * File Content Controller
 * Handles all file content operations
 */

// Get file content
const getFileContent = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const query = `
      SELECT file_id, file_name, file_data, file_timestamp, updated_at
      FROM files
      WHERE file_id = $1 AND project_id = $2
    `;
    const result = await pool.query(query, [fileId, projectId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    const fileData = result.rows[0];
    res.json({
      success: true,
      data: {
        file_id: fileData.file_id,
        file_name: fileData.file_name,
        file_data: fileData.file_data || '',
        file_timestamp: fileData.file_timestamp,
        updated_at: fileData.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file content',
      error: error.message
    });
  }
};

// Save file content
const saveFileContent = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { file_data } = req.body;
    const query = `
      UPDATE files 
      SET file_data = $1, updated_at = $2
      WHERE file_id = $3 AND project_id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [file_data || '', new Date(), fileId, projectId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    res.json({
      success: true,
      data: {
        file_id: result.rows[0].file_id,
        file_name: result.rows[0].file_name,
        file_data: result.rows[0].file_data,
        updated_at: result.rows[0].updated_at
      },
      message: 'File content saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save file content',
      error: error.message
    });
  }
};

// Get file logs
const getFileLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const query = `
      SELECT * FROM logs WHERE project_id = $1 ORDER BY logs_timestamp DESC LIMIT 100
    `;
    const result = await pool.query(query, [projectId]);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file logs',
      error: error.message
    });
  }
};

// Save file log
const saveFileLog = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      file_id,
      username,
      user_role,
      action_type,
      removed,
      text,
      from_line,
      from_ch,
      to_line,
      to_ch,
      origin
    } = req.body;
    const query = `
      INSERT INTO logs (
        file_id, project_id, username, user_role, action_type, removed, text, from_line, from_ch, to_line, to_ch, origin, logs_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const result = await pool.query(query, [
      file_id, projectId, username, user_role, action_type, removed, text, from_line, from_ch, to_line, to_ch, origin, new Date()
    ]);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Log saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save file log',
      error: error.message
    });
  }
};

// Get initial tabs (recent files)
const getInitialTabs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const query = `
      SELECT file_id, file_name, file_timestamp, updated_at
      FROM files
      WHERE project_id = $1
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    const result = await pool.query(query, [projectId]);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch initial tabs',
      error: error.message
    });
  }
};

module.exports = {
  getFileContent,
  saveFileContent,
  getFileLogs,
  saveFileLog,
  getInitialTabs
}; 