const express = require('express');
const router = express.Router();

// Import controllers
const fileManagerController = require('../controllers/editor/fileManager');
const fileContentController = require('../controllers/editor/fileContent');

// Import middlewares
const { verifyTokenAndAuthorization } = require('../middlewares/verifyUser');
const { checkProjectAccess, requireRole } = require('../middlewares/projectAuth');

/**
 * File Manager Routes
 */

// Get file tree for a project
router.get('/:projectId/file-tree', verifyTokenAndAuthorization, checkProjectAccess, fileManagerController.getFileTree);

// ======= OLD ENDPOINTS COMMENTED OUT =======
/*
// Create new file or folder
router.post('/:projectId/create', verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin', 'editor']), fileManagerController.createFileOrFolder);
// Rename file or folder
router.put('/:projectId/files/:fileId/rename', verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin', 'editor']), fileManagerController.renameFileOrFolder);
// Delete file or folder
router.delete('/:projectId/files/:fileId', verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), fileManagerController.deleteFileOrFolder);
*/
// ======= END OLD ENDPOINTS =======

// ======= NEW RESTFUL FILE MANAGER ENDPOINTS =======
// Create file or folder
router.post('/projects/:projectId/file-tree', verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin', 'editor']), fileManagerController.createFileOrFolder);
// Rename file or folder
router.put('/projects/:projectId/file-tree/:fileTreeId', verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin', 'editor']), fileManagerController.renameFileOrFolder);
// Delete file or folder
router.delete('/projects/:projectId/file-tree/:fileTreeId', verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin', 'editor']), fileManagerController.deleteFileOrFolder);
// ======= END NEW ENDPOINTS =======

// Set expand/collapse state for folders
router.post('/set-expand-data', verifyTokenAndAuthorization, fileManagerController.setExpandData);

/**
 * File Content Routes
 */

// Get file content
router.get('/:projectId/files/:fileId/content', verifyTokenAndAuthorization, checkProjectAccess, fileContentController.getFileContent);

// Save file content
router.post('/:projectId/files/:fileId/save', verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin', 'editor']), fileContentController.saveFileContent);

// Get file logs
router.get('/:projectId/logs', verifyTokenAndAuthorization, checkProjectAccess, fileContentController.getFileLogs);

// Save file log
router.post('/:projectId/logs', verifyTokenAndAuthorization, checkProjectAccess, fileContentController.saveFileLog);

// Get initial tabs
router.get('/:projectId/initial-tabs', verifyTokenAndAuthorization, checkProjectAccess, fileContentController.getInitialTabs);

module.exports = router; 