const { Router } = require("express");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyUser");
const projectCore = require("../controllers/project/core");
const projectInvitation = require("../controllers/project/invitation");

const router = Router();

// Basic project routes (no project ID needed)
router.get("/get-all-projects", verifyTokenAndAuthorization, projectCore.getAllProjects);
router.post("/add-project", verifyTokenAndAuthorization, projectCore.addProject);

// Invitation routes (no project ID needed)
router.get("/invitations/pending", verifyTokenAndAuthorization, projectInvitation.getPendingInvitations);
router.post("/invitations/:invitationId/accept", verifyTokenAndAuthorization, projectInvitation.acceptProjectInvitation);
router.post("/invitations/:invitationId/reject", verifyTokenAndAuthorization, projectInvitation.rejectProjectInvitation);

// Project info routes (no project ID needed)
router.get("/get-project-name", verifyTokenAndAuthorization, projectCore.getProjectName);

module.exports = router; 