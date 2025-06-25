import React from 'react';
import {
  Box,
  Container,
  InputBase,
  IconButton,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  SearchRounded,
  SortByAlphaRounded,
} from '@mui/icons-material';
import { getAvatar, getUserInitials, getBestProfileImage } from '../utils/avatar';
import User from './User';

const ProjectHeader = ({ 
  searchValue, 
  onSearchChange, 
  onSortProjects, 
  isAscending, 
  userInfo,
  isProfileVisible,
  onToggleProfile,
  onCloseProfile,
  profileRef,
  showSearchAndSort = true
}) => {
  // Get the best available profile image
  const profileImageSrc = getBestProfileImage(userInfo);
  const initials = getUserInitials(userInfo);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(13, 17, 23, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(88, 166, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="/logo_1.jpg"
              alt="LynxLake Logo"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                objectFit: 'cover',
                border: '2px solid rgba(88, 166, 255, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '2px solid #58A6FF',
                  transform: 'scale(1.1)',
                }
              }}
            />
            <Typography variant="h5" fontWeight="bold" sx={{ 
              color: '#E6EDF3',
              background: 'linear-gradient(135deg, #E6EDF3, #58A6FF)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              LynxLake
            </Typography>
          </Box>

          {/* Search Bar & Sort Button - Only if showSearchAndSort */}
          {showSearchAndSort && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flex: 1,
            maxWidth: 600,
            mx: 4
          }}>
            <Box sx={{
              position: 'relative',
              width: '100%',
              '& .MuiInputBase-root': {
                color: '#E6EDF3',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(88, 166, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(88, 166, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&.Mui-focused': {
                  border: '1px solid #58A6FF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 0 0 3px rgba(88, 166, 255, 0.1)',
                },
              },
              '& .MuiInputBase-input': {
                padding: '12px 16px 12px 48px',
                fontSize: '16px',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1,
                },
              },
            }}>
              <SearchRounded sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: 20,
              }} />
              <InputBase
                placeholder="Search projects..."
                value={searchValue}
                onChange={onSearchChange}
                fullWidth
              />
            </Box>

            <Tooltip title={`Sort ${isAscending ? 'Descending' : 'Ascending'}`}>
              <IconButton
                onClick={onSortProjects}
                sx={{
                  color: '#58A6FF',
                  backgroundColor: 'rgba(88, 166, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(88, 166, 255, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <SortByAlphaRounded />
              </IconButton>
            </Tooltip>
          </Box>
          )}

          {/* Profile Section */}
          <Box sx={{ position: 'relative' }}>
            <Tooltip title="Profile Settings">
              <Avatar
                onClick={onToggleProfile}
                sx={{
                  cursor: 'pointer',
                  width: 40,
                  height: 40,
                  border: '2px solid rgba(88, 166, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '2px solid #58A6FF',
                    transform: 'scale(1.1)',
                  }
                }}
                alt={userInfo.userName}
                src={profileImageSrc}
              >
                {initials}
              </Avatar>
            </Tooltip>
          </Box>
        </Box>
      </Container>

      {/* Profile Dropdown */}
      {isProfileVisible && (
        <Box
          ref={profileRef}
          sx={{
            position: 'absolute',
            top: 80,
            right: 24,
            zIndex: 1000,
            bgcolor: 'rgba(22, 27, 34, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(88, 166, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          <User handleClose={onCloseProfile} />
        </Box>
      )}
    </Box>
  );
};

export default ProjectHeader; 