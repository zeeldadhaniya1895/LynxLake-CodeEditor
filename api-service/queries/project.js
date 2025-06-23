const pool = require("../db");

const getAllProjects = `
SELECT 
        p.*,
        po.*,
        u.profile_image AS created_by_image,
        u.username AS created_by_username,
        admins.profile_image AS admin_image,
        admins.username AS admin_username

FROM
    projects AS p
JOIN
    project_owners AS po
ON
    p.project_id = po.project_id
JOIN
    users AS u
ON
    p.project_created_by = u.username
LEFT JOIN
    (SELECT pos.project_id, u.username, u.profile_image 
    FROM project_owners AS pos 
    JOIN users AS u 
    ON pos.username = u.username 
    WHERE pos.role IN ('owner', 'admin')
    ) AS admins
ON
    p.project_id = admins.project_id
WHERE
    po.username = $1
ORDER BY
    po.last_opened DESC;
`;

const addProjects = `
INSERT INTO projects (
    project_id,
    project_created_by,
    project_name,
    project_description,
    is_public,
    allow_public_access
)
VALUES 
    ($1, $2, $3, $4, $5, $6);
`;

const addProjectOwners = `
INSERT INTO project_owners (
    project_id,
    username,
    role,
    invited_by
)
VALUES 
    ($1, $2, $3, $4);
`;

const addFileTree = `
INSERT INTO file_tree (
    file_tree_id,
    project_id,
    parent_id,
    name, 
    is_folder
)
VALUES 
    ($1, $2, $3, $4, $5);
`;

const addFileTreeUser = `
INSERT INTO file_tree_expand_user (
    user_id,
    file_tree_id,
    is_expand
)
VALUES 
    ($1, $2, $3);`;

const makeAllActiveFilesToLive = `
UPDATE live_users 
SET is_live = TRUE 
WHERE username = $1;
`;

const getAllFiles = `
WITH file_data AS (
    SELECT
        f.file_id,
        f.file_created_by,
        f.file_data,
        f.file_extension,
        f.file_name,
        f.file_timestamp,
        f.file_id AS id,
        f.project_id,
        f.file_permissions,
        f.version_number,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'is_active_in_tab', lu.is_active_in_tab,
                    'is_live', lu.is_live,
                    'live_users_timestamp', lu.live_users_timestamp,
                    'username', lu.username,
                    'user_role', lu.user_role,
                    'cursor_position', lu.cursor_position
                )
            ) FILTER (WHERE lu.username IS NOT NULL),
            '[]'
        ) AS users
    FROM
        files f
    LEFT JOIN
        live_users lu ON f.file_id = lu.file_id
    WHERE
        f.project_id = $1 AND f.is_archived = FALSE
    GROUP BY
        f.file_id
)
SELECT * FROM file_data;
`;

const createANewFile = `
INSERT INTO files (
    file_id,
    project_id,
    file_created_by,
    file_name,
    file_extension,
    file_permissions
)
VALUES 
    ($1, $2, $3, $4, $5, $6);
`;

const getProjectName = `
SELECT 
    p.project_name, 
    p.project_description,
    p.is_public,
    p.allow_public_access,
    po.role,
    po.permissions
FROM 
    projects AS p
JOIN
    project_owners AS po
ON
    p.project_id = po.project_id
WHERE 
    p.project_id = $1 AND po.username = $2;
`;

const getContributorId = `
SELECT id FROM users WHERE username = $1;
`;

const addContributor = `
INSERT INTO project_owners (project_id, username, role, invited_by)
VALUES ($1, $2, $3, $4)
ON CONFLICT (project_id, username) 
DO UPDATE SET 
    role = EXCLUDED.role,
    invited_by = EXCLUDED.invited_by,
    invited_at = CURRENT_TIMESTAMP;
`;

const getAllActiveFiles = `
SELECT f.*, af.is_active_in_tab
FROM live_users AS af
JOIN files AS f ON af.file_id = f.file_id
WHERE af.username = $1 AND af.project_id = $2;
`;

const getFileTree = `
SELECT 
  ft.file_tree_id, 
  ft.parent_id, 
  ft.name, 
  ft.is_folder, 
  ft.file_tree_timestamp,
  fteu.user_id,
  CASE 
    WHEN fteu.user_id IS NULL THEN false 
    ELSE fteu.is_expand 
  END AS expand
FROM 
  file_tree AS ft 
LEFT JOIN 
  (SELECT * FROM file_tree_expand_user WHERE user_id = $2) AS fteu 
ON 
  ft.file_tree_id = fteu.file_tree_id
WHERE 
  ft.project_id = $1;
`;

