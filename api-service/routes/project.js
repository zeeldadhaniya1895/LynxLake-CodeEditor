const { Router } = require("express");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyUser");
const { checkProjectAccess, requireRole } = require("../middlewares/projectAuth");
const projectCore = require("../controllers/project/core");
const projectFile = require("../controllers/project/file");
const projectMember = require("../controllers/project/member");
const projectInvitation = require("../controllers/project/invitation");
const projectCodeExecution = require("../controllers/project/codeExecution");
const projectChatAndLogs = require("../controllers/project/chatAndLogs");

const router = Router();

// ===== PROJECT-SPECIFIC ROUTES (WITH PROJECT ID) =====

// Project info and basic access
router.get("/:projectId", verifyTokenAndAuthorization, checkProjectAccess, projectCore.getProjectName);
router.get("/:projectId/members", verifyTokenAndAuthorization, checkProjectAccess, projectMember.getProjectMembers);

// User management routes (admin/owner only)
router.post("/:projectId/contributors", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectMember.addContributor);
router.put("/:projectId/users/:username/role", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectMember.updateUserRole);
router.delete("/:projectId/contributors/:username", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectMember.deleteProjectContributor);

// Project invitation system
router.post("/:projectId/invitations", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectInvitation.createProjectInvitation);
router.get("/:projectId/invitations", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectInvitation.getProjectInvitations);

// Project settings (owner/admin only)
router.put("/:projectId/settings", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectCore.updateProjectSettings);
router.put("/:projectId/name", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectCore.updateProjectName);

// Delete project (owner only)
router.delete("/:projectId", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner']), projectCore.deleteProject);

// Code execution (editor and above)
router.post("/:projectId/execute", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin', 'editor']), projectCodeExecution.executeCode);

// Chat and logs (all authenticated users with access)
router.get("/:projectId/chat/messages", verifyTokenAndAuthorization, checkProjectAccess, projectChatAndLogs.getMessages);

// User search (admin/owner only)
router.get("/:projectId/users/search", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectMember.userSearch);
router.get("/:projectId/users/search-admin", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectMember.userSearchMakeAdmin);
router.post("/:projectId/change-admin", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner']), projectMember.changeAdmin);

// Project export (owner/admin only)
router.get("/:projectId/export", verifyTokenAndAuthorization, checkProjectAccess, requireRole(['owner', 'admin']), projectFile.exportProject);

// Add user-role endpoint for frontend compatibility
router.get('/:projectId/user-role', verifyTokenAndAuthorization, checkProjectAccess, (req, res) => {
  res.json({ role: req.userRole });
});

module.exports = router;
