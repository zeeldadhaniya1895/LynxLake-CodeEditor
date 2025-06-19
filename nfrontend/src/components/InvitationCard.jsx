import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  CheckCircleRounded,
  CancelRounded,
  PersonAddRounded,
  AccessTimeRounded,
  PersonRounded,
} from '@mui/icons-material';
import { RoleChip } from './RoleBasedAccess';
import { formatTimestamp } from '../utils/formatters';

const InvitationCard = ({ invitation, onAccept, onReject }) => {
  const formatExpiryDate = (createdAt) => {
    const createdDate = new Date(createdAt);
    const expiryDate = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from creation
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

  const isExpired = (createdAt) => {
    const createdDate = new Date(createdAt);
    const expiryDate = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from creation
    return new Date() > expiryDate;
  };

  return (
    <Card
      sx={{
        background: '#161B22',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(88, 166, 255, 0.15)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          border: '1px solid #58A6FF',
          boxShadow: '0 12px 32px rgba(88, 166, 255, 0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #58A6FF, #1F6FEB)',
          transform: 'scaleX(1)',
          transition: 'transform 0.3s ease',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box sx={{
              width: 50,
              height: 50,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #58A6FF, #1F6FEB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 15px rgba(88, 166, 255, 0.3)',
            }}>
              <PersonAddRounded sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" color="#E6EDF3" sx={{ mb: 0.5 }}>
                {invitation.project_name}
              </Typography>
              <RoleChip role={invitation.role} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonRounded sx={{ fontSize: 16, color: '#A0B3D6' }} />
            <Typography variant="body2" color="#A0B3D6">
              Invited by: {invitation.invited_by}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeRounded sx={{ fontSize: 16, color: '#A0B3D6' }} />
            <Typography variant="body2" color="#A0B3D6">
              {isExpired(invitation.created_at) ? (
                <Chip label="Expired" size="small" color="error" sx={{ bgcolor: '#ff6b6b', color: 'white', height: 20 }} />
              ) : (
                formatExpiryDate(invitation.created_at)
              )}
            </Typography>
          </Box>

          <Typography variant="body2" color="#A0B3D6" fontSize="0.8rem">
            Invited: {formatTimestamp(invitation.created_at)}
          </Typography>
        </Box>

        {!isExpired(invitation.created_at) && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<CheckCircleRounded />}
              onClick={() => onAccept(invitation)}
              sx={{
                flex: 1,
                background: 'linear-gradient(135deg, #4caf50, #45a049)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049, #4caf50)',
                },
                borderRadius: '12px',
                py: 1,
              }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelRounded />}
              onClick={() => onReject(invitation)}
              sx={{
                flex: 1,
                color: '#ff6b6b',
                borderColor: '#ff6b6b',
                '&:hover': {
                  borderColor: '#ff5252',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                },
                borderRadius: '12px',
                py: 1,
              }}
            >
              Reject
            </Button>
          </Box>
        )}

        {isExpired(invitation.created_at) && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="#ff6b6b">
              This invitation has expired
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationCard; 