const setAllFilesLive = `
UPDATE live_users 
SET is_live = TRUE 
WHERE username = $1 AND project_id = $2;
`;

const getInitialTabs = `
SELECT lu.*, f.*, u.profile_image AS image FROM live_users AS lu 
JOIN users AS u
ON lu.username = u.username
JOIN files AS f 
ON lu.file_id = f.file_id 
WHERE lu.username = $1 AND lu.project_id = $2;
`;

const insertExpandData = `
  INSERT INTO file_tree_expand_user (user_id, file_tree_id, is_expand)
  VALUES ($1, $2, true)
  ON CONFLICT (user_id, file_tree_id) DO NOTHING;
`;

const deleteExpandData = `
  DELETE FROM file_tree_expand_user WHERE user_id = $1 AND file_tree_id = $2;
`;

const userSearch = `
SELECT * FROM users 
WHERE username ILIKE $1
AND username NOT IN (
    SELECT username FROM project_owners WHERE project_id = $2
)
LIMIT 5;
`;

const getLogs = `
WITH LatestLogs AS (
    SELECT l.*, u.profile_image AS image 
    FROM logs AS l
    JOIN users AS u 
    ON l.username = u.username
    WHERE l.project_id = $1
    ORDER BY l.logs_timestamp DESC
    LIMIT 15
)
SELECT * FROM LatestLogs
ORDER BY logs_timestamp ASC;
`;

const getMessages = `
WITH LatestMessages AS (
    SELECT cm.*, u.profile_image AS image
    FROM chat_messages AS cm
    JOIN users AS u ON cm.username = u.username
    WHERE cm.project_id = $1
    ORDER BY cm.created_at DESC
    LIMIT 50
)
SELECT * FROM LatestMessages
ORDER BY created_at ASC;
`;

const saveFile = `
UPDATE files 
SET file_data = $1,
    updated_at = CURRENT_TIMESTAMP
WHERE file_id = $2;
`;

const getInitialContentOfFile = `
SELECT file_data as content FROM files WHERE file_id = $1;
`;

const updateProjectName = `
UPDATE projects 
SET project_name = $1,
    updated_at = CURRENT_TIMESTAMP
WHERE project_id = $2;
`;

const checkProjectNameExists = `
SELECT project_id FROM projects 
WHERE project_created_by = $1 AND project_name = $2;
`;

const executeCode = `
SELECT 'Code execution placeholder' as result;
`;

const deleteProjectContributor = `
DELETE FROM project_owners WHERE project_id = $1 AND username = $2;
`;

const deleteLiveUsers = `
DELETE FROM live_users WHERE project_id = $1;
`;

const deleteFileTreeExpandUser = `
DELETE FROM file_tree_expand_user WHERE file_tree_id IN (
    SELECT file_tree_id FROM file_tree WHERE project_id = $1
);
`;

const deleteLogs = `
DELETE FROM logs WHERE project_id = $1;
`;

const deleteChat = `
DELETE FROM chat_messages WHERE project_id = $1;
`;

const deleteFileTree = `
DELETE FROM file_tree WHERE project_id = $1;
`;

const deleteFiles = `
DELETE FROM files WHERE project_id = $1;
`;

const deleteProjectOwners = `
DELETE FROM project_owners WHERE project_id = $1;
`;

const deleteProjects = `
DELETE FROM projects WHERE project_id = $1;
`;

const changeAdmin = `
UPDATE project_owners
SET role = CASE
    WHEN $3 = TRUE THEN 'admin'
    ELSE 'owner'
END
WHERE project_id = $1 AND username = $2;
`;

const userSearchMakeAdmin = `
SELECT username, profile_image FROM users
WHERE username ILIKE $1 AND username != $2
LIMIT 5;
`;

