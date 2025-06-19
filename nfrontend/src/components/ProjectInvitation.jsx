import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloseRounded,
  SendRounded,
  ContentCopyRounded,
  CheckCircleRounded,
  CancelRounded,
  EmailRounded,
  AccessTimeRounded,
  PersonAddRounded
} from '@mui/icons-material';

import useAPI from '../hooks/api';
import { ROLES, ROLE_INFO, RoleChip } from './RoleBasedAccess';

const ProjectInvitation = ({ 
  open, 
  onClose, 
  projectId, 
  projectName,
  onInvitationSent 
}) => {
  const { POST, GET } = useAPI();
  const modalRef = useRef(null);

  const [invitedEmail, setInvitedEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.VIEWER);
  const [isSending, setIsSending] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  const fetchPendingInvitations = useCallback(async () => {
    setIsLoadingInvitations(true);
    try {
      const response = await GET(`/project/${projectId}/invitations`);
      setPendingInvitations(response.data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [GET, projectId]);

  useEffect(() => {
    if (open) {
      fetchPendingInvitations();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    
    if (!invitedEmail.trim()) {
      toast('Please enter an email address', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
      return;
    }

    if (!invitedEmail.includes('@')) {
      toast('Please enter a valid email address', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
      return;
    }

    setIsSending(true);
    try {
      await POST(`/project/${projectId}/invitations`, {
        invitedEmail: invitedEmail.trim(),
        role: selectedRole
      });

      toast('Invitation sent successfully!', {
        icon: <CheckCircleRounded />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });

      setInvitedEmail('');
      setSelectedRole(ROLES.VIEWER);
      fetchPendingInvitations();
      
      if (onInvitationSent) {
        onInvitationSent();
      }
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to send invitation', {
        icon: <CancelRounded />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyInvitationLink = (token) => {
    const invitationLink = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(invitationLink);
    toast('Invitation link copied to clipboard!', {
      icon: <ContentCopyRounded />,
      style: {
        borderRadius: '10px',
        background: 'rgba(16, 19, 26, 0.95)',
        color: '#fff',
      },
    });
  };

  const formatExpiryDate = (expiresAt) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffInHours = Math.ceil((expiryDate - now) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Expires soon';
    } else if (diffInHours < 24) {
      return `Expires in ${diffInHours} hours`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `Expires in ${diffInDays} days`;
    }
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
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
        pr: 7, // Adjust padding-right to make space for the close button
      }}>
        <PersonAddRounded sx={{ color: '#58A6FF' }} />
        <Typography variant="h6" fontWeight="bold">Invite to {projectName}</Typography>
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
        <Typography variant="body2" color="#A0B3D6" mb={3}>
          Invite new members to collaborate on this project.
        </Typography>

        <form onSubmit={handleSendInvitation}>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={invitedEmail}
            onChange={(e) => setInvitedEmail(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'rgba(16,19,26,0.5)',
                border: '1px solid rgba(88, 166, 255, 0.2)',
                '&:hover fieldset': {
                  borderColor: 'rgba(88, 166, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#58A6FF',
                },
                '& .MuiInputBase-input': {
                  color: '#E6EDF3',
                },
                '& .MuiInputLabel-root': {
                  color: '#A0B3D6',
                },
              },
            }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
            <InputLabel id="role-select-label" sx={{ color: '#A0B3D6' }}>Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="Role"
              sx={{
                borderRadius: '12px',
                bgcolor: 'rgba(16,19,26,0.5)',
                border: '1px solid rgba(88, 166, 255, 0.2)',
                color: '#E6EDF3',
                '&:hover fieldset': {
                  borderColor: 'rgba(88, 166, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#58A6FF',
                },
                '& .MuiSvgIcon-root': {
                  color: '#A0B3D6',
                },
                '& .MuiSelect-icon': {
                  color: '#A0B3D6',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#161B22',
                    border: '1px solid rgba(88, 166, 255, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  },
                },
              }}
            >
              {Object.values(ROLES).map((role) => (
                <MenuItem key={role} value={role} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                  <RoleChip role={role} sx={{ mr: 1 }} />
                  {ROLE_INFO[role].description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            endIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendRounded />}
            disabled={isSending}
            sx={{
              mt: 1,
              py: 1.5,
              background: 'linear-gradient(90deg, #58A6FF 0%, #1F6FEB 100%)',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(88,166,255,0.3)',
              '&:hover': {
                background: 'linear-gradient(90deg, #1F6FEB 0%, #58A6FF 100%)',
                boxShadow: '0 6px 25px rgba(88,166,255,0.4)',
              },
              '&:disabled': {
                background: '#333',
                color: '#888',
              }
            }}
          >
            Send Invitation
          </Button>
        </form>

        <Divider sx={{ my: 4, borderColor: 'rgba(88, 166, 255, 0.2)' }} />

        <Typography variant="h6" fontWeight="bold" color="#E6EDF3" mb={2}>
          Pending Invitations ({pendingInvitations.length})
        </Typography>

        {isLoadingInvitations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : pendingInvitations.length === 0 ? (
          <Alert severity="info" sx={{
            background: 'rgba(88, 166, 255, 0.1)',
            color: '#58A6FF',
            border: '1px solid rgba(88, 166, 255, 0.3)',
          }}>
            <Typography variant="body2" color="inherit">
              No pending invitations for this project.
            </Typography>
          </Alert>
        ) : (
          <List sx={{ maxHeight: 250, overflowY: 'auto' }}>
            {pendingInvitations.map((invite) => (
              <ListItem
                key={invite.invitation_id}
                sx={{
                  bgcolor: 'rgba(16,19,26,0.5)',
                  mb: 1,
                  borderRadius: '8px',
                  border: '1px solid rgba(88, 166, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(16,19,26,0.7)' }
                }}
              >
                <EmailRounded sx={{ color: '#A0B3D6', mr: 2 }} />
                <ListItemText
                  primary={
                    <Typography fontWeight="medium" color="#E6EDF3">
                      {invite.invited_email}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#A0B3D6', fontSize: '0.8rem' }}>
                      <AccessTimeRounded sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {isExpired(invite.expires_at) ? (
                        <Chip label="Expired" size="small" color="error" sx={{ bgcolor: '#ff6b6b', color: 'white', height: 20 }} />
                      ) : (
                        formatExpiryDate(invite.expires_at)
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <RoleChip role={invite.role} />
                  <IconButton
                    edge="end"
                    aria-label="copy link"
                    onClick={() => copyInvitationLink(invite.invitation_token)}
                    sx={{ ml: 1, color: '#A0B3D6', '&:hover': { color: '#58A6FF' } }}
                  >
                    <ContentCopyRounded />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(88, 166, 255, 0.1)' }}>
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
      </DialogActions>
    </Dialog>
  );
};

export default ProjectInvitation; 