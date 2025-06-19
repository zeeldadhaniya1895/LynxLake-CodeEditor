import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import {
  CloseRounded as CloseRoundedIcon,
  AddRounded as AddRoundedIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  CancelRounded as CancelRoundedIcon,
  DriveFileRenameOutlineRounded as DriveFileRenameOutlineRoundedIcon,
} from '@mui/icons-material';
import useAPI from '../hooks/api';
import { isValidProjectName } from '../utils/validation';

const CustomDialog = ({
  open,
  handleClose,
  setAllProjects,
  isRenameMode = false,
  currentProjectName = '',
  projectIdToRename = null,
}) => {
  const { POST, PUT } = useAPI();
  const modalRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [justVerify, setJustVerify] = useState(false);
  const [projectNameError, setProjectNameError] = useState(false);

  useEffect(() => {
    if (isRenameMode && currentProjectName) {
      setProjectName(currentProjectName);
    } else {
      setProjectName("");
    }
  }, [open, isRenameMode, currentProjectName]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClose]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  if (!open) return null;

  const handleValidation = () => {
    setJustVerify(true);
    if (projectName.trim() === "") {
      setProjectNameError("Project name is required");
      return false;
    }
    if (projectName.trim().length < 3 || projectName.trim().length > 50) {
      setProjectNameError("Project name must be between 3 and 50 characters");
      return false;
    }
    if (!isValidProjectName(projectName.trim())) {
      setProjectNameError("Project name contains invalid characters");
      return false;
    }
    setProjectNameError(false);
    return true;
  };

  const addProject = async () => {
    if (!handleValidation()) return;

    setIsProcessing(true);
    try {
      const results = await POST("/api/project/add-project", { projectName: projectName.trim() });
      setProjectName("");
      setAllProjects(results.data.projects);
      toast(results?.data?.message || "Project created successfully!",
        {
          icon: <CheckCircleRoundedIcon />,
          style: {
            borderRadius: '10px',
            background: 'rgba(16, 19, 26, 0.95)',
            color: '#fff',
          },
        }
      );
      handleClose();
    } catch (error) {
      toast(error.response?.data?.message || "Something went wrong!",
        {
          icon: <CancelRoundedIcon />,
          style: {
            borderRadius: '10px',
            background: 'rgba(16, 19, 26, 0.95)',
            color: '#fff',
          },
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renameProject = async () => {
    if (!handleValidation()) return;
    if (projectName.trim() === currentProjectName) {
      toast("New project name is the same as the current one.", {
        icon: 'ℹ️',
        style: {
          borderRadius: '10px',
          background: 'rgba(16, 19, 26, 0.95)',
          color: '#fff',
        },
      });
      handleClose();
      return;
    }

    setIsProcessing(true);
    try {
      const results = await PUT(`/api/project/${projectIdToRename}/rename`, { newProjectName: projectName.trim() });
      setAllProjects(results.data.projects);
      toast(results?.data?.message || "Project renamed successfully!",
        {
          icon: <CheckCircleRoundedIcon />,
          style: {
            borderRadius: '10px',
            background: 'rgba(16, 19, 26, 0.95)',
            color: '#fff',
          },
        }
      );
      handleClose();
    } catch (error) {
      toast(error.response?.data?.message || "Failed to rename project!",
        {
          icon: <CancelRoundedIcon />,
          style: {
            borderRadius: '10px',
            background: 'rgba(16, 19, 26, 0.95)',
            color: '#fff',
          },
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRenameMode) {
      renameProject();
    } else {
      addProject();
    }
  };

  const handleChangeProjectName = (e) => {
    setProjectName(e.target.value);
    if (justVerify) {
      setProjectNameError(false);
    }
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Card ref={modalRef} sx={{
        minWidth: "400px",
        maxWidth: "500px",
        background: '#161B22',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(88, 166, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #58A6FF, #1F6FEB, #58A6FF)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }
      }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#A0B3D6',
            bgcolor: 'rgba(88, 166, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(88, 166, 255, 0.2)',
            }
          }}
        >
          <CloseRoundedIcon />
        </IconButton>

        <CardContent sx={{ p: 4, pt: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #58A6FF, #1F6FEB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 10px 30px rgba(88, 166, 255, 0.3)',
            }}>
              {isRenameMode ? (
                <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 40, color: 'white' }} />
              ) : (
                <AddRoundedIcon sx={{ fontSize: 40, color: 'white' }} />
              )}
            </Box>
            <Typography variant="h4" fontWeight="bold" color="#E6EDF3" gutterBottom>
              {isRenameMode ? "Rename Project" : "Create New Project"}
            </Typography>
            <Typography variant="body2" color="#A0B3D6">
              {isRenameMode ? "Update the name of your project" : "Start coding with your team in real-time"}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              value={projectName}
              onChange={handleChangeProjectName}
              label="Project Name"
              placeholder="Enter project name"
              variant="outlined"
              fullWidth
              required
              error={justVerify && projectNameError}
              helperText={justVerify && projectNameError ? projectNameError : ""}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'rgba(16,19,26,0.5)',
                  border: '1px solid rgba(88, 166, 255, 0.2)',
                  '&:hover': {
                    border: '1px solid rgba(88, 166, 255, 0.4)',
                  },
                  '&.Mui-focused': {
                    border: '1px solid #58A6FF',
                  },
                  '& .MuiInputBase-input': {
                    color: '#E6EDF3',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#A0B3D6',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isProcessing}
              sx={{
                mt: 2,
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
              {isProcessing ? (isRenameMode ? "Renaming..." : "Creating...") : (isRenameMode ? "Rename Project" : "Create Project")}
            </Button>
          </form>
        </CardContent>

        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </Card>
    </Box>
  );
};

export default CustomDialog; 