import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, TextField, CircularProgress } from "@mui/material";
import { DeleteOutlineRounded, PersonAddRounded } from "@mui/icons-material";
import { Grid } from "@mui/material";

// Components
import ProjectHeader from "../components/ProjectHeader";
import { ProjectGrid, CreateProjectCard } from "../components/ProjectGrid";
import ProjectInvitation from "../components/ProjectInvitation";
import ProjectMembers from "../components/ProjectMembers";
import CustomDialog from "../components/CustomDialog";
import InvitationCard from "../components/InvitationCard";

// Hooks
import useAPI from "../hooks/api";

// Contexts
import { useUser } from "../context/user";

// Material-UI Components
import {
  Box,
  Container,
  Typography,
} from "@mui/material";

// Material-UI Icons
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

// Interactive Background Component
const InteractiveBackground = () => (
  <Box sx={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh', 
    zIndex: -1, 
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%)'
  }}>
    {/* Animated Grid */}
    <Box sx={{ 
      position: 'absolute', 
      width: '100%', 
      height: '100%',
      opacity: 0.08,
      backgroundImage: `
        linear-gradient(rgba(88, 166, 255, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(88, 166, 255, 0.15) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      animation: 'gridMove 25s linear infinite'
    }} />
    
    {/* Secondary Grid Layer */}
    <Box sx={{ 
      position: 'absolute', 
      width: '100%', 
      height: '100%',
      opacity: 0.04,
      backgroundImage: `
        linear-gradient(rgba(31, 111, 235, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(31, 111, 235, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '120px 120px',
      animation: 'gridMoveReverse 35s linear infinite'
    }} />
    
    {/* Floating Code Symbols */}
    {[...Array(20)].map((_, i) => (
      <Box
        key={i}
        sx={{
          position: 'absolute',
          color: `rgba(88, 166, 255, ${0.2 + (i % 3) * 0.1})`,
          fontSize: `${1.2 + (i % 4) * 0.3}rem`,
          fontWeight: 'bold',
          animation: `float ${10 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          left: `${5 + (i * 8) % 90}%`,
          top: `${10 + (i * 15) % 80}%`,
          filter: 'blur(0.2px)',
          textShadow: '0 0 8px rgba(88, 166, 255, 0.3)',
        }}
      >
        {['{}', '()', '[]', '<>', '//', '&&', '||', '=>', '++', '--', '==', '!=', '+=', '-=', '*=', 'const', 'let', 'var', 'func', 'class'][i % 20]}
      </Box>
    ))}
    
    {/* Glowing Orbs */}
    {[...Array(12)].map((_, i) => (
      <Box
        key={`orb-${i}`}
        sx={{
          position: 'absolute',
          width: `${80 + i * 15}px`,
          height: `${80 + i * 15}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(88, 166, 255, ${0.08 - i * 0.005}) 0%, transparent 70%)`,
          animation: `pulse ${5 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.6}s`,
          left: `${8 + (i * 10) % 85}%`,
          top: `${5 + (i * 12) % 75}%`,
          filter: 'blur(1px)',
        }}
      />
    ))}
    
    {/* Animated Lines */}
    {[...Array(6)].map((_, i) => (
      <Box
        key={`line-${i}`}
        sx={{
          position: 'absolute',
          width: '2px',
          height: '100px',
          background: `linear-gradient(180deg, transparent 0%, rgba(88, 166, 255, ${0.3 - i * 0.05}) 50%, transparent 100%)`,
          animation: `lineFloat ${8 + i}s ease-in-out infinite`,
          animationDelay: `${i * 1.2}s`,
          left: `${15 + (i * 15) % 70}%`,
          top: '-100px',
          transform: 'rotate(45deg)',
        }}
      />
    ))}
    
    {/* Data Flow Particles */}
    {[...Array(8)].map((_, i) => (
      <Box
        key={`particle-${i}`}
        sx={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: `rgba(88, 166, 255, ${0.6 - i * 0.05})`,
          animation: `particleFlow ${12 + i * 2}s linear infinite`,
          animationDelay: `${i * 1.5}s`,
          left: '-10px',
          top: `${20 + (i * 10) % 60}%`,
          boxShadow: '0 0 6px rgba(88, 166, 255, 0.8)',
        }}
      />
    ))}
    
    {/* Matrix Rain Effect */}
    {[...Array(15)].map((_, i) => (
      <Box
        key={`matrix-${i}`}
        sx={{
          position: 'absolute',
          color: 'rgba(88, 166, 255, 0.3)',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
          animation: `matrixRain ${8 + i * 0.5}s linear infinite`,
          animationDelay: `${i * 0.3}s`,
          left: `${5 + (i * 6) % 90}%`,
          top: '-20px',
          whiteSpace: 'nowrap',
        }}
      >
        {String.fromCharCode(0x30A0 + Math.random() * 96)}
      </Box>
    ))}
    
    {/* Interactive Hover Areas */}
    <Box sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 20% 30%, rgba(88, 166, 255, 0.02) 0%, transparent 50%)',
      animation: 'hoverGlow 15s ease-in-out infinite',
    }} />
    
    <Box sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 80% 70%, rgba(31, 111, 235, 0.02) 0%, transparent 50%)',
      animation: 'hoverGlow 20s ease-in-out infinite reverse',
    }} />
    
    <style>{`
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(60px, 60px); }
      }
      @keyframes gridMoveReverse {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-120px, -120px); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
        25% { transform: translateY(-15px) rotate(90deg) scale(1.05); }
        50% { transform: translateY(-25px) rotate(180deg) scale(1.1); }
        75% { transform: translateY(-15px) rotate(270deg) scale(1.05); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.2); }
      }
      @keyframes lineFloat {
        0% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(45deg); opacity: 0; }
      }
      @keyframes particleFlow {
        0% { transform: translateX(-10px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(calc(100vw + 10px)); opacity: 0; }
      }
      @keyframes matrixRain {
        0% { transform: translateY(-20px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(calc(100vh + 20px)); opacity: 0; }
      }
      @keyframes hoverGlow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
    `}</style>
  </Box>
);

function ProjectPage() {
  const navigate = useNavigate();
  const { userInfo, getUser } = useUser();
  const { GET, DELETE, POST } = useAPI();
  
  // Store API functions in ref to avoid dependency issues
  const apiRef = useRef({ GET, DELETE, POST });
  apiRef.current.GET = GET;
  apiRef.current.DELETE = DELETE;
  apiRef.current.POST = POST;

  // State management
  const [allProjects, setAllProjects] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isFetchingProjectsLoading, setIsFetchingProjectsLoading] = useState(true);
  const [isFetchingInvitationsLoading, setIsFetchingInvitationsLoading] = useState(true);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isAscending, setIsAscending] = useState(true);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [profileRef] = useState(useRef(null));

  // New state for role-based components
  const [openInvitationDialog, setOpenInvitationDialog] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Delete confirmation dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Rename project dialog state
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [projectToRename, setProjectToRename] = useState(null);

  // Event handlers
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  // New role-based handlers
  const handleOpenInvitationDialog = (project) => {
    setSelectedProject(project);
    setOpenInvitationDialog(true);
  };

  const handleCloseInvitationDialog = () => {
    setOpenInvitationDialog(false);
    setSelectedProject(null);
  };

  const handleOpenMembersDialog = (project) => {
    setSelectedProject(project);
    setOpenMembersDialog(true);
  };

  const handleCloseMembersDialog = () => {
    setOpenMembersDialog(false);
    setSelectedProject(null);
  };

  const handleInvitationSent = () => {
    fetchProjects();
  };

  const handleMemberUpdated = () => {
    fetchProjects();
  };

  const handleAcceptInvitation = async (invitation) => {
    try {
      await apiRef.current.POST(`api/project/invitations/${invitation.invitation_id}/accept`);
      
      toast("Invitation accepted successfully!", {
        icon: <CheckCircleRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
      
      // Refresh both projects and invitations
      fetchProjects();
      fetchPendingInvitations();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast(error.response?.data?.message || "Failed to accept invitation", {
        icon: <CancelRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
    }
  };

  const handleRejectInvitation = async (invitation) => {
    try {
      await apiRef.current.POST(`api/project/invitations/${invitation.invitation_id}/reject`);
      
      toast("Invitation rejected", {
        icon: <InfoRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
      
      // Refresh invitations
      fetchPendingInvitations();
    } catch (error) {
      console.error("Failed to reject invitation:", error);
      toast(error.response?.data?.message || "Failed to reject invitation", {
        icon: <CancelRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
    }
  };

  const handleInputChange = (e) => setSearchValue(e.target.value);

  const toggleProfile = (e) => {
    e.stopPropagation();
    setIsProfileVisible((prev) => !prev);
  };

  const handleCloseProfile = useCallback(() => setIsProfileVisible(false), []);

  const sortProjectsByName = () => {
    const sortedProjects = [...allProjects].sort((a, b) => {
      return isAscending
        ? a.project_name.localeCompare(b.project_name)
        : b.project_name.localeCompare(a.project_name);
    });
    setAllProjects(sortedProjects);
    setIsAscending(!isAscending);
  };

  // Fetch projects on component mount
  const fetchProjects = useCallback(async () => {
    setIsFetchingProjectsLoading(true);
    try {
      const response = await apiRef.current.GET("/api/project/get-all-projects");
      
      // Backend returns the data directly as an array
      const projectsData = response?.data || [];
      
      // Ensure projectsData is an array
      if (!Array.isArray(projectsData)) {
        console.error("Invalid response format:", projectsData);
        setAllProjects([]);
        return;
      }
      
      setAllProjects(projectsData);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      
      // Handle different types of errors
      let errorMessage = "Failed to load projects!";
      if (error.response?.status === 401) {
        errorMessage = "Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast(errorMessage,
        {
          icon: <CancelRoundedIcon />,
          style: {
            borderRadius: '10px',
            background: 'rgba(16, 19, 26, 0.95)',
            color: '#fff',
          },
        }
      );
      // Set empty arrays on error to prevent flickering
      setAllProjects([]);
    } finally {
      setIsFetchingProjectsLoading(false);
      setHasInitialLoadCompleted(true);
    }
  }, []); // Remove GET dependency to prevent infinite loop

  const fetchPendingInvitations = useCallback(async () => {
    setIsFetchingInvitationsLoading(true);
    try {
      const response = await apiRef.current.GET("/api/project/invitations/pending");
      const invitationsData = response?.data || [];
      
      if (!Array.isArray(invitationsData)) {
        console.error("Invalid invitations response format:", invitationsData);
        setPendingInvitations([]);
        return;
      }
      
      setPendingInvitations(invitationsData);
    } catch (error) {
      console.error("Failed to fetch pending invitations:", error);
      setPendingInvitations([]);
    } finally {
      setIsFetchingInvitationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchPendingInvitations();
  }, []); // Only run once on mount

  // Filter projects based on search value using useMemo for optimization
  const filteredProjects = useMemo(() => {
    if (!hasInitialLoadCompleted || isFetchingProjectsLoading) {
      return allProjects;
    }
    return allProjects.filter(project =>
      (project.project_name || project.projectName || '').toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, allProjects, isFetchingProjectsLoading, hasInitialLoadCompleted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search projects..."]');
        if (searchInput) searchInput.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Profile dropdown click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        handleCloseProfile();
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleCloseProfile, profileRef]);

  // Escape key handler for profile dropdown
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleCloseProfile();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleCloseProfile]);

  // Project action handlers
  const handleEditProject = (project) => {
    // TODO: Implement edit functionality
    toast("Edit feature coming soon!", {
      icon: <InfoRoundedIcon />,
      style: {
        borderRadius: '10px',
        background: 'rgba(16, 19, 26, 0.95)',
        color: '#fff',
      },
    });
  };

  const handleDeleteProject = async (project) => {
    // Open custom confirmation dialog
    setProjectToDelete(project);
    setDeleteConfirmationText(""); // Reset confirmation text
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    // Check if the confirmation text matches the project name
    const projectName = projectToDelete.project_name || projectToDelete.projectName;
    if (deleteConfirmationText !== projectName) {
      toast("Please type the exact project name to confirm deletion", {
        icon: <CancelRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
      return;
    }

    try {
      setIsDeletingProject(true);
      const response = await apiRef.current.DELETE(`api/project/${projectToDelete.project_id || projectToDelete._id}`);
      
      // Update the projects list with the response
      if (response?.data?.projects) {
        setAllProjects(response.data.projects);
      }

      toast("Project deleted successfully!", {
        icon: <CheckCircleRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
      
      let errorMessage = "Failed to delete project!";
      if (error.response?.status === 403) {
        errorMessage = "Only project owners can delete projects.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast(errorMessage, {
        icon: <CancelRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
    } finally {
      setOpenDeleteDialog(false);
      setProjectToDelete(null);
      setDeleteConfirmationText(""); // Reset confirmation text
      setIsDeletingProject(false);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setProjectToDelete(null);
    setDeleteConfirmationText(""); // Reset confirmation text
    setIsDeletingProject(false); // Reset loading state
  };

  const handleInvite = (project) => {
    handleOpenInvitationDialog(project);
  };

  const handleManageMembers = (project) => {
    handleOpenMembersDialog(project);
  };

  const handleRenameProject = (project) => {
    setProjectToRename(project);
    setOpenRenameDialog(true);
  };

  const handleDownloadProject = (project) => {
    // TODO: Implement download functionality
    toast("Download feature coming soon!",
      {
        icon: <InfoRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      }
    );
  };

  const handleShareProject = (project) => {
    // TODO: Implement share functionality
    toast("Share feature coming soon!",
      {
        icon: <InfoRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      }
    );
  };

  const handleArchiveProject = (project) => {
    // TODO: Implement archive functionality
    toast("Archive feature coming soon!",
      {
        icon: <InfoRoundedIcon />,
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      }
    );
  };

  const handleOpenProject = (project) => {
    navigate(`/project/${project.project_id || project._id}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <InteractiveBackground />
      
      {/* Header */}
      <ProjectHeader
        searchValue={searchValue}
        onSearchChange={handleInputChange}
        onSortProjects={sortProjectsByName}
        isAscending={isAscending}
        userInfo={userInfo}
        isProfileVisible={isProfileVisible}
        onToggleProfile={toggleProfile}
        onCloseProfile={handleCloseProfile}
        profileRef={profileRef}
      />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ 
            color: '#E6EDF3', 
            mb: 2,
            background: 'linear-gradient(135deg, #E6EDF3, #58A6FF)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome back, {userInfo.userName}! 👋
          </Typography>
          <Typography variant="h6" color="#A0B3D6" sx={{ mb: 4 }}>
            Ready to code with your team?
          </Typography>
        </Box>

        {/* Create Project Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CreateProjectCard onClick={handleOpenDialog} />
        </Box>

        {/* My Projects Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="#E6EDF3">
              My Projects ({filteredProjects.length})
            </Typography>
          </Box>

          <ProjectGrid
            projects={filteredProjects}
            isLoading={isFetchingProjectsLoading}
            searchValue={searchValue}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onInvite={handleInvite}
            onManageMembers={handleManageMembers}
            onRenameProject={handleRenameProject}
            onShareProject={handleShareProject}
            onArchiveProject={handleArchiveProject}
            onDownloadProject={handleDownloadProject}
            onOpenProject={handleOpenProject}
            userInfo={userInfo}
          />
        </Box>

        {/* Invitations & Other Projects Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="#E6EDF3">
              Invitations & Other Projects ({pendingInvitations.length})
            </Typography>
          </Box>

          {isFetchingInvitationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : pendingInvitations.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              background: 'rgba(16, 19, 26, 0.3)',
              borderRadius: 3,
              border: '1px solid rgba(88, 166, 255, 0.1)'
            }}>
              <PersonAddRounded sx={{ fontSize: 64, color: '#A0B3D6', mb: 2 }} />
              <Typography variant="h6" color="#A0B3D6" mb={1}>
                No Pending Invitations
              </Typography>
              <Typography variant="body2" color="#A0B3D6">
                You don't have any pending project invitations at the moment.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {pendingInvitations.map((invitation) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={invitation.invitation_id}>
                  <InvitationCard
                    invitation={invitation}
                    onAccept={handleAcceptInvitation}
                    onReject={handleRejectInvitation}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Dialogs */}
      <CustomDialog 
        open={openDialog}
        handleClose={handleCloseDialog}
        setAllProjects={setAllProjects}
      />

      <CustomDialog
        open={openRenameDialog}
        handleClose={() => {
          setOpenRenameDialog(false);
          setProjectToRename(null);
        }}
        isRenameMode={true}
        currentProjectName={projectToRename?.project_name || projectToRename?.projectName}
        projectIdToRename={projectToRename?.project_id || projectToRename?._id}
        setAllProjects={setAllProjects}
      />

      <ProjectInvitation
        open={openInvitationDialog}
        onClose={handleCloseInvitationDialog}
        projectId={selectedProject?.project_id}
        projectName={selectedProject?.project_name}
        onInvitationSent={handleInvitationSent}
      />

      <ProjectMembers
        open={openMembersDialog}
        onClose={handleCloseMembersDialog}
        projectId={selectedProject?.project_id}
        projectName={selectedProject?.project_name}
        currentUserRole={selectedProject?.role}
        onMemberUpdated={handleMemberUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(16, 19, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          color: '#fff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <DeleteOutlineRounded sx={{ color: '#f44336' }} />
          <Typography variant="h6">
            Delete Project
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
            Are you sure you want to delete <strong>"{projectToDelete?.project_name || projectToDelete?.projectName}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
            This action cannot be undone and will permanently delete all files and data associated with this project.
          </Typography>
          
          <Alert severity="warning" sx={{ 
            background: 'rgba(255, 152, 0, 0.1)', 
            color: '#ff9800',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            mb: 3
          }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This will permanently delete the project and all its contents.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#fff', mb: 2 }}>
              To confirm deletion, please type <strong>"{projectToDelete?.project_name || projectToDelete?.projectName}"</strong> below:
            </Typography>
            <TextField
              fullWidth
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type the project name to confirm"
              variant="outlined"
              disabled={isDeletingProject}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: deleteConfirmationText === (projectToDelete?.project_name || projectToDelete?.projectName) 
                      ? '#4caf50' 
                      : 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: deleteConfirmationText === (projectToDelete?.project_name || projectToDelete?.projectName)
                      ? '#4caf50'
                      : '#f44336',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: deleteConfirmationText === (projectToDelete?.project_name || projectToDelete?.projectName)
                      ? '#4caf50'
                      : '#f44336',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.3)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                },
              }}
            />
            {deleteConfirmationText && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: deleteConfirmationText === (projectToDelete?.project_name || projectToDelete?.projectName) 
                    ? '#4caf50' 
                    : '#f44336',
                  mt: 1,
                  display: 'block'
                }}
              >
                {deleteConfirmationText === (projectToDelete?.project_name || projectToDelete?.projectName)
                  ? '✓ Project name matches'
                  : '✗ Project name does not match'
                }
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            disabled={isDeletingProject}
            sx={{
              color: '#58A6FF',
              borderColor: '#58A6FF',
              '&:hover': {
                borderColor: '#1F6FEB',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteConfirmationText !== (projectToDelete?.project_name || projectToDelete?.projectName) || isDeletingProject}
            startIcon={isDeletingProject ? <CircularProgress size={20} color="inherit" /> : <DeleteOutlineRounded />}
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {isDeletingProject ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectPage; 