import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  FolderRounded,
  MoreVertRounded,
  DriveFileRenameOutlineRounded,
  ManageAccountsRounded,
  ShareRounded,
  DownloadRounded,
  ContentCopyRounded,
  DeleteOutlineRounded,
  ArchiveRounded,
  CalendarTodayRounded,
  PersonAddRounded,
} from '@mui/icons-material';
import { usePermissions, RoleChip } from './RoleBasedAccess';
import { formatTimestamp } from '../utils/formatters';

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onInvite,
  onManageMembers,
  onRename,
  onShare,
  onArchive,
  onCopyLink,
  onDownload,
  userRole,
  onOpenProject,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const { canManageUsers, canManageSettings, canDeleteProject, canExport } = usePermissions(userRole);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleCopyLink = (event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(project.shareable_link);
    toast("Shareable link copied to clipboard!", {
      icon: '✅',
      style: {
        borderRadius: '10px',
        background: 'rgba(16, 19, 26, 0.95)',
        color: '#fff',
      },
    });
    handleMenuClose();
  };

  const handleShare = (event) => {
    event.stopPropagation();
    onShare(project);
    handleMenuClose();
  };

  const handleDownload = (event) => {
    event.stopPropagation();
    onDownload(project);
    handleMenuClose();
  };

  const handleRename = (event) => {
    event.stopPropagation();
    onRename(project);
    handleMenuClose();
  };

  const handleManageMembers = (event) => {
    event.stopPropagation();
    onManageMembers(project);
    handleMenuClose();
  };

  const handleInvite = (event) => {
    event.stopPropagation();
    onInvite(project);
    handleMenuClose();
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(project);
    handleMenuClose();
  };

  const handleArchive = (event) => {
    event.stopPropagation();
    onArchive(project);
    handleMenuClose();
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpenProject}
      sx={{
        background: '#161B22',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(88, 166, 255, 0.15)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          border: '1px solid #58A6FF',
          boxShadow: '0 20px 40px rgba(88, 166, 255, 0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #58A6FF, #1F6FEB)',
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.3s ease',
        }
      }}
    >
      <CardContent sx={{ p: 3, overflow: 'visible' }}>
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
              <FolderRounded sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" color="#E6EDF3" sx={{ mb: 0.5 }}>
                {project.project_name || project.projectName}
              </Typography>
              <RoleChip role={userRole} />
            </Box>
          </Box>

          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={openMenu ? 'long-menu' : undefined}
            aria-expanded={openMenu ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
            sx={{
              color: '#A0B3D6',
              '&:hover': {
                bgcolor: 'rgba(88, 166, 255, 0.1)',
                color: '#58A6FF',
              }
            }}
          >
            <MoreVertRounded />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: '#161B22',
                border: '1px solid rgba(88, 166, 255, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }
            }}
          >
            {onRename && (
              <MenuItem onClick={handleRename} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                <DriveFileRenameOutlineRounded sx={{ mr: 1, color: '#A0B3D6' }} /> Rename Project
              </MenuItem>
            )}
            {canManageUsers && (
              <MenuItem onClick={handleManageMembers} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                <ManageAccountsRounded sx={{ mr: 1, color: '#A0B3D6' }} /> Manage Members
              </MenuItem>
            )}
            {canManageUsers && (
              <MenuItem onClick={handleInvite} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                <PersonAddRounded sx={{ mr: 1, color: '#A0B3D6' }} /> Invite to Project
              </MenuItem>
            )}
            {onShare && (
              <MenuItem onClick={handleShare} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                <ShareRounded sx={{ mr: 1, color: '#A0B3D6' }} /> Share Project
              </MenuItem>
            )}
            {onDownload && canExport && (
              <MenuItem onClick={handleDownload} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                <DownloadRounded sx={{ mr: 1, color: '#A0B3D6' }} /> Download Project
              </MenuItem>
            )}
            {project.shareable_link && (
              <MenuItem onClick={handleCopyLink} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                <ContentCopyRounded sx={{ mr: 1, color: '#A0B3D6' }} /> Copy Share Link
              </MenuItem>
            )}
            {onArchive && (
              <MenuItem onClick={handleArchive} sx={{ color: '#E6EDF3', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
                <ArchiveRounded sx={{ mr: 1, color: '#A0B3D6' }} /> Archive Project
              </MenuItem>
            )}
            {canDeleteProject && (
              <MenuItem onClick={handleDelete} sx={{ color: '#ff6b6b', '&:hover': { bgcolor: 'rgba(255,107,107,0.1)' } }}>
                <DeleteOutlineRounded sx={{ mr: 1, color: '#ff6b6b' }} /> Delete Project
              </MenuItem>
            )}
            <Divider sx={{ my: 0.5, borderColor: 'rgba(88,166,255,0.2)' }} />
            <MenuItem onClick={handleMenuClose} sx={{ color: '#A0B3D6', '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' } }}>
              Cancel
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', color: '#A0B3D6', fontSize: '0.8rem' }}>
          <CalendarTodayRounded sx={{ fontSize: '1rem', mr: 0.5 }} />
          <Typography variant="body2" fontSize="inherit">
            Last updated: {formatTimestamp(project.updated_at || project.project_timestamp)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard; 