// module-imports
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

//imported
import useAPI from "../../hooks/api";

// Material-UI components
import {
    Box,
    Grid,
    Avatar,
    Button,
    Tooltip,
    Zoom,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
} from "@mui/material";

// Material-UI icons
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { isValidUserName } from "../../utils/validation";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

//google-OAuth
import GoogleLogin from "./GoogleLogin.jsx";

//files
import ResetPassword from "./ResetPassword.jsx";
import VerifyCode from "./VerifyCode.jsx";
import { setDataToLocalStorage } from "../../utils/auth.js";

export default function Login({ hasAccount, setHasAccount }) {

    const { GET, POST } = useAPI();
    const navigate = useNavigate();

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

    //forgot passowrd
    const [userNameOrEmailJustVerify, setUserNameOrEmailJustVerify] = useState(false);
    const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgetPasswordStep, setForgetPasswordStep] = useState(false);
    const [isSendingMail, setIsSendingMail] = useState(false);
    const [code, setCode] = useState("");
    const [forgotUsername, setForgotUsername] = useState("");
    const [forgotImage, setForgotImage] = useState("");

    // State
    const [loading, setLoading] = useState(false);
    const [justVerify, setJustVerify] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    // Toggle password visibility
    const handleTogglePasswordVisibility = () => setShowPassword((prev) => !prev);

    // Prevent default behavior for password visibility toggle
    const handlePasswordMouseDown = (event) => event.preventDefault();

    // Validate form inputs
    const isFormValid = () => {
        return (
            userName.trim() !== "" &&
            userName.length < 255 &&
            password.trim() !== "" &&
            password.length < 255
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setJustVerify(true);

        // Check each requirement and show specific error messages
        if (userName.trim() === "") {
            toast("Username or Email is required",
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
            toast("Username or Email is too long (max 255 characters)",
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

        if (!isFormValid()) return;

        setLoading(true);

        const credentials = { username: userName, password };

        try {
            const results = await POST("/api/auth/login", credentials);
            await setDataToLocalStorage(results.data);
            toast("Login successful!",
                {
                    icon: <CheckCircleRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            navigate("/");
        } catch (err) {
            toast(err.response?.data?.message || "Something went wrong!",
                {
                    icon: err.response?.data?.message === "You're Google Authenticated" ? <InfoRoundedIcon /> : <CancelRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
        } finally {
            setLoading(false);
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
                    icon: <CheckCircleRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            navigate("/");
        } catch (err) {
            toast(err.response?.data?.message || "Something went wrong!",
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

    const sendEmailToUser = async () => {
        setIsSendingMail((prev) => true);
        try {
            const results = await POST("/api/auth/send-mail", { userNameOrEmail: userName });
            toast("Email sent to the registered email address",
                {
                    icon: <CheckCircleRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
            setCode(results.data.code);
            setForgotUsername(results.data.username);
            setForgotImage(results.data.image);
            setIsForgotPassword((prev) => true);
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
            setIsSendingMail((prev) => false);
        }
    }

    const handleForgotPassword = async () => {

        setUserNameOrEmailJustVerify((prev) => true);

        if (userName.trim() === "") {
            toast("Username or Email is required",
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

        setIsForgotPasswordLoading((prev) => true);
        try {
            const results = await GET("/api/auth/is-authenticated", { userNameOrEmail: userName });
            if (results.data.isAccountExists) {
                await sendEmailToUser();
            } else {
                toast("Account does not exist.\n Please sign up.",
                    {
                        icon: <InfoRoundedIcon />,
                        style: {
                            borderRadius: '10px',
                            background: 'rgba(16, 19, 26, 0.95)',
                            color: '#fff',
                        },
                    }
                );
            }
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
            setIsForgotPasswordLoading((prev) => false);
        }
    }

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
                display: hasAccount ? "flex" : "none",
                height: "100vh",
                paddingX: { xs: 2, sm: 4 },
                paddingY: { xs: 4, sm: 6 },
            }}
        >
            {!isForgotPassword ? (
                !isNewUser ? (
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
                            Sign in
                        </Typography>
                        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="userName"
                                        label="Username or Email"
                                        name="userName"
                                        autoComplete="email"
                                        autoFocus
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        error={(justVerify && (userName.trim() === "" || userName.length >= 255)) || (userNameOrEmailJustVerify && userName.trim() === "")}
                                        helperText={
                                            justVerify && userName.trim() === ""
                                                ? "Username or Email is required"
                                                : justVerify && userName.length >= 255
                                                    ? "Too long!"
                                                    : userNameOrEmailJustVerify && userName.trim() === ""
                                                        ? "Username or Email is required for password reset"
                                                        : ""
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: userNameOrEmailJustVerify && userName.trim() === "" ? "#ff6b6b" : "#58A6FF" }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        inputProps={{
                                            required: false,
                                            placeholder: "Enter your username or email",
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
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        error={justVerify && (password.trim() === "" || password.length >= 255)}
                                        helperText={
                                            justVerify && password.trim() === ""
                                                ? "Password is required"
                                                : justVerify && password.length >= 255
                                                    ? "Too long!"
                                                    : ""
                                        }
                                        sx={{
                                            "& label": {
                                                color: "white",
                                            },
                                            "& .MuiInputBase-input": {
                                                color: "white",
                                                "&::placeholder": {
                                                    opacity: 0.7,
                                                    color: '#A0B3D6',
                                                },
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: '15px',
                                                fontWeight: "bold",
                                                transition: 'all 0.3s ease',
                                                "& fieldset": {
                                                    borderColor: "rgba(88,166,255,0.2)",
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <VpnKeyRoundedIcon sx={{ color: "#58A6FF" }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleTogglePasswordVisibility}
                                                        onMouseDown={handlePasswordMouseDown}
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
                                    />
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
                                                Signing In&nbsp;&nbsp;
                                                <CircularProgress
                                                    size={22}
                                                    thickness={6}
                                                    sx={{
                                                        color: "white",
                                                        '& circle': { strokeLinecap: 'round' },
                                                    }}
                                                />
                                            </>
                                        ) : ("Sign In")}
                                    </Button>
                                </Grid>

                                <Grid container justifyContent="space-between" sx={{ px: 2, mt: 2 }}>
                                    <Box
                                        onClick={handleForgotPassword}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            my: 2,
                                            fontSize: "0.9rem",
                                            fontWeight: "bold",
                                            color: isSendingMail || isForgotPasswordLoading ? "#666666" : "#58A6FF",
                                            textDecoration: isSendingMail || isForgotPasswordLoading ? "none" : "underline",
                                            cursor: isSendingMail || isForgotPasswordLoading ? "auto" : "pointer",
                                            transition: 'all 0.3s ease',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            '&:hover': {
                                                color: '#1F6FEB',
                                                textShadow: '0 0 5px rgba(88,166,255,0.3)',
                                                backgroundColor: 'rgba(88,166,255,0.1)',
                                                transform: 'translateY(-1px)',
                                            },
                                            '&:active': {
                                                transform: 'translateY(0px)',
                                            }
                                        }}
                                    >
                                        {isSendingMail ? (
                                            <>
                                                Sending mail to your registered email&nbsp;
                                                <CircularProgress size={16} sx={{ color: '#666666' }} />
                                            </>
                                        ) : isForgotPasswordLoading ? (
                                            <>
                                                Checking account...&nbsp;
                                                <CircularProgress size={16} sx={{ color: '#666666' }} />
                                            </>
                                        ) : (
                                            "Forgot Password?"
                                        )}
                                    </Box>

                                    <Box
                                        variant="text"
                                        onClick={() => setHasAccount(false)}
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
                                        Don't have an account? Sign Up
                                    </Box>
                                </Grid>

                                <Grid container justifyContent="center" sx={{ pl: 2 }}>
                                    <Typography fontWeight="bold" color="#A0B3D6">
                                        OR
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} container justifyContent="center">
                                    <GoogleLogin setEmail={setEmail} setName={setName} setImage={setImage} setIsNewUser={setIsNewUser} />
                                </Grid>
                            </Grid>
                        </form>
                    </Grid >

                ) : (
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

                        <form onSubmit={handleSubmitNewUser} style={{ width: "100%" }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ position: "relative", display: "flex", width: "100%", height: "100%", flexDirection: "column", alignItems: "center" }}>
                                        <Typography variant="h5" fontWeight="bold" sx={{ my: 2, color: '#E6EDF3' }}>Hi, {name}</Typography>
                                        <IconButton onClick={() => { setIsNewUser((prev) => false); setImage(""); setEmail(""); setName(""); }}
                                            sx={{
                                                bgcolor: "rgba(88,166,255,0.15)",
                                                color: "#58A6FF",
                                                position: "absolute",
                                                top: 10,
                                                left: 10,
                                                borderRadius: "50%",
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 0 12px rgba(88,166,255,0.3)',
                                                '&:hover': {
                                                    bgcolor: "rgba(88,166,255,0.25)",
                                                    transform: 'scale(1.1)',
                                                    boxShadow: '0 0 20px rgba(88,166,255,0.6)',
                                                }
                                            }}
                                        >
                                            <KeyboardBackspaceRoundedIcon sx={{ color: "#58A6FF" }} />
                                        </IconButton>
                                        <img
                                            src={image}
                                            alt="profile-image"
                                            style={{ 
                                                width: 90, 
                                                height: 90, 
                                                borderRadius: "50%", 
                                                objectFit: "cover",
                                                border: "3px solid #58A6FF",
                                                boxShadow: '0 0 20px rgba(88,166,255,0.4)'
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="newUserName"
                                        label="Choose a Username"
                                        name="newUserName"
                                        autoComplete="off"
                                        autoFocus
                                        value={newUserName}
                                        onChange={handleChangeNewUserName}
                                        error={newUserNameError || (newUserNameJustVerify && (newUserName.trim() === "" || !isValidUserName(newUserName) || newUserName.length >= 255))}
                                        helperText={
                                            newUserNameJustVerify && newUserName.trim() === ""
                                                ? "Username is required"
                                                : newUserNameError
                                                    ? "Username is taken"
                                                    : newUserNameJustVerify && !isValidUserName(newUserName)
                                                        ? "Invalid Username"
                                                        : newUserNameJustVerify && newUserName.length >= 255
                                                            ? "Too long!"
                                                            : ""
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: "#58A6FF" }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {isValidNewUserNameLoading ?
                                                        <CircularProgress
                                                            size={22}
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
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        disabled={isNewAccountIsCreating || newUserNameError || !isValidUserName(newUserName) || newUserName === ""}
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
                                                    size={22}
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
                )
            ) :
                (
                    <>
                        {!forgetPasswordStep ? (
                            <>
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
                                    <VerifyCode
                                        code={code}
                                        setCode={setCode}
                                        sendEmailToUser={sendEmailToUser}
                                        setIsForgotPassword={setIsForgotPassword}
                                        setForgetPasswordStep={setForgetPasswordStep}
                                    />
                                </Grid>
                            </>
                        ) : (
                            <>
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
                                    <ResetPassword
                                        username={forgotUsername}
                                        image={forgotImage}
                                        setForgetPasswordStep={setForgetPasswordStep}
                                    />
                                </Grid>
                            </>
                        )}
                    </>
                )
            }
        </Grid >
    );
}
