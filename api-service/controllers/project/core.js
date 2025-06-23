const { executeQuery } = require("../../utils/dbUtils");
const queries = require("../../queries/project");
const { v4: uuidv4 } = require("uuid");
const { logActivity } = require("../../utils/activityLogger");

const getAllProjects = async (req, resp) => {
  try {
    if (!req.user || !req.user.id) {
      return resp.status(401).json({ message: "Unauthorized access" });
    }

    const results = await executeQuery(queries.getAllProjects, [req.user.username]);
    return resp.status(200).json(results.rows);
  } catch (error) {
    console.log(error);
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const addProject = async (req, resp) => {
  const { projectName, projectDescription, isPublic, allowPublicAccess } = req.body;

  if (!projectName) {
    return resp.status(400).json({ message: "Project name is required." });
  }

  try {
    const projectId = uuidv4();

    // Insert the project details
    await executeQuery(queries.addProjects, [
      projectId,
      req.user.username,
      projectName,
      projectDescription || '',
      isPublic || false,
      allowPublicAccess || false
    ]);

    // Associate the project with the owner (creator gets 'owner' role)
    await executeQuery(queries.addProjectOwners, [projectId, req.user.username, 'owner', null]);

    // Create the initial file tree structure for the project
    const fileTreeId = uuidv4();
    await executeQuery(queries.addFileTree, [
      fileTreeId,
      projectId,
      null, // Root directory (or null for no parent)
      projectName,
      true, // Indicates that this is a directory (root)
    ]);

    // Log activity
    await logActivity(req, projectId, req.user.username, 'project_created', { projectName });

    const { rows } = await executeQuery(queries.getAllProjects, [req.user.username]);

    return resp
      .status(201)
      .json({ project_id: projectId, message: "Project added successfully.", projects: rows });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({ message: "Internal Server Error." });
  }
};

const getProjectName = async (req, resp) => {
  try {
    const results = await executeQuery(queries.getProjectName, [
      req.query.projectId,
      req.user.username,
    ]);

    return resp.status(200).json(results.rows[0]);
  } catch (err) {
    console.log(err);
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProjectName = async (req, res) => {
  try {
    const { projectId, newProjectName } = req.body;
    const { username } = req.user;

    if (!projectId || !newProjectName) {
      return res.status(400).json({ message: "Project ID and new project name are required!" });
    }

    // Check if the new project name already exists for this user
    const existingProject = await executeQuery(queries.checkProjectNameExists, [username, newProjectName.trim()]);
    if (existingProject.rows.length > 0) {
      return res.status(409).json({ message: "A project with this name already exists for your account." });
    }

    // Update the project name
    await executeQuery(queries.updateProjectName, [newProjectName.trim(), projectId]);

    // Log activity
    await logActivity(req, projectId, username, 'project_renamed', { newName: newProjectName.trim() });

    // Fetch all projects again to send updated list to frontend
    const updatedProjects = await executeQuery(queries.getAllProjects, [username]);

    return res.status(200).json({ message: "Project renamed successfully!", projects: updatedProjects.rows });
  } catch (err) {
    console.error("Error renaming project:", err);
    return res.status(500).json({ message: "Internal server error. Failed to rename project." });
  }
};

const updateProjectSettings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { isPublic, allowPublicAccess } = req.body;

    await executeQuery(queries.updateProjectSettings, [projectId, isPublic, allowPublicAccess]);

    // Log activity
    await logActivity(req, projectId, req.user.username, 'project_settings_updated', { isPublic, allowPublicAccess });

    const updatedProjects = await executeQuery(queries.getAllProjects, [req.user.username]);

    return res.status(200).json({ message: "Project settings updated successfully", projects: updatedProjects.rows });
  } catch (err) {
    console.error('Error updating project settings:', err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const { is_admin } = req.body; // Assuming is_admin is passed to differentiate how to delete

  try {
    // Log activity BEFORE deleting the project (to avoid foreign key constraint issues)
    await logActivity(req, projectId, req.user.username, 'project_deleted', { projectId });

    // Delete related data first to avoid foreign key constraint issues
    await executeQuery(queries.deleteLiveUsers, [projectId]);
    await executeQuery(queries.deleteFileTreeExpandUser, [projectId]);
    await executeQuery(queries.deleteLogs, [projectId]);
    await executeQuery(queries.deleteChat, [projectId]);
    await executeQuery(queries.deleteFileTree, [projectId]);
    await executeQuery(queries.deleteFiles, [projectId]);
    await executeQuery(queries.deleteProjectOwners, [projectId]);
    await executeQuery(queries.deleteProjects, [projectId]);

    const { rows } = await executeQuery(queries.getAllProjects, [req.user.username]);

    return res.status(200).json({ message: "Project Deleted Successfully", projects: rows });
  } catch (err) {
    console.error("Error deleting project:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllProjects,
  addProject,
  getProjectName,
  updateProjectName,
  updateProjectSettings,
  deleteProject,
}; 