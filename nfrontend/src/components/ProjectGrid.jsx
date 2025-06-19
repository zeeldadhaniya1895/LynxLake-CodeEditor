import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Card,
} from '@mui/material';
import {
  CodeRounded,
  AddRounded,
} from '@mui/icons-material';
import ProjectCard from './ProjectCard';

const ProjectGrid = ({
  projects,
  isLoading,
  searchValue,
  onOpenDialog,
  onEditProject,
  onDeleteProject,
  onInvite,
  onManageMembers,
  onRenameProject,
  onShareProject,
  onArchiveProject,
  onDownloadProject,
  onOpenProject,
  userInfo
}) => {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton
              variant="rounded"
              height={200}
              sx={{
                bgcolor: 'rgba(88, 166, 255, 0.1)',
                borderRadius: '16px',
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!isLoading && (!projects || projects.length === 0)) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        bgcolor: '#161B22',
        borderRadius: '20px',
        border: '1px dashed rgba(88, 166, 255, 0.3)',
      }}>
        <CodeRounded sx={{ fontSize: 80, color: '#A0B3D6', mb: 2 }} />
        <Typography variant="h6" color="#A0B3D6" sx={{ mb: 1 }}>
          No projects found
        </Typography>
        <Typography variant="body2" color="#A0B3D6">
          {searchValue ? 'No projects match your search' : 'Create your first project to get started'}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {projects.map((project) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={project.project_id || project._id} sx={{ overflow: 'visible' }}>
          <ProjectCard
            project={project}
            onEdit={onEditProject}
            onDelete={onDeleteProject}
            onInvite={onInvite}
            onManageMembers={onManageMembers}
            onRename={onRenameProject}
            onShare={onShareProject}
            onArchive={onArchiveProject}
            onDownload={onDownloadProject}
            userRole={project.role}
            onOpenProject={() => onOpenProject(project)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const CreateProjectCard = ({ onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 250,
        height: 250,
        background: 'linear-gradient(145deg, #161B22 0%, #0D1117 100%)',
        border: '1px solid rgba(88, 166, 255, 0.2)',
        borderRadius: '30% 60% 40% 50% / 60% 40% 50% 30%', // A new organic, fluid shape
        cursor: 'pointer',
        transition: 'all 0.4s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(88, 166, 255, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          borderRadius: '30% 60% 40% 50% / 60% 40% 50% 30%',
          background: 'radial-gradient(circle at center, rgba(88, 166, 255, 0.3) 0%, transparent 70%)',
          opacity: 0,
          transition: 'opacity 0.4s ease-in-out',
          zIndex: 1,
        },
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 15px 45px rgba(0,0,0,0.7), inset 0 0 20px rgba(88, 166, 255, 0.2)',
          borderColor: '#58A6FF',
          '&::before': {
            opacity: 1,
          },
          '& .AddRounded-icon': {
            transform: 'scale(1.1) rotate(90deg)',
            color: '#58A6FF',
          },
          '& .create-text': {
            color: '#58A6FF',
          },
          '& .sub-text': {
            color: '#E6EDF3',
          },
        }
      }}
    >
      <AddRounded 
        className="AddRounded-icon"
        sx={{ 
          fontSize: 80, 
          color: '#E6EDF3', // Default color for the icon
          mb: 2,
          transition: 'all 0.4s ease-in-out',
          zIndex: 2,
        }}
      />
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        className="create-text"
        sx={{
          color: '#E6EDF3', // Default color for main text
          transition: 'all 0.4s ease-in-out',
          zIndex: 2,
        }}
      >
        Add New Lake
      </Typography>
      <Typography 
        variant="body2" 
        className="sub-text"
        sx={{
          color: '#A0B3D6', // Default color for sub text
          mt: 1,
          transition: 'all 0.4s ease-in-out',
          zIndex: 2,
        }}
      >
        Start coding together
      </Typography>
    </Box>
  );
};

export { ProjectGrid, CreateProjectCard }; 