const exportProject = `
WITH RECURSIVE file_hierarchy AS (
  SELECT
    ft.file_tree_id,
    ft.project_id,
    ft.parent_id,
    ft.name,
    ft.is_folder,
    f.file_id,
    f.file_name,
    f.file_extension,
    f.file_data
  FROM
    file_tree ft
  LEFT JOIN files f ON ft.file_tree_id = f.file_id
  WHERE ft.project_id = $1

  UNION ALL

  SELECT
    ft_rec.file_tree_id,
    ft_rec.project_id,
    ft_rec.parent_id,
    ft_rec.name,
    ft_rec.is_folder,
    f_rec.file_id,
    f_rec.file_name,
    f_rec.file_extension,
    f_rec.file_data
  FROM
    file_tree ft_rec
  JOIN file_hierarchy fh ON ft_rec.parent_id = fh.file_tree_id
  LEFT JOIN files f_rec ON ft_rec.file_tree_id = f_rec.file_id
  WHERE ft_rec.project_id = $1
)
SELECT *
FROM file_hierarchy;
`;

const getProjectMembers = `
SELECT po.username, u.name, u.profile_image, po.role, po.invited_at
FROM project_owners po
JOIN users u ON po.username = u.username
WHERE po.project_id = $1;
`;

const updateUserRole = `
UPDATE project_owners
SET role = $3,
    permissions = $4,
    invited_at = CURRENT_TIMESTAMP
WHERE project_id = $1 AND username = $2;
`;

const createProjectInvitation = `
INSERT INTO project_invitations (invitation_id, project_id, invited_username, invited_by, role, permissions)
VALUES ($1, $2, $3, $4, $5, $6);
`;

const acceptProjectInvitation = `
UPDATE project_invitations
SET status = 'accepted',
    updated_at = CURRENT_TIMESTAMP
WHERE invitation_id = $1 AND status = 'pending'
RETURNING project_id, invited_username, role;
`;

const addAcceptedProjectMember = `
INSERT INTO project_owners (project_id, username, role, invited_by)
VALUES ($1, $2, $3, $4);
`;

const getPendingInvitations = `
SELECT * FROM project_invitations
WHERE invited_username = $1 AND status = 'pending'
ORDER BY created_at DESC;
`;

const getProjectInvitations = `
SELECT pi.invitation_id, pi.project_id, pi.invited_username, pi.role, pi.permissions, pi.invited_by, p.project_name, pi.created_at, pi.status
FROM project_invitations pi
JOIN projects p ON pi.project_id = p.project_id
WHERE pi.project_id = $1 AND pi.status = 'pending'
ORDER BY pi.created_at DESC;
`;

const updateProjectSettings = `
UPDATE projects
SET is_public = $2,
    allow_public_access = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE project_id = $1;
`;

const deleteProject = `
DELETE FROM projects WHERE project_id = $1;
`;

const checkProjectAccess = `
SELECT po.role, po.permissions
FROM project_owners po
WHERE po.project_id = $1 AND po.username = $2;
`;

const getUserRole = `
SELECT role, permissions
FROM project_owners
WHERE project_id = $1 AND username = $2;
`;

const checkUserExists = `
SELECT username FROM users WHERE username = $1;
`;

const checkUserExistsByEmail = `
SELECT username FROM users WHERE emailid = $1;
`;

const getPendingInvitation = `
SELECT invitation_id, project_id, invited_username, role, permissions
FROM project_invitations
WHERE project_id = $1 AND invited_username = $2 AND status = 'pending';
`;

const getInvitationById = `
SELECT invitation_id, project_id, invited_username, role, permissions, invited_by
FROM project_invitations
WHERE invitation_id = $1 AND status = 'pending';
`;

const updateInvitationStatus = `
UPDATE project_invitations
SET status = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE invitation_id = $1;
`;

const countOwnersAndAdmins = `
SELECT COUNT(*) as count
FROM project_owners
WHERE project_id = $1 AND role IN ('owner', 'admin');
`;

const logProjectActivity = `
INSERT INTO project_activity_log (
    activity_id,
    project_id,
    username,
    action,
    details,
    ip_address,
    user_agent
)
VALUES ($1, $2, $3, $4, $5, $6, $7);
`;

const getProjectFileTreeForExport = `
SELECT 
    ft.file_tree_id,
    ft.project_id,
    ft.parent_id,
    ft.name,
    ft.is_folder as is_directory,
    f.file_id,
    f.file_name,
    f.file_extension,
    f.file_data as content
FROM file_tree ft
LEFT JOIN files f ON ft.file_tree_id = f.file_id
WHERE ft.project_id = $1
ORDER BY ft.parent_id NULLS FIRST, ft.name;
`;

