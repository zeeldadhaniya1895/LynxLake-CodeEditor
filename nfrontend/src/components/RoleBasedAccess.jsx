import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import {
  AdminPanelSettingsRounded,
  EditRounded,
  VisibilityRounded,
  PersonRounded,
  SecurityRounded
} from '@mui/icons-material';

// Role definitions with permissions
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  GUEST: 'guest'
};

// Permission definitions
export const PERMISSIONS = {
  MANAGE_PROJECT_SETTINGS: 'manage_project_settings',
  MANAGE_USERS: 'manage_users',
  CHANGE_ROLES: 'change_roles',
  CREATE_FILES: 'create_files',
  EDIT_FILES: 'edit_files',
  DELETE_FILES: 'delete_files',
  EXECUTE_CODE: 'execute_code',
  VIEW_FILES: 'view_files',
  PARTICIPATE_CHAT: 'participate_chat',
  EXPORT_PROJECT: 'export_project',
  DELETE_PROJECT: 'delete_project'
};

// Role hierarchy and permissions
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    PERMISSIONS.MANAGE_PROJECT_SETTINGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.CHANGE_ROLES,
    PERMISSIONS.CREATE_FILES,
    PERMISSIONS.EDIT_FILES,
    PERMISSIONS.DELETE_FILES,
    PERMISSIONS.EXECUTE_CODE,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.PARTICIPATE_CHAT,
    PERMISSIONS.EXPORT_PROJECT,
    PERMISSIONS.DELETE_PROJECT
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_PROJECT_SETTINGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.CHANGE_ROLES,
    PERMISSIONS.CREATE_FILES,
    PERMISSIONS.EDIT_FILES,
    PERMISSIONS.DELETE_FILES,
    PERMISSIONS.EXECUTE_CODE,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.PARTICIPATE_CHAT,
    PERMISSIONS.EXPORT_PROJECT
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.CREATE_FILES,
    PERMISSIONS.EDIT_FILES,
    PERMISSIONS.EXECUTE_CODE,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.PARTICIPATE_CHAT
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.PARTICIPATE_CHAT
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_FILES
  ]
};

// Role display information
export const ROLE_INFO = {
  [ROLES.OWNER]: {
    label: 'Owner',
    color: 'error',
    icon: SecurityRounded,
    description: 'Full control over project'
  },
  [ROLES.ADMIN]: {
    label: 'Admin',
    color: 'warning',
    icon: AdminPanelSettingsRounded,
    description: 'Manage users and settings'
  },
  [ROLES.EDITOR]: {
    label: 'Editor',
    color: 'primary',
    icon: EditRounded,
    description: 'Create and edit files'
  },
  [ROLES.VIEWER]: {
    label: 'Viewer',
    color: 'info',
    icon: VisibilityRounded,
    description: 'Read-only access'
  },
  [ROLES.GUEST]: {
    label: 'Guest',
    color: 'default',
    icon: PersonRounded,
    description: 'Limited access'
  }
};

// Hook to check permissions
export const usePermissions = (userRole) => {
  const hasPermission = (permission) => {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) return false;
    return ROLE_PERMISSIONS[userRole].includes(permission);
  };

  const canEdit = hasPermission(PERMISSIONS.EDIT_FILES);
  const canCreate = hasPermission(PERMISSIONS.CREATE_FILES);
  const canDelete = hasPermission(PERMISSIONS.DELETE_FILES);
  const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);
  const canChangeRoles = hasPermission(PERMISSIONS.CHANGE_ROLES);
  const canManageSettings = hasPermission(PERMISSIONS.MANAGE_PROJECT_SETTINGS);
  const canExecuteCode = hasPermission(PERMISSIONS.EXECUTE_CODE);
  const canExport = hasPermission(PERMISSIONS.EXPORT_PROJECT);
  const canDeleteProject = hasPermission(PERMISSIONS.DELETE_PROJECT);
  const canView = hasPermission(PERMISSIONS.VIEW_FILES);
  const canChat = hasPermission(PERMISSIONS.PARTICIPATE_CHAT);

  return {
    hasPermission,
    canEdit,
    canCreate,
    canDelete,
    canManageUsers,
    canChangeRoles,
    canManageSettings,
    canExecuteCode,
    canExport,
    canDeleteProject,
    canView,
    canChat
  };
};

// Component to display role chip
export const RoleChip = ({ role, size = 'small' }) => {
  const roleInfo = ROLE_INFO[role];
  if (!roleInfo) return null;

  const IconComponent = roleInfo.icon;

  return (
    <Tooltip title={roleInfo.description}>
      <Chip
        icon={<IconComponent />}
        label={roleInfo.label}
        color={roleInfo.color}
        size={size}
        variant="outlined"
        sx={{
          fontWeight: 'medium',
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? '16px' : '20px'
          }
        }}
      />
    </Tooltip>
  );
};

// Component to conditionally render based on permissions
export const PermissionGate = ({ permission, userRole, children, fallback = null }) => {
  const { hasPermission } = usePermissions(userRole);
  
  if (!hasPermission(permission)) {
    return fallback;
  }
  
  return children;
};

// Component to show role-based access denied message
export const AccessDenied = ({ requiredRole, currentRole }) => {
  const requiredInfo = ROLE_INFO[requiredRole];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        minHeight: '200px'
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        You need {requiredInfo?.label || requiredRole} role to access this feature.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your current role: {ROLE_INFO[currentRole]?.label || currentRole}
      </Typography>
    </Box>
  );
};

// Component to display user role information
export const UserRoleDisplay = ({ username, role, invitedBy, invitedAt }) => {
  const roleInfo = ROLE_INFO[role];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {username}
      </Typography>
      <RoleChip role={role} />
      {invitedBy && (
        <Typography variant="caption" color="text.secondary">
          invited by {invitedBy}
        </Typography>
      )}
    </Box>
  );
};

// Default export for backward compatibility
const RoleBasedAccess = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_INFO,
  usePermissions,
  RoleChip,
  PermissionGate,
  AccessDenied,
  UserRoleDisplay
};

export default RoleBasedAccess; 