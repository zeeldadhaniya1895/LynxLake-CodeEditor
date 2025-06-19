// module-imports
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

//imported
import useAPI from "../../hooks/api";
import { isValidEmail, isValidUserName, isValidFullName, isValidProjectName, isValidWebsite } from "../../utils/validation";

//Material UI Components
import {
    Box,
    Grid,
    Avatar,
    Button,
    TextField,
    Tooltip,
    Zoom,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
} from "@mui/material";

//Material UI Icons
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LanguageIcon from '@mui/icons-material/Language';

//google-OAuth
import GoogleLogin from "./GoogleLogin.jsx";

//avatars
import { avatars } from "../../utils/avatar.js";
import { setDataToLocalStorage } from "../../utils/auth.js";

export default function RegisterPage({ hasAccount, setHasAccount }) {

    const { GET, POST } = useAPI();
    const navigate = useNavigate();
    const userNameControllerRef = useRef();
    const emailControllerRef = useRef();

    //google-OAuth
    const newUserNameControllerRef = useRef();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [newUserName, setNewUserName] = useState("");
    const [newUserNameJustVerify, setNewUserNameJustVerify] = useState(false);
    const [isValidNewUserNameLoading, setIsValidNewUserNameLoading] = useState(false);
    const [newUserNameError, setNewUserNameError] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [isNewAccountIsCreating, setIsNewAccountIsCreating] = useState(false);

    const [userJustVerify, setUserJustVerify] = useState(false);
    const [emailJustVerify, setEmailJustVerify] = useState(false);
    const [passwordJustVerify, setPasswordJustVerify] = useState(false);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [userName, setUserName] = useState("");
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");

    // New profile fields
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [website, setWebsite] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(Math.floor(Math.random() * avatars.length));
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const [userNameError, setUserNameError] = useState(false);
    const [isValidUserNameLoading, setIsValidUserNameLoading] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [isValidEmailLoading, setIsValidEmailLoading] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (e) => e.preventDefault();

    const isFormValid = () => {
        return (
            !userNameError &&
            !emailError &&
            isValidUserName(userName) &&
            isValidEmail(emailId) &&
            isValidFullName(fullName) &&
            (!website || isValidWebsite(website)) &&
            userName !== "" &&
            emailId !== "" &&
            fullName !== "" &&
            userName.length < 255 &&
            emailId.length < 255 &&
            fullName.length < 255 &&
            bio.length < 500 &&
            location.length < 255 &&
            website.length < 255 &&
            password !== "" &&
            password.length >= 8 &&
            password.length < 255
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUserJustVerify((prev) => true);
        setEmailJustVerify((prev) => true);
        setPasswordJustVerify((prev) => true);

        // Check each requirement and show specific error messages
        if (userName.trim() === "") {
            toast("Username is required",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (!isValidUserName(userName)) {
            toast("Invalid username format",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (userNameError) {
            toast("Username is already taken",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (userName.length >= 255) {
            toast("Username is too long (max 255 characters)",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (emailId.trim() === "") {
            toast("Email is required",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (!isValidEmail(emailId)) {
            toast("Invalid email format",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (emailError) {
            toast("Email is already registered",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (emailId.length >= 255) {
            toast("Email is too long (max 255 characters)",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (password.trim() === "") {
            toast("Password is required",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (password.length < 8) {
            toast("Password must be at least 8 characters long",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (password.length >= 255) {
            toast("Password is too long (max 255 characters)",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        // Validate full name
        if (fullName.trim() === "") {
            toast("Full name is required",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (!isValidFullName(fullName)) {
            toast("Invalid full name format",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (fullName.length >= 255) {
            toast("Full name is too long (max 255 characters)",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        // Validate website if provided
        if (website && !isValidWebsite(website)) {
            toast("Please enter a valid website URL",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (!isFormValid()) return;

        setLoading((prev) => true);

        const registerCredentials = {
            username: userName,
            emailid: emailId,
            password,
            name: fullName,
            bio: bio,
            location: location,
            website: website,
            profile_image: selectedAvatar,
        };

        try {
            const results = await POST("/api/auth/register", registerCredentials);
            await setDataToLocalStorage(results.data);
            toast("Account Created successfully!",
                {
                    icon: <InfoRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            navigate("/");
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
            setLoading((prev) => false);
        }
    };

    const handleChangeUserName = async (e) => {

        if (!isValidUserName("0" + e.target.value)) return;
        if (e.target.value.length >= 255) return;

        setUserJustVerify((prev) => false);
        setUserName((prev) => e.target.value);

        setIsValidUserNameLoading((prev) => true);

        if (userNameControllerRef.current) {
            userNameControllerRef.current.abort();
        }

        userNameControllerRef.current = new AbortController();
        const signal = userNameControllerRef.current.signal;

        try {
            const response = await GET("/api/auth/verify-username", { username: e.target.value }, signal);
            setUserNameError(response.data.exists);
        } catch (error) {
        } finally {
            setIsValidUserNameLoading((prev) => false);
        }
    }

    const handleEmailChange = async (e) => {

        if (e.target.value.length >= 255) return;

        setEmailJustVerify((prev) => false);
        setEmailId((prev) => e.target.value);

        if (!isValidEmail(e.target.value)) return;

        setIsValidEmailLoading((prev) => true);

        if (emailControllerRef.current) {
            emailControllerRef.current.abort();
        }

        emailControllerRef.current = new AbortController();
        const signal = emailControllerRef.current.signal;

        try {
            const response = await GET("/api/auth/verify-email", { emailid: e.target.value }, signal);
            setEmailError(response.data.exists);
        } catch (error) {
        } finally {
            setIsValidEmailLoading((prev) => false);
        }
    };

    const handleChangeNewUserName = async (e) => {

        if (!isValidUserName("0" + e.target.value)) return;
        if (e.target.value.length >= 255) return;

        setNewUserNameJustVerify((prev) => false);
        setNewUserName((prev) => e.target.value);

        setIsValidNewUserNameLoading((prev) => true);

        if (newUserNameControllerRef.current) {
            newUserNameControllerRef.current.abort();
        }

        newUserNameControllerRef.current = new AbortController();
        const signal = newUserNameControllerRef.current.signal;

        try {
            const response = await GET("/api/auth/verify-username", { username: e.target.value }, signal);
            setNewUserNameError(response.data.exists);
        } catch (error) {
        } finally {
            setIsValidNewUserNameLoading((prev) => false);
        }
    }

    const handleSubmitNewUser = async (e) => {
        e.preventDefault();

        setNewUserNameJustVerify((prev) => true);

        // Check each requirement and show specific error messages
        if (newUserName.trim() === "") {
            toast("Username is required",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (!isValidUserName(newUserName)) {
            toast("Invalid username format",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (newUserNameError) {
            toast("Username is already taken",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (newUserName.length >= 255) {
            toast("Username is too long (max 255 characters)",
                {
                    icon: <WarningAmberRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            return;
        }

        if (newUserNameError || !isValidUserName(newUserName) || newUserName === "") return;

        setIsNewAccountIsCreating((prev) => true);

        const registerCredentials = {
            username: newUserName,
            emailid: email,
            name,
            image,
        };

        try {
            const results = await POST("/api/auth/google-login", registerCredentials);
            await setDataToLocalStorage(results.data);
            toast("Account Created successfully!",
                {
                    icon: <InfoRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            navigate("/");
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
            setIsNewAccountIsCreating((prev) => false);
        }
    };

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
                display: hasAccount ? "none" : "flex",
                height: "100vh",
                paddingX: { xs: 2, sm: 4 },
                paddingY: { xs: 4, sm: 6 },
            }}
        >
            {!isNewUser ? (
                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={6}
                    lg={4}
                    sx={{
                        padding: { xs: 3, sm: 5 },
                        borderRadius: "20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: 'linear-gradient(135deg, rgba(16,19,26,0.95) 0%, rgba(5,7,10,0.95) 100%)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(88,166,255,0.15)',
                        boxShadow: '0 15px 50px rgba(31, 111, 235, 0.3), inset 0 0 40px rgba(88, 166, 255, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.2), transparent)',
                          filter: 'blur(1px)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '60%',
                          height: '3px',
                          background: 'linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.5), transparent)',
                          filter: 'blur(2px)',
                        },
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 20px 60px rgba(31, 111, 235, 0.4), inset 0 0 50px rgba(88, 166, 255, 0.15)',
                        }
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "#1F6FEB", boxShadow: '0 0 20px rgba(31,111,235,0.8), 0 0 30px rgba(31,111,235,0.4)' }}>
                        <AccountCircleOutlinedIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" mb={2} color='#E6EDF3'>
                        Sign Up
                    </Typography>
                    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    value={userName}
                                    onChange={handleChangeUserName}
                                    id="username"
                                    label="Username"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    error={(userNameError || (userName !== "" && !isValidUserName(userName)) || (userJustVerify && userName === ""))}
                                    helperText={(userNameError || (userName !== "" && !isValidUserName(userName)) || (userJustVerify && userName === "")) ? (userName === "" ? "Username is required" : !isValidUserName(userName) ? "Invalid Username" : "Username already exists") : ""}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: (userNameError || (userName !== "" && !isValidUserName(userName)) || (userJustVerify && userName === "")) ? "#ff6b6b" : "#58A6FF" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {isValidUserNameLoading ?
                                                    <CircularProgress
                                                        size={22}
                                                        thickness={6}
                                                        sx={{
                                                            color: "#58A6FF",
                                                            '& circle': { strokeLinecap: 'round' },
                                                        }}
                                                    />
                                                    : (userNameError || (userName !== "" && !isValidUserName(userName)) || (userJustVerify && userName === "")) ?
                                                        <Tooltip
                                                            TransitionComponent={Zoom}
                                                            title={(userName === "" ? "Username is required" : !isValidUserName(userName)) ? "Invalid Username" : "Username already exists"}
                                                            placement="bottom"
                                                            arrow
                                                            componentsProps={{
                                                                tooltip: {
                                                                    sx: {
                                                                        bgcolor: "#ff6b6b",
                                                                        "& .MuiTooltip-arrow": {
                                                                            color: "#ff6b6b",
                                                                        },
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <WarningAmberRoundedIcon sx={{ color: "#ff6b6b", cursor: "pointer" }} />
                                                        </Tooltip>
                                                        : (userName !== "") ?
                                                            <CheckRoundedIcon sx={{ color: "#58A6FF" }} /> : null}
                                            </InputAdornment>
                                        ),
                                    }}
                                    inputProps={{
                                        required: false,
                                        placeholder: "Enter your username",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                              borderColor: 'rgba(88,166,255,0.2)',
                                              transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                              borderColor: '#58A6FF',
                                              boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "&.Mui-error fieldset": {
                                                borderColor: '#ff6b6b',
                                                boxShadow: '0 0 8px rgba(255,107,107,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                              color: '#E6EDF3',
                                              padding: '14px 18px',
                                              "&::placeholder": {
                                                  opacity: 0.7,
                                                  color: '#A0B3D6',
                                              }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                            "&.Mui-error": {
                                                color: '#ff6b6b',
                                            },
                                        },
                                        "& .MuiFormHelperText-root": {
                                            color: '#ff6b6b',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            marginLeft: '8px',
                                            marginTop: '4px',
                                            '&.Mui-error': {
                                                color: '#ff6b6b',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={emailId}
                                    onChange={handleEmailChange}
                                    id="email"
                                    label="Email ID"
                                    type="email"
                                    fullWidth
                                    variant="outlined"
                                    error={(emailError || (emailId !== "" && !isValidEmail(emailId)) || (emailJustVerify && emailId === ""))}
                                    helperText={(emailError || (emailId !== "" && !isValidEmail(emailId)) || (emailJustVerify && emailId === "")) ? (emailId === "" ? "Email ID is required" : !isValidEmail(emailId) ? "Invalid Email ID" : "Email ID already exists") : ""}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailRoundedIcon sx={{ color: (emailError || (emailId !== "" && !isValidEmail(emailId)) || (emailJustVerify && emailId === "")) ? "#ff6b6b" : "#58A6FF" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {isValidEmailLoading ?
                                                    <CircularProgress
                                                        size={22}
                                                        thickness={6}
                                                        sx={{
                                                            color: "#58A6FF",
                                                            '& circle': { strokeLinecap: 'round' },
                                                        }}
                                                    />
                                                    : (emailError || (emailId !== "" && !isValidEmail(emailId)) || (emailJustVerify && emailId === "")) ?
                                                        <Tooltip
                                                            TransitionComponent={Zoom}
                                                            title={(emailId === "" ? "Email ID is required" : !isValidEmail(emailId)) ? "Invalid Email ID" : "Email ID already exists"}
                                                            placement="bottom"
                                                            arrow
                                                            componentsProps={{
                                                                tooltip: {
                                                                    sx: {
                                                                        bgcolor: "#ff6b6b",
                                                                        "& .MuiTooltip-arrow": {
                                                                            color: "#ff6b6b",
                                                                        },
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <WarningAmberRoundedIcon sx={{ color: "#ff6b6b", cursor: "pointer" }} />
                                                        </Tooltip>
                                                        : (emailId !== "") ?
                                                            <CheckRoundedIcon sx={{ color: "#58A6FF" }} /> : null}
                                            </InputAdornment>
                                        ),
                                    }}
                                    inputProps={{
                                        required: false,
                                        placeholder: "Enter your email address",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                              borderColor: 'rgba(88,166,255,0.2)',
                                              transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                              borderColor: '#58A6FF',
                                              boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "&.Mui-error fieldset": {
                                                borderColor: '#ff6b6b',
                                                boxShadow: '0 0 8px rgba(255,107,107,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                              color: '#E6EDF3',
                                              padding: '14px 18px',
                                              "&::placeholder": {
                                                  opacity: 0.7,
                                                  color: '#A0B3D6',
                                              }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                            "&.Mui-error": {
                                                color: '#ff6b6b',
                                            },
                                        },
                                        "& .MuiFormHelperText-root": {
                                            color: '#ff6b6b',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            marginLeft: '8px',
                                            marginTop: '4px',
                                            '&.Mui-error': {
                                                color: '#ff6b6b',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={password}
                                    onChange={(e) => {
                                        if (e.target.value.length >= 255) return;
                                        setPassword(e.target.value);
                                    }}
                                    id="password"
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    fullWidth
                                    variant="outlined"
                                    error={passwordJustVerify && (password.length < 8 || password.length >= 255)}
                                    helperText={passwordJustVerify && (password.length < 8 || password.length >= 255) ? "Password must be at least 8 characters long" : ""}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <VpnKeyRoundedIcon sx={{ color: passwordJustVerify && (password.length < 8 || password.length >= 255) ? "#ff6b6b" : "#58A6FF" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? (
                                                        <Visibility sx={{ color: "#58A6FF" }} />
                                                    ) : (
                                                        <VisibilityOff sx={{ color: "#58A6FF" }} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    inputProps={{
                                        required: false,
                                        placeholder: "Enter your password",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                              borderColor: 'rgba(88,166,255,0.2)',
                                              transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                              borderColor: '#58A6FF',
                                              boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "&.Mui-error fieldset": {
                                                borderColor: '#ff6b6b',
                                                boxShadow: '0 0 8px rgba(255,107,107,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                              color: '#E6EDF3',
                                              padding: '14px 18px',
                                              "&::placeholder": {
                                                  opacity: 0.7,
                                                  color: '#A0B3D6',
                                              }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                            "&.Mui-error": {
                                                color: '#ff6b6b',
                                            },
                                        },
                                        "& .MuiFormHelperText-root": {
                                            color: '#ff6b6b',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            marginLeft: '8px',
                                            marginTop: '4px',
                                            '&.Mui-error': {
                                                color: '#ff6b6b',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            
                            {/* Full Name Field */}
                            <Grid item xs={12}>
                                <TextField
                                    value={fullName}
                                    onChange={(e) => {
                                        if (!isValidFullName(e.target.value) || e.target.value.length >= 255) return;
                                        setFullName(e.target.value);
                                    }}
                                    id="fullName"
                                    label="Full Name"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    error={fullName !== "" && !isValidFullName(fullName)}
                                    helperText={fullName !== "" && !isValidFullName(fullName) ? "Invalid full name format" : ""}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: (fullName !== "" && !isValidFullName(fullName)) ? "#ff6b6b" : "#58A6FF" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {fullName !== "" && isValidFullName(fullName) ? 
                                                    <CheckRoundedIcon sx={{ color: "#58A6FF" }} /> : null}
                                            </InputAdornment>
                                        ),
                                    }}
                                    inputProps={{
                                        required: false,
                                        placeholder: "Enter your full name",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                              borderColor: 'rgba(88,166,255,0.2)',
                                              transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                              borderColor: '#58A6FF',
                                              boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "&.Mui-error fieldset": {
                                                borderColor: '#ff6b6b',
                                                boxShadow: '0 0 8px rgba(255,107,107,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                              color: '#E6EDF3',
                                              padding: '14px 18px',
                                              "&::placeholder": {
                                                  opacity: 0.7,
                                                  color: '#A0B3D6',
                                              }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                            "&.Mui-error": {
                                                color: '#ff6b6b',
                                            },
                                        },
                                        "& .MuiFormHelperText-root": {
                                            color: '#ff6b6b',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            marginLeft: '8px',
                                            marginTop: '4px',
                                            '&.Mui-error': {
                                                color: '#ff6b6b',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Bio Field */}
                            <Grid item xs={12}>
                                <TextField
                                    value={bio}
                                    onChange={(e) => {
                                        if (e.target.value.length >= 500) return;
                                        setBio(e.target.value);
                                    }}
                                    id="bio"
                                    label="Bio (Optional)"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    inputProps={{
                                        required: false,
                                        placeholder: "Tell us about yourself...",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                              borderColor: 'rgba(88,166,255,0.2)',
                                              transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                              borderColor: '#58A6FF',
                                              boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                              color: '#E6EDF3',
                                              padding: '14px 18px',
                                              "&::placeholder": {
                                                  opacity: 0.7,
                                                  color: '#A0B3D6',
                                              }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Location Field */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    value={location}
                                    onChange={(e) => {
                                        if (e.target.value.length >= 255) return;
                                        setLocation(e.target.value);
                                    }}
                                    id="location"
                                    label="Location (Optional)"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    inputProps={{
                                        required: false,
                                        placeholder: "City, Country",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                              borderColor: 'rgba(88,166,255,0.2)',
                                              transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                              borderColor: '#58A6FF',
                                              boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                              color: '#E6EDF3',
                                              padding: '14px 18px',
                                              "&::placeholder": {
                                                  opacity: 0.7,
                                                  color: '#A0B3D6',
                                              }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Website Field */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    value={website}
                                    onChange={(e) => {
                                        if (e.target.value.length >= 255) return;
                                        setWebsite(e.target.value);
                                    }}
                                    id="website"
                                    label="Website (Optional)"
                                    type="url"
                                    fullWidth
                                    variant="outlined"
                                    error={website !== "" && !isValidWebsite(website)}
                                    helperText={website !== "" && !isValidWebsite(website) ? "Please enter a valid URL" : ""}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LanguageIcon sx={{ color: (website !== "" && !isValidWebsite(website)) ? "#ff6b6b" : "#58A6FF" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {website !== "" && isValidWebsite(website) ? 
                                                    <CheckRoundedIcon sx={{ color: "#58A6FF" }} /> : null}
                                            </InputAdornment>
                                        ),
                                    }}
                                    inputProps={{
                                        required: false,
                                        placeholder: "https://yourwebsite.com",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                              borderColor: 'rgba(88,166,255,0.2)',
                                              transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                              borderColor: '#58A6FF',
                                              boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "&.Mui-error fieldset": {
                                                borderColor: '#ff6b6b',
                                                boxShadow: '0 0 8px rgba(255,107,107,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                              color: '#E6EDF3',
                                              padding: '14px 18px',
                                              "&::placeholder": {
                                                  opacity: 0.7,
                                                  color: '#A0B3D6',
                                              }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                            "&.Mui-error": {
                                                color: '#ff6b6b',
                                            },
                                        },
                                        "& .MuiFormHelperText-root": {
                                            color: '#ff6b6b',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            marginLeft: '8px',
                                            marginTop: '4px',
                                            '&.Mui-error': {
                                                color: '#ff6b6b',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Avatar Selection */}
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    border: '1px solid rgba(88,166,255,0.2)', 
                                    borderRadius: '15px', 
                                    p: 2,
                                    bgcolor: 'rgba(88,166,255,0.05)'
                                }}>
                                    <Typography variant="subtitle1" sx={{ color: '#A0B3D6', mb: 2, fontWeight: 'bold' }}>
                                        Choose Your Avatar
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Avatar
                                            sx={{ 
                                                width: 60, 
                                                height: 60, 
                                                border: '3px solid #58A6FF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    boxShadow: '0 4px 15px rgba(88,166,255,0.4)',
                                                }
                                            }}
                                            src={avatars[selectedAvatar]}
                                            onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                        />
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#E6EDF3', fontWeight: 'bold' }}>
                                                Current Selection
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#A0B3D6' }}>
                                                Click to change avatar
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    {showAvatarSelector && (
                                        <Box sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            maxHeight: 200,
                                            overflowY: 'auto',
                                            p: 1,
                                            bgcolor: 'rgba(0,0,0,0.1)',
                                            borderRadius: 1
                                        }}>
                                            {avatars.map((avatar, index) => (
                                                <Avatar
                                                    key={index}
                                                    sx={{
                                                        cursor: "pointer",
                                                        width: 50,
                                                        height: 50,
                                                        border: selectedAvatar === index ? "3px solid #58A6FF" : "2px solid rgba(88,166,255,0.3)",
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                            border: "3px solid #58A6FF",
                                                        }
                                                    }}
                                                    alt={`Avatar ${index + 1}`}
                                                    src={avatar}
                                                    onClick={() => {
                                                        setSelectedAvatar(index);
                                                        setShowAvatarSelector(false);
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading || !isFormValid()}
                                    sx={{
                                        fontWeight: "bold",
                                        borderRadius: "15px",
                                        background: 'linear-gradient(45deg, #1F6FEB 30%, #58A6FF 90%)',
                                        color: "white",
                                        py: 1.8,
                                        mt: 3,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 8px 25px rgba(31,111,235,0.6)',
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        letterSpacing: '0.05em',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            transition: 'left 0.5s',
                                        },
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #58A6FF 30%, #1F6FEB 90%)',
                                            boxShadow: '0 12px 35px rgba(31,111,235,0.8)',
                                            transform: 'translateY(-4px) scale(1.02)',
                                            '&::before': {
                                                left: '100%',
                                            },
                                        },
                                        '&:active': {
                                            transform: 'translateY(-2px) scale(0.98)',
                                            boxShadow: '0 6px 20px rgba(31,111,235,0.7)',
                                            transition: 'all 0.1s ease',
                                        },
                                        '&:disabled': {
                                            background: 'linear-gradient(45deg, #333333 30%, #444444 90%)',
                                            color: '#999999',
                                            boxShadow: 'none',
                                            transform: 'none',
                                            '&::before': {
                                                display: 'none',
                                            },
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            Signing Up&nbsp;&nbsp;
                                            <CircularProgress
                                                size={22}
                                                thickness={6}
                                                sx={{
                                                    color: "white",
                                                    '& circle': { strokeLinecap: 'round' },
                                                }}
                                            />
                                        </>
                                    ) : ("Sign Up")}
                                </Button>
                            </Grid>

                            <Grid container justifyContent="center" sx={{ pl: 2, pt: 2 }}>
                                <Typography fontWeight="bold" color="#A0B3D6">
                                    OR
                                </Typography>
                            </Grid>

                            <Grid item xs={12} container justifyContent="center">
                                <GoogleLogin 
                                    setEmail={setEmail} 
                                    setName={setName} 
                                    setImage={setImage} 
                                    setIsNewUser={setIsNewUser} 
                                    sx={{
                                        mt: 2,
                                        background: 'linear-gradient(45deg, #FF6F61 30%, #FF9933 90%)',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(255,100,0,0.4)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #FF9933 30%, #FF6F61 90%)',
                                            boxShadow: '0 6px 20px rgba(255,100,0,0.6)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid container justifyContent="space-between" sx={{ px: 2 }}>
                                <Box
                                    variant="text"
                                    onClick={() => setHasAccount(true)}
                                    sx={{
                                        my: 2,
                                        fontSize: "0.9rem",
                                        fontWeight: "bold",
                                        color: "#58A6FF",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        transition: 'color 0.2s ease',
                                        '&:hover': {
                                            color: '#1F6FEB',
                                            textShadow: '0 0 5px rgba(88,166,255,0.3)',
                                        },
                                    }}
                                >
                                    Already have an account? Sign In
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            ) : (
                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={6}
                    lg={4}
                    sx={{
                        padding: { xs: 2, sm: 4 },
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        border: "1px solid black",
                    }}
                >

                    <form onSubmit={handleSubmitNewUser} style={{ width: "100%" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ position: "relative", display: "flex", width: "100%", height: "100%", flexDirection: "column", alignItems: "center" }}>
                                    <Typography variant="h5" fontWeight="bold" sx={{ my: 2 }}>Hi, {name}</Typography>
                                    <IconButton onClick={() => { setIsNewUser((prev) => false); setImage(""); setEmail(""); setName(""); }}
                                        sx={{ bgcolor: "#F2F2F2", color: "#333333", position: "absolute", top: 0, left: 0, borderRadius: "50%" }}
                                    >
                                        <KeyboardBackspaceRoundedIcon sx={{ color: "#333333" }} />
                                    </IconButton>
                                    <img src={image}
                                        alt="profile-image"
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                        }}
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                        decoding="async"
                                    />
                                    <Typography fontWeight="bold" sx={{ my: 2 }}>{email}</Typography>
                                    <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%", p: "12px", my: 2, borderRadius: 3, border: "1px solid #333333" }}>
                                        <InfoRoundedIcon /> <Typography fontWeight="bold" sx={{ mx: 2 }}>Choose a username to get started</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={newUserName}
                                    onChange={handleChangeNewUserName}
                                    id="username"
                                    label="Username"
                                    placeholder="Enter a new username"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    size="small"
                                    autoComplete="on"
                                    error={
                                        newUserNameError || (newUserNameJustVerify && (newUserName === "" || !isValidUserName(newUserName)))
                                    }
                                    helperText={
                                        newUserNameJustVerify && newUserName === ""
                                            ? "Username is required"
                                            : newUserNameError
                                                ? "Username is taken"
                                                : newUserNameJustVerify && !isValidUserName(newUserName)
                                                    ? "Invalid Username"
                                                    : ""
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: (newUserNameError || (newUserNameJustVerify && (newUserName === "" || !isValidUserName(newUserName)))) ? "#ff6b6b" : "#58A6FF" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {isValidNewUserNameLoading ?
                                                    <CircularProgress
                                                        size={20}
                                                        thickness={6}
                                                        sx={{
                                                            color: "#58A6FF",
                                                            '& circle': { strokeLinecap: 'round' },
                                                        }}
                                                    />
                                                    : (newUserNameError || (newUserName !== "" && !isValidUserName(newUserName)) || (newUserNameJustVerify && newUserName === "")) ?
                                                        <Tooltip
                                                            TransitionComponent={Zoom}
                                                            title={(newUserName === "") ? "Username is required" : "Username already exists"}
                                                            placement="bottom"
                                                            arrow
                                                            componentsProps={{
                                                                tooltip: {
                                                                    sx: {
                                                                        bgcolor: "#ff6b6b",
                                                                        "& .MuiTooltip-arrow": {
                                                                            color: "#ff6b6b",
                                                                        },
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <WarningAmberRoundedIcon sx={{ color: "#ff6b6b", cursor: "pointer" }} />
                                                        </Tooltip>
                                                        : (newUserName !== "") ?
                                                            <CheckRoundedIcon sx={{ color: "#58A6FF" }} /> : null}
                                            </InputAdornment>
                                        ),
                                    }}
                                    inputProps={{
                                        required: false,
                                        placeholder: "Enter a new username",
                                    }}
                                    sx={{
                                        color: "#E6EDF3",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: '15px',
                                            fontWeight: "bold",
                                            transition: 'all 0.3s ease',
                                            "& fieldset": {
                                                borderColor: 'rgba(88,166,255,0.2)',
                                                transition: 'all 0.3s ease',
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#1F6FEB",
                                                boxShadow: '0 0 10px rgba(31,111,235,0.6)',
                                            },
                                            "&:hover fieldset": {
                                                borderColor: '#58A6FF',
                                                boxShadow: '0 0 8px rgba(88,166,255,0.4)',
                                            },
                                            "&.Mui-error fieldset": {
                                                borderColor: '#ff6b6b',
                                                boxShadow: '0 0 8px rgba(255,107,107,0.4)',
                                            },
                                            "& .MuiInputBase-input": {
                                                color: '#E6EDF3',
                                                padding: '14px 18px',
                                                "&::placeholder": {
                                                    opacity: 0.7,
                                                    color: '#A0B3D6',
                                                }
                                            }
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#A0B3D6",
                                            "&.Mui-focused": {
                                                color: "#1F6FEB",
                                            },
                                            "&.Mui-error": {
                                                color: '#ff6b6b',
                                            },
                                        },
                                        "& .MuiFormHelperText-root": {
                                            color: '#ff6b6b',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            marginLeft: '8px',
                                            marginTop: '4px',
                                            '&.Mui-error': {
                                                color: '#ff6b6b',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        fontWeight: "bold",
                                        borderRadius: "15px",
                                        background: 'linear-gradient(45deg, #1F6FEB 30%, #58A6FF 90%)',
                                        color: "white",
                                        py: 1.8,
                                        mt: 3,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 8px 25px rgba(31,111,235,0.6)',
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        letterSpacing: '0.05em',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            transition: 'left 0.5s',
                                        },
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #58A6FF 30%, #1F6FEB 90%)',
                                            boxShadow: '0 12px 35px rgba(31,111,235,0.8)',
                                            transform: 'translateY(-4px) scale(1.02)',
                                            '&::before': {
                                                left: '100%',
                                            },
                                        },
                                        '&:active': {
                                            transform: 'translateY(-2px) scale(0.98)',
                                            boxShadow: '0 6px 20px rgba(31,111,235,0.7)',
                                            transition: 'all 0.1s ease',
                                        },
                                        '&:disabled': {
                                            background: 'linear-gradient(45deg, #333333 30%, #444444 90%)',
                                            color: '#999999',
                                            boxShadow: 'none',
                                            transform: 'none',
                                            '&::before': {
                                                display: 'none',
                                            },
                                        }
                                    }}
                                >
                                    {isNewAccountIsCreating ? (
                                        <>
                                            Creating an Account&nbsp;&nbsp;
                                            <CircularProgress
                                                size={20}
                                                thickness={6}
                                                sx={{
                                                    color: "white",
                                                    '& circle': { strokeLinecap: 'round' },
                                                }}
                                            />
                                        </>
                                    ) : ("Create Account")}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            )}
        </Grid>
    );
}