const setExpandData = `
INSERT INTO file_tree_expand_user (user_id, file_tree_id, is_expand)
VALUES ($2, $1, $3)
ON CONFLICT (user_id, file_tree_id) 
DO UPDATE SET is_expand = $3;
`;

const deleteLiveUsersForFile = `
DELETE FROM live_users WHERE file_id = $1;
`;

const deleteFileTreeExpandUserForFile = `
DELETE FROM file_tree_expand_user WHERE file_tree_id = $1;
`;

const deleteFileById = `
DELETE FROM files WHERE file_id = $1;
`;

// Get pending invitations for a user
const getPendingInvitationsForUser = async (userId) => {
  const query = `
    SELECT 
      pi.invitation_id,
      pi.project_id,
      p.project_name,
      pi.role,
      pi.created_at,
      u.username as invited_by
    FROM project_invitations pi
    JOIN projects p ON pi.project_id = p.project_id
    JOIN users u ON pi.invited_by = u.username
    WHERE pi.invited_username = $1 
    AND pi.status = 'pending'
    ORDER BY pi.created_at DESC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Accept invitation
const acceptInvitation = async (invitationId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get invitation details
    const invitationQuery = `
      SELECT * FROM project_invitations 
      WHERE invitation_id = $1 AND invited_username = $2 AND status = 'pending'
    `;
    const invitationResult = await client.query(invitationQuery, [invitationId, userId]);
    
    if (invitationResult.rows.length === 0) {
      throw new Error('Invitation not found or already processed');
    }
    
    const invitation = invitationResult.rows[0];
    
    // Add user to project_owners
    const addOwnerQuery = `
      INSERT INTO project_owners (project_id, username, role, invited_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (project_id, username) DO NOTHING
    `;
    await client.query(addOwnerQuery, [invitation.project_id, userId, invitation.role, invitation.invited_by]);
    
    // Update invitation status
    const updateQuery = `
      UPDATE project_invitations 
      SET status = 'accepted', updated_at = NOW()
      WHERE invitation_id = $1
    `;
    await client.query(updateQuery, [invitationId]);
    
    await client.query('COMMIT');
    
    return { message: 'Invitation accepted successfully' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Reject invitation
const rejectInvitation = async (invitationId, userId) => {
  const query = `
    UPDATE project_invitations 
    SET status = 'rejected', updated_at = NOW()
    WHERE invitation_id = $1 AND invited_username = $2 AND status = 'pending'
  `;
  
  const result = await pool.query(query, [invitationId, userId]);
  
  if (result.rowCount === 0) {
    throw new Error('Invitation not found or already processed');
  }
  
  return { message: 'Invitation rejected successfully' };
};

module.exports = {
    getAllProjects,
    addProjects,
    addProjectOwners,
    addFileTree,
    addFileTreeUser,
    makeAllActiveFilesToLive,
    getAllFiles,
    createANewFile,
    getProjectName,
    getContributorId,
    addContributor,
    getAllActiveFiles,
    getFileTree,
    setAllFilesLive,
    getInitialTabs,
    insertExpandData,
    deleteExpandData,
    userSearch,
    getLogs,
    getMessages,
    saveFile,
    getInitialContentOfFile,
    updateProjectName,
    checkProjectNameExists,
    executeCode,
    deleteProjectContributor,
    deleteLiveUsers,
    deleteFileTreeExpandUser,
    deleteLogs,
    deleteChat,
    deleteFileTree,
    deleteFiles,
    deleteProjectOwners,
    deleteProjects,
    changeAdmin,
    userSearchMakeAdmin,
    exportProject,
    getProjectMembers,
    updateUserRole,
    createProjectInvitation,
    acceptProjectInvitation,
    addAcceptedProjectMember,
    getPendingInvitations,
    getProjectInvitations,
    updateProjectSettings,
    deleteProject,
    checkProjectAccess,
    getUserRole,
    checkUserExists,
    checkUserExistsByEmail,
    getPendingInvitation,
    getInvitationById,
    updateInvitationStatus,
    countOwnersAndAdmins,
    logProjectActivity,
    getProjectFileTreeForExport,
    setExpandData,
    deleteLiveUsersForFile,
    deleteFileTreeExpandUserForFile,
    deleteFileById,
    getPendingInvitationsForUser,
    acceptInvitation,
    rejectInvitation
};
