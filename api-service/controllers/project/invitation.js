const { executeQuery } = require("../../utils/dbUtils");
const queries = require("../../queries/project");
const { v4: uuidv4 } = require("uuid");
const { logActivity } = require("../../utils/activityLogger");
const { getPendingInvitationsForUser, acceptInvitation, rejectInvitation } = require("../../queries/project");

const createProjectInvitation = async (req, resp) => {
  const { projectId } = req.params;
  const { invitedEmail, role, permissions } = req.body;

  try {
    // Check if the inviter has permission to invite users
    const inviterRoleResult = await executeQuery(queries.getUserRole, [projectId, req.user.username]);
    if (inviterRoleResult.rows.length === 0 || !['owner', 'admin'].includes(inviterRoleResult.rows[0].role)) {
      return resp.status(403).json({ message: "You don't have permission to send invitations" });
    }

    // Check if the invited user exists by email
    const userExists = await executeQuery(queries.checkUserExistsByEmail, [invitedEmail]);
    if (userExists.rows.length === 0) {
      return resp.status(404).json({ message: "User with this email not found." });
    }

    const invitedUsername = userExists.rows[0].username;

    // Check if the user is already a member of the project
    const isMember = await executeQuery(queries.checkProjectAccess, [projectId, invitedUsername]);
    if (isMember.rows.length > 0) {
        return resp.status(409).json({ message: "User is already a member of this project." });
    }

    // Check if a pending invitation already exists
    const existingInvitation = await executeQuery(queries.getPendingInvitation, [projectId, invitedUsername]);
    if (existingInvitation.rows.length > 0) {
      return resp.status(409).json({ message: "An invitation to this user for this project already exists." });
    }

    const invitationId = uuidv4();

    await executeQuery(queries.createProjectInvitation, [
      invitationId,
      projectId,
      invitedUsername,
      req.user.username, // invited_by
      role || 'viewer',
      JSON.stringify(permissions || {})
    ]);

    await logActivity(req, projectId, req.user.username, 'invitation_sent', { invitedUser: invitedUsername, role });

    return resp.status(201).json({ message: "Invitation sent successfully!" });
  } catch (err) {
    console.error("Error creating project invitation:", err);
    return resp.status(500).json({ message: "Internal Server Error." });
  }
};

const fetchPendingInvitationsForUser = async (userId) => {
  try {
    const invitations = await getPendingInvitationsForUser(userId);
    return invitations;
  } catch (error) {
    console.error("Error in fetchPendingInvitationsForUser:", error);
    throw error;
  }
};

const acceptProjectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.username; // or req.user.user_id if you use user_id
    const result = await acceptInvitation(invitationId, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in acceptProjectInvitation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const rejectProjectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.username; // or req.user.user_id if you use user_id
    const result = await rejectInvitation(invitationId, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in rejectProjectInvitation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProjectInvitations = async (req, res) => {
  const { projectId } = req.params;

  try {
    const results = await executeQuery(queries.getProjectInvitations, [projectId]);
    return res.status(200).json(results.rows);
  } catch (err) {
    console.error("Error fetching project invitations:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPendingInvitations = async (req, res) => {
  try {
    const results = await executeQuery(queries.getPendingInvitations, [req.user.username]);
    return res.status(200).json(results.rows);
  } catch (err) {
    console.error("Error fetching pending invitations:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createProjectInvitation,
  getProjectInvitations,
  fetchPendingInvitationsForUser,
  acceptProjectInvitation,
  rejectProjectInvitation,
  getPendingInvitations,
};