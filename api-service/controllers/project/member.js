const pool = require("../../db");
const queries = require("../../queries/project");
const { logActivity } = require("../../utils/activityLogger");

const addContributor = async (req, resp) => {
  const { projectId, contributors } = req.body;
  
  try {
    // Check if user has permission to add contributors
    const userRoleResult = await pool.query(queries.getUserRole, [projectId, req.user.username]);
    if (userRoleResult.rows.length === 0 || !['owner', 'admin'].includes(userRoleResult.rows[0].role)) {
      return resp.status(403).json({ message: "You don't have permission to add contributors" });
    }

    for (const contributor of contributors) {
      await pool.query(queries.addContributor, [
        projectId, 
        contributor.username, 
        contributor.role || 'viewer',
        req.user.username
      ]);
    }

    // Log activity
    await logActivity(req, projectId, req.user.username, 'contributors_added', { contributors });

    return resp.status(200).json({ message: "Added contributors" });
  } catch (err) {
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const getProjectMembers = async (req, resp) => {
  const { projectId } = req.params;
  
  try {
    const results = await pool.query(queries.getProjectMembers, [projectId]);
    return resp.status(200).json(results.rows);
  } catch (err) {
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserRole = async (req, resp) => {
  const { projectId, username } = req.params;
  const { role, permissions } = req.body;
  
  try {
    // Check if user has permission to update roles
    const userRoleResult = await pool.query(queries.getUserRole, [projectId, req.user.username]);
    
    if (userRoleResult.rows.length === 0 || !['owner', 'admin'].includes(userRoleResult.rows[0].role)) {
      return resp.status(403).json({ message: "You don't have permission to update roles" });
    }

    // Prevent changing owner role
    if (role === 'owner') {
      return resp.status(400).json({ message: "Cannot change user to owner role" });
    }

    // Check if the target user exists in the project
    const targetUserResult = await pool.query(queries.getUserRole, [projectId, username]);
    
    if (targetUserResult.rows.length === 0) {
      return resp.status(404).json({ message: "User not found in project" });
    }

    const updateResult = await pool.query(queries.updateUserRole, [projectId, username, role, JSON.stringify(permissions || {})]);

    // Log activity
    await logActivity(req, projectId, req.user.username, 'role_updated', { targetUser: username, newRole: role });

    return resp.status(200).json({ message: "User role updated successfully" });
  } catch (err) {
    console.error('Error in updateUserRole:', err);
    return resp.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProjectContributor = async (req, res) => {
  const { projectId, username } = req.params;
  
  try {
    // Check if the user trying to remove has appropriate permissions
    const removerRoleResult = await pool.query(queries.getUserRole, [projectId, req.user.username]);
    if (removerRoleResult.rows.length === 0 || !['owner', 'admin'].includes(removerRoleResult.rows[0].role)) {
      return res.status(403).json({ message: "You don't have permission to remove contributors." });
    }

    // Prevent an owner/admin from removing themselves (unless they are the *only* owner/admin)
    const targetUserRoleResult = await pool.query(queries.getUserRole, [projectId, username]);
    const targetUserRole = targetUserRoleResult.rows[0]?.role;

    if (targetUserRole === 'owner' || targetUserRole === 'admin') {
        const ownerAdminCountResult = await pool.query(queries.countOwnersAndAdmins, [projectId]);
        const ownerAdminCount = parseInt(ownerAdminCountResult.rows[0].count, 10);

        if (ownerAdminCount <= 1 && req.user.username === username) {
            return res.status(400).json({ message: "Cannot remove the last owner/admin of the project." });
        }
    }

    await pool.query(queries.deleteProjectContributor, [projectId, username]);

    await logActivity(req, projectId, req.user.username, 'contributor_removed', { removedUser: username });

    return res.status(200).json({ message: "Contributor removed successfully." });
  } catch (err) {
    console.error("Error deleting project contributor:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const changeAdmin = async (req, res) => {
  const { username, projectId } = req.body;
  try {
    const results = await pool.query(queries.changeAdmin, [projectId, username]);
    return res.status(200).json(results.rows);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const userSearchMakeAdmin = async (req, res) => {
  const { query, projectId } = req.query;
  try {
    const results = await pool.query(queries.userSearchMakeAdmin, [
      `%${query}%`,
      projectId,
    ]);
    return res.status(200).json(results.rows);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const userSearch = async (req, res) => {
  const { query, projectId } = req.query;

  try {
    const results = await pool.query(queries.userSearch, [`%${query}%`, projectId]);
    return res.status(200).json(results.rows);
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addContributor,
  getProjectMembers,
  updateUserRole,
  deleteProjectContributor,
  changeAdmin,
  userSearchMakeAdmin,
  userSearch,
}; 