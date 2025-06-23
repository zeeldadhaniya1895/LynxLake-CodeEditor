import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CheckCircleRounded,
  CancelRounded,
  SecurityRounded,
  AccessTimeRounded,
  PersonRounded,
} from '@mui/icons-material';

import useAPI from '../hooks/api';
import { useAuth } from '../context/auth';
import { ROLES, ROLE_INFO, RoleChip } from '../components/RoleBasedAccess';

const InvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { GET, POST } = useAPI();
  const { isAuthenticated } = useAuth();

  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');

  const validateInvitation = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await GET(`api/project/invitations/${token}`);
      setInvitation(response.data);
      setSelectedRole(response.data.role || ROLES.VIEWER);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid or expired invitation');
    } finally {
      setIsLoading(false);
    }
  }, [GET, token]);

  useEffect(() => {
    validateInvitation();
  }, [validateInvitation]);

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      toast('Please log in to accept the invitation', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
      navigate('/auth');
      return;
    }

    setIsAccepting(true);
    try {
      await POST(`api/project/invitations/${token}/accept`);
      
      toast('Invitation accepted successfully!', {
        icon: <CheckCircleRounded />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });

      // Redirect to the project
      navigate(`/api/editor/${invitation.project_id}`);
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to accept invitation', {
        icon: <CancelRounded />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineInvitation = () => {
    navigate('/');
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
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

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%)'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#58A6FF' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%)'
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              background: 'rgba(16, 19, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <CancelRounded sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>
                Invalid Invitation
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{
                  background: 'linear-gradient(135deg, #58A6FF 0%, #1F6FEB 100%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1F6FEB 0%, #58A6FF 100%)',
                  },
                }}
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!invitation) {
    return null;
  }

  const roleInfo = ROLE_INFO[invitation.role];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%)',
        p: 2
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            background: 'rgba(16, 19, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SecurityRounded sx={{ fontSize: 64, color: '#58A6FF', mb: 2 }} />
              <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
                Project Invitation
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                You've been invited to join a collaborative project
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                Project Details
              </Typography>
              
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 2, 
                p: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Typography variant="h6" sx={{ color: '#58A6FF', mb: 1 }}>
                  {invitation.project_name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <RoleChip role={invitation.role} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {roleInfo?.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonRounded sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Invited by: {invitation.invited_by}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeRounded sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {isExpired(invitation.expires_at) 
                      ? 'Invitation expired' 
                      : formatExpiryDate(invitation.expires_at)
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>

            {isExpired(invitation.expires_at) ? (
              <Alert severity="error" sx={{ 
                background: 'rgba(244, 67, 54, 0.1)', 
                color: '#f44336',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                mb: 3
              }}>
                This invitation has expired. Please contact the project owner for a new invitation.
              </Alert>
            ) : (
              <Box sx={{ mb: 4 }}>
                {!isAuthenticated ? (
                  <Alert severity="warning" sx={{ 
                    background: 'rgba(255, 193, 7, 0.1)', 
                    color: '#ffc107',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    mb: 3
                  }}>
                    You need to be logged in to accept this invitation.
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ 
                    background: 'rgba(88, 166, 255, 0.1)', 
                    color: '#58A6FF',
                    border: '1px solid rgba(88, 166, 255, 0.3)',
                    mb: 3
                  }}>
                    You will be added to the project as {roleInfo?.label} with {roleInfo?.description.toLowerCase()}.
                  </Alert>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleDeclineInvitation}
                disabled={isAccepting}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    color: '#fff',
                    borderColor: '#fff',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Decline
              </Button>
              
              <Button
                variant="contained"
                onClick={handleAcceptInvitation}
                disabled={isAccepting || isExpired(invitation.expires_at) || !isAuthenticated}
                startIcon={isAccepting ? <CircularProgress size={20} /> : <CheckCircleRounded />}
                sx={{
                  background: 'linear-gradient(135deg, #58A6FF 0%, #1F6FEB 100%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1F6FEB 0%, #58A6FF 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {isAccepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InvitationPage; 