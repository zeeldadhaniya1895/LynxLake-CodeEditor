import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  CloseRounded,
  ManageAccountsRounded,
  EditRounded,
  DeleteRounded,
  CheckCircleRounded,
  CancelRounded,
  AccessTimeRounded,
  PersonRounded,
  InfoRounded
} from '@mui/icons-material';
import Popover from '@mui/material/Popover';

import useAPI from '../hooks/api';
import { ROLES, ROLE_INFO, RoleChip, usePermissions } from './RoleBasedAccess';
import { getAvatar } from '../utils/avatar';
import { formatTimestamp } from '../utils/formatters';

const ProjectMembers = React.memo(({ 
  open, 
  onClose, 
  projectId, 
  projectName,
  currentUserRole,
  onMemberUpdated 
}) => {
  const { GET, PUT, DELETE } = useAPI();
  const modalRef = useRef(null);
  const { canManageUsers, canChangeRoles } = usePermissions(currentUserRole);

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [pendingRoleChanges, setPendingRoleChanges] = useState({});
  const [isConfirmingChanges, setIsConfirmingChanges] = useState(false);
  const [popoverState, setPopoverState] = useState({ anchorEl: null, username: null, selectedRole: '' });
  const [inlineEditUser, setInlineEditUser] = useState(null);
  const [inlineEditRole, setInlineEditRole] = useState('');

  // Get current user's username from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setCurrentUsername(userInfo.username || '');
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const response = await GET(`/project/${projectId}/members`);
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast('Failed to load project members', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#161B22',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [GET, projectId]);

  // Only fetch members when modal opens and projectId is available
  useEffect(() => {
    if (open && projectId) {
      fetchMembers();
    }
  }, [open, projectId]); // Remove fetchMembers from dependency to prevent infinite loops

  // Handle click outside
  useEffect(() => {
    if (!open) return;
    
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  // Handle ESC key
  useEffect(() => {
    if (!open) return;
    
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Clear state when modal closes
  useEffect(() => {
    if (!open) {
      setMembers([]);
      setEditingRole(null);
      setSelectedRole('');
      setIsUpdatingRole(false);
      setUpdatingRole(null);
      setIsRemovingMember(false);
      setPendingRoleChanges({});
      setIsConfirmingChanges(false);
      setInlineEditUser(null);
      setInlineEditRole('');
    }
  }, [open]);

  const handleEditRole = useCallback((username, currentRole) => {
    setEditingRole(username);
    setSelectedRole(currentRole);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingRole(null);
    setSelectedRole('');
  }, []);

  const handleRoleChange = useCallback((username, newRole) => {
    console.log('handleRoleChange called:', { username, newRole });
    setPendingRoleChanges(prev => {
      const newChanges = { ...prev, [username]: newRole };
      console.log('New pending changes:', newChanges);
      return newChanges;
    });
    setEditingRole(null);
    setSelectedRole('');
  }, []);

  const handleCancelRoleChange = useCallback((username) => {
    setPendingRoleChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[username];
      return newChanges;
    });
  }, []);

  const handleConfirmAllChanges = useCallback(async () => {
    if (Object.keys(pendingRoleChanges).length === 0) {
      toast('No changes to confirm', {
        icon: <InfoRounded />,
        style: {
          borderRadius: '10px',
          background: '#161B22',
          color: '#fff',
        },
      });
      return;
    }

    setIsConfirmingChanges(true);
    
    try {
      const updatePromises = Object.entries(pendingRoleChanges).map(([username, newRole]) => 
        PUT(`/project/${projectId}/users/${username}/role`, {
          role: newRole
        })
      );

      await Promise.all(updatePromises);

      toast('All role changes applied successfully!', {
        icon: <CheckCircleRounded />,
        style: {
          borderRadius: '10px',
          background: '#161B22',
          color: '#fff',
        },
      });

      // Update local state
      setMembers(prevMembers => 
        prevMembers.map(member => 
          pendingRoleChanges[member.username] 
            ? { ...member, role: pendingRoleChanges[member.username] }
            : member
        )
      );

      // Clear pending changes
      setPendingRoleChanges({});
      
      if (onMemberUpdated) {
        onMemberUpdated();
      }
    } catch (error) {
      console.error('Error confirming role changes:', error);
      toast('Failed to apply some role changes', {
        icon: <CancelRounded />,
        style: {
          borderRadius: '10px',
          background: '#161B22',
          color: '#fff',
        },
      });
    } finally {
      setIsConfirmingChanges(false);
    }
  }, [pendingRoleChanges, PUT, projectId, onMemberUpdated]);

  const handleRemoveMember = useCallback(async (username) => {
    if (!window.confirm(`Are you sure you want to remove ${username} from this project?`)) {
      return;
    }

    setIsRemovingMember(true);
    setUpdatingRole(username);

    try {
      await DELETE(`/project/${projectId}/contributors/${username}`);
      
      toast('Member removed successfully!', {
        icon: <CheckCircleRounded />,
        style: {
          borderRadius: '10px',
          background: '#161B22',
          color: '#fff',
        },
      });

      // Update local state instead of refetching
      setMembers(prevMembers => 
        prevMembers.filter(member => member.username !== username)
      );
      
      if (onMemberUpdated) {
        onMemberUpdated();
      }
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to remove member', {
        icon: <CancelRounded />,
        style: {
          borderRadius: '10px',
          background: '#161B22',
          color: '#fff',
        },
      });
    } finally {
      setIsRemovingMember(false);
      setUpdatingRole(null);
    }
  }, [DELETE, projectId, onMemberUpdated]);

  const canEditUserRole = useCallback((memberRole) => {
    if (!canChangeRoles) return false;
    
    // Owners can't be changed by anyone
    if (memberRole === ROLES.OWNER) return false;
    
    // Owners can change any role except other owners
    if (currentUserRole === ROLES.OWNER) return true;
    
    // Admins can change any role except owner
    if (currentUserRole === ROLES.ADMIN) return true;
    
    // Editors can only change viewers or guests
    if (currentUserRole === ROLES.EDITOR && [ROLES.VIEWER, ROLES.GUEST].includes(memberRole)) return true;
    
    return false;
  }, [canChangeRoles, currentUserRole]);

  const canRemoveUser = useCallback((memberUsername) => {
    if (!canManageUsers) return false;
    
    // Cannot remove self
    if (memberUsername === currentUsername) return false;
    
    const member = members.find(m => m.username === memberUsername);
    if (!member) return false;
    
    // Owners can remove anyone except themselves
    if (currentUserRole === ROLES.OWNER) return true;

    // Admins can remove anyone except owners and themselves
    if (currentUserRole === ROLES.ADMIN && member.role !== ROLES.OWNER) return true;
    
    return false;
  }, [canManageUsers, currentUsername, members, currentUserRole]);

  // Open popover for a user
  const handleOpenRolePopover = (event, username, currentRole) => {
    setPopoverState({ anchorEl: event.currentTarget, username, selectedRole: currentRole });
  };

  // Close popover
  const handleCloseRolePopover = () => {
    setPopoverState({ anchorEl: null, username: null, selectedRole: '' });
  };

  // Confirm role change
  const handleConfirmRolePopover = () => {
    setPendingRoleChanges(prev => ({ ...prev, [popoverState.username]: popoverState.selectedRole }));
    handleCloseRolePopover();
  };

  // Cancel role change
  const handleCancelRolePopover = () => {
    handleCloseRolePopover();
  };

  // Start inline edit
  const handleStartInlineEdit = (username, currentRole) => {
    setInlineEditUser(username);
    setInlineEditRole(currentRole);
  };

  // Cancel inline edit
  const handleCancelInlineEdit = () => {
    setInlineEditUser(null);
    setInlineEditRole('');
  };

  // Confirm inline edit
  const handleConfirmInlineEdit = () => {
    setPendingRoleChanges(prev => ({ ...prev, [inlineEditUser]: inlineEditRole }));
    setInlineEditUser(null);
    setInlineEditRole('');
  };

  // Memoize the member list to prevent unnecessary re-renders
  const memberList = useMemo(() => {
    return members.map((member) => {
      const pendingRole = pendingRoleChanges[member.username];
      const displayRole = pendingRole || member.role;
      const hasPendingChange = !!pendingRole;
      const isEditing = inlineEditUser === member.username;
      
      return (
        <ListItem
          key={member.username}
          sx={{
            bgcolor: hasPendingChange ? 'rgba(88, 166, 255, 0.1)' : 'rgba(16,19,26,0.5)',
            mb: 1,
            borderRadius: '8px',
            border: hasPendingChange ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid rgba(88, 166, 255, 0.1)',
            '&:hover': { bgcolor: hasPendingChange ? 'rgba(88, 166, 255, 0.15)' : 'rgba(16,19,26,0.7)' }
          }}
        >
          <ListItemAvatar>
            <Avatar 
              src={getAvatar(member.profile_image)}
              alt={member.name || member.username}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography fontWeight="medium" color="#E6EDF3">
                  {member.name || member.username}
                </Typography>
                {hasPendingChange && (
                  <Chip 
                    label="Pending" 
                    size="small" 
                    color="warning" 
                    sx={{ 
                      bgcolor: '#ff9800', 
                      color: 'white', 
                      height: 20,
                      fontSize: '0.7rem',
                      mt: isEditing ? 1 : 0
                    }} 
                  />
                )}
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#A0B3D6', fontSize: '0.8rem' }}>
                <PersonRounded sx={{ fontSize: '1rem', mr: 0.5 }} />
                {member.username}
                <AccessTimeRounded sx={{ fontSize: '1rem', ml: 1, mr: 0.5 }} />
                Joined: {formatTimestamp(member.invited_at || member.project_timestamp)}
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isEditing ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1,
                    p: 1.5,
                    bgcolor: 'rgba(88,166,255,0.07)',
                    borderRadius: 2,
                    border: '1px solid rgba(88,166,255,0.15)',
                  }}
                >
                  {Object.values(ROLES).map((role) => (
                    <Button
                      key={role}
                      variant={inlineEditRole === role ? 'contained' : 'outlined'}
                      color={inlineEditRole === role ? 'primary' : 'inherit'}
                      size="small"
                      onClick={() => setInlineEditRole(role)}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        borderRadius: 2,
                        fontWeight: inlineEditRole === role ? 'bold' : 'normal',
                        bgcolor: inlineEditRole === role ? 'rgba(88,166,255,0.15)' : 'transparent',
                        color: inlineEditRole === role ? '#58A6FF' : '#E6EDF3',
                        borderColor: '#58A6FF',
                        mr: 0.5
                      }}
                    >
                      <RoleChip role={role} size="small" />
                    </Button>
                  ))}
                  <Button
                    onClick={handleConfirmInlineEdit}
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ ml: 2, borderRadius: 2 }}
                    disabled={inlineEditRole === member.role}
                  >
                    <CheckCircleRounded />
                  </Button>
                  <Button
                    onClick={handleCancelInlineEdit}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1, borderRadius: 2 }}
                  >
                    <CancelRounded />
                  </Button>
                </Box>
              ) : (
                <>
                  <RoleChip role={displayRole} />
                  {hasPendingChange && (
                    <Tooltip title="Cancel Pending Change">
                      <IconButton 
                        onClick={() => handleCancelRoleChange(member.username)}
                        sx={{ color: '#ff9800', '&:hover': { bgcolor: 'rgba(255,152,0,0.1)' } }}
                      >
                        <CancelRounded />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canEditUserRole(member.role) && !hasPendingChange && (
                    <Tooltip title="Edit Role">
                      <IconButton 
                        onClick={() => handleStartInlineEdit(member.username, member.role)}
                        sx={{ color: '#A0B3D6', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}
                      >
                        <EditRounded />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canRemoveUser(member.username) && (
                    <Tooltip title="Remove Member">
                      <span>
                        <IconButton 
                          onClick={() => handleRemoveMember(member.username)}
                          disabled={isRemovingMember && updatingRole === member.username}
                          sx={{ color: '#ff6b6b', '&:hover': { bgcolor: 'rgba(255,107,107,0.1)' } }}
                        >
                          {isRemovingMember && updatingRole === member.username ? <CircularProgress size={20} color="inherit" /> : <DeleteRounded />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </>
              )}
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });
  }, [members, inlineEditUser, inlineEditRole, isRemovingMember, pendingRoleChanges, handleCancelRoleChange, handleRemoveMember, canEditUserRole, canRemoveUser]);

  // Popover for editing role
  const rolePopover = (
    <Popover
      open={Boolean(popoverState.anchorEl)}
      anchorEl={popoverState.anchorEl}
      onClose={handleCloseRolePopover}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          bgcolor: '#161B22',
          border: '1px solid rgba(88, 166, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          p: 2,
          minWidth: 220
        }
      }}
    >
      <Typography variant="subtitle2" color="#E6EDF3" sx={{ mb: 1 }}>
        Change Role
      </Typography>
      {Object.values(ROLES).map((role) => (
        <Box
          key={role}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            cursor: 'pointer',
            bgcolor: popoverState.selectedRole === role ? 'rgba(88,166,255,0.15)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(88,166,255,0.08)' }
          }}
          onClick={() => setPopoverState((prev) => ({ ...prev, selectedRole: role }))}
        >
          <RoleChip role={role} />
          <Typography variant="body2" color="#E6EDF3">
            {ROLE_INFO[role].description}
          </Typography>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
        <Button
          onClick={handleCancelRolePopover}
          variant="outlined"
          size="small"
          sx={{ color: '#A0B3D6', borderColor: '#A0B3D6' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmRolePopover}
          variant="contained"
          size="small"
          disabled={popoverState.selectedRole === members.find(m => m.username === popoverState.username)?.role}
          sx={{
            background: 'linear-gradient(135deg, #4caf50, #45a049)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049, #4caf50)',
            },
            borderRadius: '8px',
          }}
        >
          Confirm
        </Button>
      </Box>
    </Popover>
  );

  if (!open) return null;

  return (
    <Dialog
      ref={modalRef}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={false}
      disableBackdropClick={false}
      keepMounted={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: '#161B22',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(88, 166, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }
      }}
    >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2,
          color: '#E6EDF3',
          borderBottom: '1px solid rgba(88, 166, 255, 0.1)',
          pr: 7,
        }}>
            <ManageAccountsRounded sx={{ color: '#58A6FF' }} />
        <Typography variant="h6" component="div" fontWeight="bold">Manage Members for {projectName}</Typography>
        <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#A0B3D6',
              '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' },
            }}
          >
            <CloseRounded />
          </IconButton>
        </DialogTitle>
      <DialogContent sx={{ p: 4, pt: 3 }}>
          {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
            </Box>
          ) : members.length === 0 ? (
            <Alert severity="info" sx={{ 
              background: 'rgba(88, 166, 255, 0.1)', 
              color: '#58A6FF',
            border: '1px solid rgba(88, 166, 255, 0.3)',
            }}>
            <Typography variant="body2" color="inherit">
              No members found for this project. Invite some!
            </Typography>
            </Alert>
          ) : (
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {memberList}
          </List>
        )}
        {rolePopover}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(88, 166, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Object.keys(pendingRoleChanges).length > 0 && (
              <Chip 
                label={`${Object.keys(pendingRoleChanges).length} pending change${Object.keys(pendingRoleChanges).length > 1 ? 's' : ''}`}
                color="warning"
                    sx={{
                  bgcolor: '#ff9800', 
                  color: 'white',
                  '& .MuiChip-label': { fontWeight: 'medium' }
                }}
              />
            )}
                        </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {Object.keys(pendingRoleChanges).length > 0 && (
              <Button
                onClick={handleConfirmAllChanges}
                variant="contained"
                disabled={isConfirmingChanges}
                startIcon={isConfirmingChanges ? <CircularProgress size={20} color="inherit" /> : <CheckCircleRounded />}
                                sx={{
                  background: 'linear-gradient(135deg, #4caf50, #45a049)',
                                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049, #4caf50)',
                  },
                  '&:disabled': {
                    background: 'rgba(76, 175, 80, 0.5)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  borderRadius: '12px',
                  px: 3,
                }}
              >
                {isConfirmingChanges ? 'Applying Changes...' : 'Confirm All Changes'}
              </Button>
            )}
          <Button
            onClick={onClose}
              variant="outlined"
            sx={{
                color: '#A0B3D6',
                borderColor: '#A0B3D6',
              '&:hover': {
                  borderColor: '#58A6FF',
                  bgcolor: 'rgba(88,166,255,0.1)',
                }
            }}
          >
            Close
          </Button>
          </Box>
        </Box>
        </DialogActions>
    </Dialog>
  );
});

export default ProjectMembers; 