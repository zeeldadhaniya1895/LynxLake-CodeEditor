const pool = require("../../db");
const queries = require("../../queries/project");
const { v4: uuidv4 } = require("uuid");
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { logActivity } = require("../../utils/activityLogger");

const getAllFiles = async (req, resp) => {
  if (!req.query.projectId) {
    return resp.status(400).json({ message: "Project ID is required" });
  }

  try {
    await pool.query(queries.makeAllActiveFilesToLive, [req.user.username]);

    const results = await pool.query(queries.getAllFiles, [
      req.query.projectId,
    ]);

    return resp.status(200).json(results.rows);
  } catch (err) {
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const createANewFile = async (req, resp) => {
  const { newFile, extension, projectId, filePermissions } = req.body;

  if (!newFile) {
    return resp.status(400).json({ message: "newFile name is required" });
  }

  try {
    const uniqueId = uuidv4();
    const results = await pool.query(queries.createANewFile, [
      uniqueId,
      projectId,
      req.user.username,
      newFile,
      extension,
      JSON.stringify(filePermissions || {})
    ]);

    // Log activity
    await logActivity(req, projectId, req.user.username, 'file_created', { fileName: newFile });

    return resp.status(200).json({ message: "File Created Successfully" });
  } catch (err) {
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllActiveFiles = async (req, resp) => {
  if (!req.query.projectId) {
    return resp.status(400).json({ message: "Project ID is required" });
  }

  try {
    const results = await pool.query(queries.getAllActiveFiles, [
      req.query.projectId,
      req.user.username,
    ]);

    return resp.status(200).json(results.rows);
  } catch (err) {
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const getFileTree = async (req, resp) => {
  const { projectId } = req.query;

  try {
    const results = await pool.query(queries.getFileTree, [projectId, req.user.user_id]);
    return resp.status(200).json(results.rows);
  } catch (err) {
    console.error("Error in getFileTree for projectId:", projectId, err);
    return resp.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const getInitialTabs = async (req, resp) => {
  const { projectId } = req.query;

  try {
    const results = await pool.query(queries.getInitialTabs, [projectId, req.user.user_id]);
    return resp.status(200).json(results.rows);
  } catch (err) {
    console.error("Error in getInitialTabs for projectId:", projectId, err);
    return resp.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const setExpandData = async (req, resp) => {
  const { file_tree_id, expand } = req.body;

  // Validate file_tree_id
  if (!file_tree_id) {
    console.error("setExpandData: file_tree_id is missing or undefined");
    return resp.status(400).json({ message: "file_tree_id is required" });
  }

  // Check if file_tree_id is a valid UUID format (36 characters with hyphens)
  if (typeof file_tree_id !== "string" || file_tree_id.length !== 36 || !file_tree_id.includes("-")) {
    console.error("setExpandData: Invalid file_tree_id format:", file_tree_id);
    return resp.status(400).json({ message: "Invalid file_tree_id format" });
  }

  // Validate expand parameter
  if (typeof expand !== "boolean") {
    console.error("setExpandData: expand must be a boolean, got:", typeof expand);
    return resp.status(400).json({ message: "expand must be a boolean" });
  }

  try {
    console.log("setExpandData: Processing request with file_tree_id:", file_tree_id, "expand:", expand);
    await pool.query(queries.setExpandData, [file_tree_id, req.user.username, expand]);
    return resp.status(200).json({ message: "File Tree Data Updated" });
  } catch (err) {
    console.error("setExpandData: Database error:", err);
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const saveFile = async (req, res) => {
  const { projectId, fileId, content } = req.body;

  console.log("saveFile: Received request with projectId:", projectId, "fileId:", fileId, "content length:", content?.length);

  // Validate required parameters
  if (!fileId) {
    console.error("saveFile: fileId is missing");
    return res.status(400).json({ message: "fileId is required" });
  }

  if (!projectId) {
    console.error("saveFile: projectId is missing");
    return res.status(400).json({ message: "projectId is required" });
  }

  if (content === undefined || content === null) {
    console.error("saveFile: content is missing");
    return res.status(400).json({ message: "content is required" });
  }

  try {
    // First check if file exists
    const fileCheck = await pool.query("SELECT file_id FROM files WHERE file_id = $1 AND project_id = $2", [fileId, projectId]);
    
    if (fileCheck.rows.length === 0) {
      console.error("saveFile: File not found with fileId:", fileId, "projectId:", projectId);
      return res.status(404).json({ message: "File not found" });
    }

    console.log("saveFile: File found, updating content...");
    
    await pool.query(queries.saveFile, [content, fileId]);
    
    console.log("saveFile: Content saved successfully for fileId:", fileId);
    
    await logActivity(req, projectId, req.user.username, 'file_saved', { fileId });
    return res.status(200).json({ message: "File saved successfully!" });
  } catch (err) {
    console.error("Error saving file:", err);
    return res.status(500).json({ message: "Internal server error. Failed to save file." });
  }
};

const getInitialContentOfFile = async (req, res) => {
  const { fileId, projectId } = req.params;

  console.log("getInitialContentOfFile: Searching for fileId:", fileId, "projectId:", projectId);

  // Validate required parameters
  if (!fileId) {
    console.error("getInitialContentOfFile: fileId is missing");
    return res.status(400).json({ message: "fileId is required" });
  }

  if (!projectId) {
    console.error("getInitialContentOfFile: projectId is missing");
    return res.status(400).json({ message: "projectId is required" });
  }

  try {
    // First check if file exists and belongs to the project
    const fileCheck = await pool.query("SELECT file_id FROM files WHERE file_id = $1 AND project_id = $2", [fileId, projectId]);
    
    if (fileCheck.rows.length === 0) {
      console.error("getInitialContentOfFile: File not found with fileId:", fileId, "projectId:", projectId);
      return res.status(404).json({ message: "File not found." });
    }

    console.log("getInitialContentOfFile: File found, fetching content...");
    
    const results = await pool.query(queries.getInitialContentOfFile, [fileId]);
    console.log("getInitialContentOfFile: Query results:", results.rows.length, "rows found");
    
    if (results.rows.length > 0) {
      const content = results.rows[0].content;
      console.log("getInitialContentOfFile: Content length:", content?.length);
      return res.status(200).json({ content: content || "" });
    } else {
      console.log("getInitialContentOfFile: No content found for fileId:", fileId);
      return res.status(200).json({ content: "" });
    }
  } catch (err) {
    console.error("Error fetching file content:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const exportProject = async (req, res) => {
  const { projectId } = req.params;
  const outputZipPath = path.join(__dirname, `../../exports/project_${projectId}.zip`);

  try {
    // Ensure the exports directory exists
    const exportsDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = fs.createWriteStream(outputZipPath);

    archive.pipe(output);

    // Fetch all files and directories for the project
    const fileTreeResult = await pool.query(queries.getProjectFileTreeForExport, [projectId]);
    const fileTree = fileTreeResult.rows;

    // Build a map for easy lookup of children
    const treeMap = new Map();
    fileTree.forEach(item => {
        if (!treeMap.has(item.parent_id)) {
            treeMap.set(item.parent_id, []);
        }
        treeMap.get(item.parent_id).push(item);
    });

    // Recursive function to process tree nodes
    const processNode = (node, currentPath) => {
        if (node.is_directory) {
            // archive.directory handles creation of directory entries
            if (node.file_tree_id !== null) { // Only add non-root directories explicitly
                archive.directory(currentPath, currentPath);
            }
            
            const children = treeMap.get(node.file_tree_id);
            if (children) {
                children.forEach(child => {
                    processNode(child, path.join(currentPath, child.name));
                });
            }
        } else {
            archive.append(node.content || '', { name: currentPath });
        }
    };

    // Find the root of the project file tree
    const rootNode = fileTree.find(item => item.parent_id === null && item.project_id === projectId);
    if (rootNode) {
        processNode(rootNode, rootNode.name);
    } else {
        return res.status(404).json({ message: "Project root not found." });
    }

    archive.finalize();

    output.on('close', () => {
      console.log(`Project ${projectId} exported successfully to ${outputZipPath}`);
      res.download(outputZipPath, `project_${projectId}.zip`, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).json({ message: "Error downloading exported project." });
        }
        // Clean up the generated zip file after download
        fs.unlink(outputZipPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temporary zip file:', unlinkErr);
        });
      });
      logActivity(req, projectId, req.user.username, 'project_exported', { outputZipPath });
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archiver warning:', err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      res.status(500).json({ message: "Error archiving project files." });
    });
  } catch (err) {
    console.error("Error exporting project:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  const { projectId } = req.body; // Assuming projectId is sent in body for logging

  try {
    await pool.query(queries.deleteLiveUsersForFile, [fileId]);
    await pool.query(queries.deleteFileTreeExpandUserForFile, [fileId]);
    await pool.query(queries.deleteFileById, [fileId]);

    await logActivity(req, projectId, req.user.username, 'file_deleted', { fileId });

    return res.status(200).json({ message: "File deleted successfully." });
  } catch (err) {
    console.error("Error deleting file:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllFiles,
  createANewFile,
  getAllActiveFiles,
  getFileTree,
  getInitialTabs,
  setExpandData,
  saveFile,
  getInitialContentOfFile,
  exportProject,
  deleteFile,
}; 