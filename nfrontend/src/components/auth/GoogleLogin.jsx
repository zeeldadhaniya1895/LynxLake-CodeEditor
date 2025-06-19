import React, { useState } from 'react';
import { toast } from "react-hot-toast"
import { useNavigate } from 'react-router-dom';

//hooks
import useAPI from '../../hooks/api';

//Material Components
import { Box, Typography, CircularProgress, Button } from "@mui/material";

//Material Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

//OAuth
import { useGoogleLogin } from "@react-oauth/google"

//images
import googleImg from "../../images/google.png";

//utils
import { setDataToLocalStorage } from '../../utils/auth';

function GoogleLogin(props) {

    const { setEmail, setName, setImage, setIsNewUser } = props;

    const { GET } = useAPI();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const responseGoogle = async (authResult) => {

        setIsLoading((prev) => true);
        if (authResult["code"]) {
            try {
                const { code } = authResult;

                // Await the GET request
                const { data } = await GET("/api/auth/google-credentials", { code });
                const { accountExists } = data;

                if (accountExists) {

                    // Await setting data to localStorage
                    await setDataToLocalStorage(data);

                    toast(data?.message || "Login successful!",
                        {
                            icon: <CheckCircleRoundedIcon />,
                            style: {
                                borderRadius: '10px',
                                background: 'rgba(16, 19, 26, 0.95)',
                                color: '#fff',
                            },
                        }
                    );
                    // Navigate to the home page
                    navigate("/");
                } else {
                    const { email, name, image } = data;

                    // Update state for new users
                    setEmail(email);
                    setName(name);
                    setImage(image);
                    setIsNewUser(true); // `prev` is unnecessary for setting to true
                }
            } catch (error) {
                // Handle errors from GET request
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
            }
        } else {
            // Handle error when authResult does not contain a code
            toast("Google auth error",
                {
                    icon: <CancelRoundedIcon />,
                    style: {
                        borderRadius: '10px',
                        background: 'rgba(16, 19, 26, 0.95)',
                        color: '#fff',
                    },
                }
            );
        }
        setIsLoading((prev) => false);
    };


    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: responseGoogle,
        flow: "auth-code"
    });

    const handleGoogleLogin = (e) => {
        e.preventDefault();
        googleLogin();
    }

    return (
        <>
            <Button
                onClick={handleGoogleLogin}
                fullWidth
                variant="outlined"
                disabled={isLoading}
                sx={{
                    borderRadius: '15px',
                    border: '2px solid rgba(88,166,255,0.3)',
                    background: 'rgba(88,166,255,0.05)',
                    color: '#E6EDF3',
                    py: 1.5,
                    mt: 2,
                    transition: 'all 0.3s ease-in-out',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    '&:hover': {
                        border: '2px solid rgba(88,166,255,0.6)',
                        background: 'rgba(88,166,255,0.1)',
                        boxShadow: '0 8px 20px rgba(88,166,255,0.3)',
                        transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                        border: '2px solid rgba(88,166,255,0.1)',
                        background: 'rgba(88,166,255,0.02)',
                        color: '#666666',
                        transform: 'none',
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={googleImg} 
                        alt="Google Icon" 
                        style={{ 
                            width: 24, 
                            height: 24,
                            backgroundColor: "transparent",
                            filter: 'brightness(0) invert(1)'
                        }} 
                    />
                </Box>
                <Typography fontWeight="bold" sx={{ color: 'inherit' }}>
                    Continue with Google
                </Typography>
                {isLoading && (
                    <CircularProgress
                        size={20}
                        thickness={6}
                        sx={{
                            color: "inherit",
                            '& circle': { strokeLinecap: 'round' },
                        }}
                    />
                )}
            </Button>
        </>
    )
}

export default GoogleLogin