// Desc: Enhanced User component to display and update user profile
import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast';

// Contexts
import { useUser } from '../context/user';
import { useAuth } from '../context/auth';

// Hooks
import useAPI from '../hooks/api';

// Utils
import { isValidFullName, isValidEmail, isValidWebsite } from '../utils/validation';
import { avatars, getAvatar, getBestProfileImage } from "../utils/avatar";
import { DateFormatter } from "../utils/formatters"
import { setDataToLocalStorage } from "../utils/auth"

// Material-UI Components
import {
    Box,
    Typography,
    Avatar,
    TextField,
    InputAdornment,
    CircularProgress,
    IconButton,
    Button,
    Chip,
    Divider,
    Paper,
    Grid,
    LinearProgress,
} from '@mui/material';

// Material-UI Icons
import PersonIcon from '@mui/icons-material/Person';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function User(props) {
    const { handleClose } = props;

    const { POST } = useAPI();
    const { userInfo, getUser } = useUser();
    const { LogOut } = useAuth();

    // Profile fields
    const [fullName, setFullName] = useState(userInfo.fullName || "");
    const [userName, setUserName] = useState(userInfo.userName || "");
    // UI states
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [justVerify, setJustVerify] = useState(false);

    // Avatar selection states
    const [isProfilePictureSelectOpen, setIsProfilePictureSelectOpen] = useState(false);
    const [hoveredAvatar, setHoveredAvatar] = useState(null);
    const [selectedProfileImage, setSelectedProfileImage] = useState(userInfo.profileImage);
    const [isLoadingProfileImageSave, setIsLoadingProfileImageSave] = useState(false);

    // Update selectedProfileImage when userInfo.profileImage changes
    useEffect(() => {
        setSelectedProfileImage(userInfo.profileImage);
    }, [userInfo.profileImage]);

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        const fields = [
            userInfo.fullName,
            userInfo.userName,
            userInfo.profileImage
        ];
        const completedFields = fields.filter(field => field && field.trim() !== "").length;
        return Math.round((completedFields / fields.length) * 100);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setJustVerify(true);

        if (fullName.trim() === "") {
            toast.error("Full name is required");
            return;
        }

        if (userName.trim() === "") {
            toast.error("Username is required");
            return;
        }

        if (userName.length < 3 || userName.length > 20) {
            toast.error("Username must be between 3 and 20 characters");
            return;
        }

        // You will need a backend validation for username uniqueness
        // For now, only client-side validation for length and required

        setIsUpdatingProfile(true);
        try {
            const results = await POST("/api/user", {
                name: fullName,
                username: userName,
            });
            toast.success(results?.data?.message || "Profile updated successfully");
            await setDataToLocalStorage(results.data);
            await getUser();
            setFullName(userInfo.fullName || "");
            setUserName(userInfo.userName || "");
            setIsEditing(false);
            handleClose(); // Close the User component modal after successful update
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating user data");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleCancelEdit = () => {
        setFullName(userInfo.fullName || "");
        setUserName(userInfo.userName || "");
        setIsEditing(false);
        setJustVerify(false);
    };

    const handleFullNameChange = (e) => {
        if (!isValidFullName(e.target.value) || e.target.value.length >= 255) return;
        setFullName(e.target.value);
        setJustVerify(true);
    };

    const handleUserNameChange = (e) => {
        // You might want a more robust validation for username here (e.g., regex for allowed characters)
        setUserName(e.target.value);
        setJustVerify(true);
    };

    const handleCloseProfilePicture = () => setIsProfilePictureSelectOpen(false);
    const handleOpenProfilePicture = () => setIsProfilePictureSelectOpen(true);

    const handleMouseEnter = (avatar) => {
        setHoveredAvatar(avatar);
    };

    const handleMouseLeave = () => {
        setHoveredAvatar(null);
    };

    const handleSaveProfileImage = async () => {
        setIsLoadingProfileImageSave(true);
        try {
            const results = await POST("/api/user/update-profile-image", { profile_image: selectedProfileImage });
            await setDataToLocalStorage(results.data);
            toast.success(results?.data?.message || "Profile image updated successfully");
            await getUser();
            await new Promise(resolve => setTimeout(resolve, 100));
            setSelectedProfileImage(selectedProfileImage);
            handleCloseProfilePicture();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating profile image" );
        } finally {
            setIsLoadingProfileImageSave(false);
        }
    };

    const profileCompletion = calculateProfileCompletion();

    return (
        <>
            {/* Avatar Selection Modal */}
            {isProfilePictureSelectOpen && (
                <Box sx={{ 
                    zIndex: 9999999, 
                    position: "fixed", 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    bgcolor: 'rgba(0,0,0,0.8)',
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Paper sx={{ 
                        maxWidth: 500, 
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        p: 4, 
                        position: "relative", 
                        borderRadius: 3,
                        bgcolor: '#161B22',
                        border: '1px solid rgba(88, 166, 255, 0.15)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <IconButton
                            onClick={handleCloseProfilePicture}
                            sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                color: '#A0B3D6',
                                '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' },
                            }}
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                        
                        <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center" color="#E6EDF3">
                            Choose Your Avatar
                        </Typography>
                        
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                            <Avatar
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    fontSize: 60, 
                                    border: "3px solid #58A6FF",
                                    boxShadow: '0 4px 20px rgba(88,166,255,0.3)'
                                }}
                                alt={userInfo.userName}
                                src={hoveredAvatar ? hoveredAvatar : getAvatar(selectedProfileImage)}
                                imgProps={{
                                    crossOrigin: "anonymous",
                                    referrerPolicy: "no-referrer",
                                    decoding: "async",
                                }}
                            />
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="#A0B3D6" mb={2}>
                                Available Avatars
                            </Typography>
                            <Box sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                justifyContent: "center",
                                maxHeight: 300,
                                overflowY: "auto"
                            }}>
                                {userInfo.image && (
                                <Avatar
                                    sx={{
                                        cursor: "pointer",
                                        width: 60,
                                        height: 60,
                                        bgcolor: 'rgba(16,19,26,0.5)',
                                        border: selectedProfileImage === userInfo.image ? '3px solid #58A6FF' : '3px solid transparent',
                                        boxShadow: selectedProfileImage === userInfo.image ? '0 0 15px rgba(88,166,255,0.7)' : 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { transform: 'scale(1.1)', boxShadow: '0 0 20px rgba(88,166,255,0.9)' }
                                    }}
                                    alt="Google Profile"
                                    src={userInfo.image}
                                    onClick={() => setSelectedProfileImage(userInfo.image)}
                                    onMouseEnter={() => handleMouseEnter(userInfo.image)}
                                    onMouseLeave={handleMouseLeave}
                                    imgProps={{
                                        crossOrigin: "anonymous",
                                        referrerPolicy: "no-referrer",
                                        decoding: "async",
                                    }}
                                />
                                )}
                            {avatars.map((avatar, index) => (
                                <Avatar
                                    key={index}
                                    sx={{
                                        cursor: "pointer",
                                            width: 60,
                                            height: 60,
                                            bgcolor: 'rgba(16,19,26,0.5)',
                                            border: selectedProfileImage === index.toString() ? '3px solid #58A6FF' : '3px solid transparent',
                                            boxShadow: selectedProfileImage === index.toString() ? '0 0 15px rgba(88,166,255,0.7)' : 'none',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { transform: 'scale(1.1)', boxShadow: '0 0 20px rgba(88,166,255,0.9)' }
                                        }}
                                        alt={`Avatar ${index + 1}`}
                                        src={avatar}
                                        onClick={() => setSelectedProfileImage(index.toString())}
                                        onMouseEnter={() => handleMouseEnter(avatar)}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                ))}
                            </Box>
                        </Box>
                        
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSaveProfileImage}
                            disabled={isLoadingProfileImageSave || selectedProfileImage === userInfo.profileImage}
                            sx={{
                                mt: 3,
                                bgcolor: '#58A6FF',
                                color: '#fff',
                                '&:hover': { bgcolor: '#1F6FEB' }
                            }}
                        >
                            {isLoadingProfileImageSave ? <CircularProgress size={24} color="inherit" /> : "Save Profile Picture"}
                        </Button>
                    </Paper>
                </Box>
            )}

            <Paper sx={{
                borderRadius: 4,
                overflow: 'hidden',
                width: '100%',
                maxWidth: 600,
                mx: 'auto',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                bgcolor: '#161B22',
                border: '1px solid rgba(88, 166, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, rgba(16,19,26,0.95) 0%, rgba(5,7,10,0.95) 100%)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(88,166,255,0.15)',
                    p: 3,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#E6EDF3'
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                            sx={{
                                        width: 80,
                                        height: 80,
                                        fontSize: 40,
                                bgcolor: '#58A6FF',
                                border: '3px solid #58A6FF',
                                boxShadow: '0 4px 20px rgba(88,166,255,0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 6px 25px rgba(88,166,255,0.4)',
                                        }
                                    }}
                            alt={userInfo.userName}
                            src={getBestProfileImage(userInfo)}
                            onClick={handleOpenProfilePicture}
                                    imgProps={{
                                        crossOrigin: "anonymous",
                                        referrerPolicy: "no-referrer",
                                        decoding: "async",
                                    }}
                        />
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="#E6EDF3">
                                {userInfo.fullName || userInfo.userName}
                            </Typography>
                            <Typography variant="body2" color="#A0B3D6">
                                {userInfo.email}
                            </Typography>
                            <Chip
                                label={`${profileCompletion}% Complete`}
                                size="small"
                                            sx={{
                                    mt: 1,
                                    bgcolor: profileCompletion === 100 ? '#4CAF50' : '#FFA726',
                                    color: 'white',
                                    fontWeight: 'bold',
                                            }}
                                        />
                        </Box>
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                color: '#A0B3D6',
                                '&:hover': { bgcolor: 'rgba(88,166,255,0.1)' },
                            }}
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Profile Completion Bar */}
                <Box sx={{ p: 2, bgcolor: 'rgba(16,19,26,0.5)' }}>
                    <Typography variant="body2" color="#A0B3D6" mb={1}>
                        Profile Completion
                    </Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={profileCompletion}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(88,166,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: profileCompletion === 100 ? '#4CAF50' : '#58A6FF',
                                borderRadius: 4,
                            }
                        }}
                    />
                </Box>

                {/* Profile Content */}
                <Box sx={{ p: 3, bgcolor: '#161B22' }}>
                    <form onSubmit={handleUpdateProfile}>
                        <Grid container spacing={3}>
                            {/* Full Name */}
                            <Grid item xs={12}>
                        <TextField
                            value={fullName}
                            onChange={handleFullNameChange}
                                    label="Full Name"
                                    placeholder="Enter your full name"
                            variant="outlined"
                            fullWidth
                                    disabled={!isEditing}
                                    error={justVerify && fullName.trim() === ""}
                                    helperText={justVerify && fullName.trim() === "" ? "Full name is required" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                                <PersonIcon sx={{ color: isEditing ? '#58A6FF' : '#A0B3D6' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                        '& .MuiInputLabel-root': { color: '#A0B3D6' },
                                        '& .MuiInputBase-input': { color: '#E6EDF3' },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: 'rgba(16,19,26,0.5)',
                                            '& fieldset': {
                                                borderColor: 'rgba(88,166,255,0.2)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#58A6FF',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#58A6FF',
                                            },
                                            '&.Mui-disabled': {
                                                bgcolor: 'rgba(16,19,26,0.3)',
                                            },
                                        },
                                        '& .MuiFormHelperText-root': {
                                            color: '#ff6b6b',
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Username */}
                            <Grid item xs={12}>
                                <TextField
                                    value={userName}
                                    onChange={handleUserNameChange}
                                    label="Username"
                                    placeholder="Choose a unique username"
                                    variant="outlined"
                                    fullWidth
                                    disabled={!isEditing}
                                    error={justVerify && (userName.trim() === "" || userName.length < 3 || userName.length > 20)}
                                    helperText={justVerify && userName.trim() === "" ? "Username is required" : 
                                                justVerify && (userName.length < 3 || userName.length > 20) ? "Username must be between 3 and 20 characters" : ""}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleIcon sx={{ color: isEditing ? '#58A6FF' : '#A0B3D6' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiInputLabel-root': { color: '#A0B3D6' },
                                        '& .MuiInputBase-input': { color: '#E6EDF3' },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: 'rgba(16,19,26,0.5)',
                                            '& fieldset': {
                                                borderColor: 'rgba(88,166,255,0.2)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#58A6FF',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#58A6FF',
                                            },
                                            '&.Mui-disabled': {
                                                bgcolor: 'rgba(16,19,26,0.3)',
                                            },
                                        },
                                        '& .MuiFormHelperText-root': {
                                            color: '#ff6b6b',
                                        },
                                    }}
                        />
                            </Grid>

                            {/* Action Buttons */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                                    {!isEditing ? (
                                        <Button
                                            variant="contained"
                                            onClick={() => setIsEditing(true)}
                                            startIcon={<EditRoundedIcon />}
                                            sx={{
                                                bgcolor: '#58A6FF',
                                                color: '#fff',
                                                '&:hover': { bgcolor: '#1F6FEB' }
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outlined"
                                                onClick={handleCancelEdit}
                                                startIcon={<CancelIcon />}
                                                sx={{
                                                    borderColor: '#A0B3D6',
                                                    color: '#A0B3D6',
                                                    '&:hover': {
                                                        borderColor: '#58A6FF',
                                                        bgcolor: 'rgba(88,166,255,0.1)',
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={isUpdatingProfile}
                                                startIcon={isUpdatingProfile ? <CircularProgress size={20} /> : <SaveIcon />}
                                                sx={{
                                                    bgcolor: '#58A6FF',
                                                    color: '#fff',
                                                    '&:hover': { bgcolor: '#1F6FEB' }
                                                }}
                                            >
                                                {isUpdatingProfile ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </>
                                    )}
                    </Box>
                            </Grid>
                        </Grid>
                    </form>

                    <Divider sx={{ my: 3, borderColor: 'rgba(88,166,255,0.2)' }} />

                    {/* Account Information */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2} color="#E6EDF3">
                            Account Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="#A0B3D6">
                                    Username
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" color="#E6EDF3">
                                    {userInfo.userName || "N/A"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="#A0B3D6">
                                    Account Type
                                </Typography>
                                <Chip 
                                    label={userInfo.mode === 'google' ? 'Google Account' : 'Email Account'}
                                    size="small"
                                        sx={{
                                        bgcolor: userInfo.mode === 'google' ? '#4285F4' : '#58A6FF',
                                        color: 'white'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="#A0B3D6">
                                    Created
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" color="#E6EDF3">
                                    {DateFormatter(userInfo.createdAt) || "N/A"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="#A0B3D6">
                                    Last Updated
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" color="#E6EDF3">
                                    {DateFormatter(userInfo.updatedOn) || "N/A"}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Change Password Button (Conditional) */}
                    {userInfo.mode !== 'google' && (
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<LockOpenIcon />}
                            sx={{
                                mt: 2,
                                borderColor: '#58A6FF',
                                color: '#58A6FF',
                                '&:hover': {
                                    borderColor: '#1F6FEB',
                                    bgcolor: 'rgba(88,166,255,0.1)',
                                }
                            }}
                        >
                            Change Password
                        </Button>
                    )}

                    {/* Logout Button */}
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => LogOut()}
                        startIcon={<ExitToAppRoundedIcon />}
                        sx={{
                            borderColor: '#ff6b6b',
                            color: '#ff6b6b',
                            '&:hover': {
                                borderColor: '#ff5252',
                                bgcolor: 'rgba(255,107,107,0.1)'
                            },
                            mt: userInfo.mode !== 'google' ? 2 : 0, // Add margin top if Change Password is shown
                        }}
                    >
                        Sign Out
                    </Button>
                </Box>
            </Paper>
        </>
    );
}

export default User;