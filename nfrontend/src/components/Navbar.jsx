import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Avatar, Tooltip, Typography, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

//Components
import User from "../components/User";

//context api
import { useUser } from "../context/user";

//utils
import { getAvatar, getUserInitials, getBestProfileImage } from "../utils/avatar";

//images
import logo from "../images/logo.jpg";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Features", path: "#features" },
  { label: "Login / SignUp", path: "/auth" },
];

const Navbar = ({ gridBG }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useUser();

  const profileRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileImageSrc, setProfileImageSrc] = useState('');
  const [initials, setInitials] = useState('U');

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const handleCloseProfile = () => setIsProfileOpen(false);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        handleCloseProfile();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleCloseProfile]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleCloseProfile();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [handleCloseProfile]);

  useEffect(() => {
    if (userInfo) {
      setProfileImageSrc(getBestProfileImage(userInfo));
      setInitials(getUserInitials(userInfo));
    }
  }, [userInfo]);

  const handleNavClick = (path) => {
    setDrawerOpen(false);
    if (path.startsWith('#')) {
      const el = document.getElementById(path.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ position: 'relative', zIndex: 10 }}>
      {/* Animated grid background if provided */}
      {gridBG && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>{gridBG}</Box>
      )}
      <Box
        sx={{
          background: 'linear-gradient(90deg, rgba(5,7,10,0.98) 60%, rgba(16,19,26,0.98) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 20px rgba(31, 111, 235, 0.1), inset 0 0 20px rgba(88, 166, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          py: 1.5,
          borderBottom: '1px solid rgba(88, 166, 255, 0.1)',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.15), transparent)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '30%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.3), transparent)',
            filter: 'blur(1px)',
          },
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -2,
              left: 0,
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, #58A6FF, #1F6FEB)',
              transform: 'scaleX(0)',
              transition: 'transform 0.3s ease',
              transformOrigin: 'left',
            },
            '&:hover': {
              transform: 'scale(1.01)',
              '&::after': {
                transform: 'scaleX(1)',
              }
            }
          }}
          onClick={() => navigate('/')}
        >
          <img
            src={logo}
            alt="logo"
            style={{ 
              width: 40, 
              borderRadius: 10, 
              marginRight: 10, 
              boxShadow: '0 2px 10px rgba(88,166,255,0.12), 0 0 20px rgba(88,166,255,0.05)',
              transition: 'all 0.2s ease',
              filter: 'drop-shadow(0 0 8px rgba(88,166,255,0.1))',
            }}
          />
          <Typography
            fontWeight={900}
            fontSize={{ xs: '1.8rem', sm: '2rem' }}
            sx={{
              background: 'linear-gradient(90deg, #58A6FF 30%, #1F6FEB 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.04em',
              textShadow: '0 2px 10px rgba(88,166,255,0.12), 0 0 20px rgba(88,166,255,0.05)',
              ml: 1,
              userSelect: 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -2,
                left: 0,
                width: '100%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(88,166,255,0.3), transparent)',
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease',
                transformOrigin: 'left',
              },
              '&:hover::after': {
                transform: 'scaleX(1)',
              }
            }}
          >
            LynxLake
          </Typography>
        </Box>

        {/* Desktop Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2.5 }}>
          {navLinks.map((link) => (
            <Typography
              key={link.label}
              onClick={() => handleNavClick(link.path)}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                px: 2,
                py: 0.8,
                borderRadius: 1.5,
                color: location.pathname === link.path ? '#58A6FF' : '#E6EDF3',
                background: location.pathname === link.path ? 'rgba(88,166,255,0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: location.pathname === link.path ? '70%' : '0%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #58A6FF, #1F6FEB)',
                  transition: 'all 0.2s ease',
                  borderRadius: '2px',
                  filter: 'blur(0.5px)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 1.5,
                  background: 'linear-gradient(90deg, rgba(88,166,255,0.1), rgba(31,111,235,0.1))',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                },
                '&:hover': {
                  color: '#1F6FEB',
                  '&::before': {
                    width: '70%',
                  },
                  '&::after': {
                    opacity: 1,
                  }
                },
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Box>

        {/* Mobile Menu Icon */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{
              color: '#58A6FF',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(88,166,255,0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.2s ease',
              },
              '&:hover': {
                transform: 'scale(1.05)',
                color: '#1F6FEB',
                '&::before': {
                  opacity: 1,
                }
              }
            }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>

        {/* Profile/Avatar Section */}
        {userInfo.userName && (
          <Box sx={{ ml: 2 }}>
            <Tooltip
              title="Profile"
              enterDelay={200}
              leaveDelay={0}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'rgba(5,7,10,0.95)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(88,166,255,0.15)',
                    color: '#E6EDF3',
                    transition: 'all 0.2s ease',
                    fontWeight: 600,
                    boxShadow: '0 2px 20px rgba(31,111,235,0.15), 0 0 20px rgba(88,166,255,0.05)',
                  },
                },
                arrow: {
                  sx: {
                    color: 'rgba(88,166,255,0.15)',
                  },
                },
              }}
            >
              <Avatar
                onClick={toggleProfile}
                sx={{
                  cursor: "pointer",
                  width: 42,
                  height: 42,
                  border: "2px solid rgba(88,166,255,0.2)",
                  boxShadow: '0 2px 10px rgba(88,166,255,0.12), 0 0 20px rgba(88,166,255,0.05)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(88,166,255,0.1) 0%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&:hover': {
                    transform: 'scale(1.03)',
                    border: "2px solid rgba(88,166,255,0.3)",
                    boxShadow: '0 4px 12px rgba(88,166,255,0.2), 0 0 20px rgba(88,166,255,0.1)',
                    '&::before': {
                      opacity: 1,
                    }
                  }
                }}
                alt={userInfo.userName}
                src={profileImageSrc}
                imgProps={{
                  crossOrigin: "anonymous",
                  referrerPolicy: "no-referrer",
                  decoding: "async",
                }}
              >
                {initials}
              </Avatar>
            </Tooltip>
            {isProfileOpen ? (
              <Box
                ref={profileRef}
                sx={{
                  zIndex: 9999,
                  position: "fixed",
                  right: 10,
                  top: 56,
                  bgcolor: "rgba(5,7,10,0.98)",
                  backdropFilter: 'blur(8px)',
                  border: "1px solid rgba(88,166,255,0.15)",
                  borderRadius: "10px",
                  boxShadow: '0 4px 24px rgba(31,111,235,0.15), 0 0 20px rgba(88,166,255,0.05)',
                  transition: 'all 0.2s ease',
                  animation: 'fadeIn 0.2s ease',
                  '@keyframes fadeIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(-8px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    }
                  }
                }}
              >
                <User handleClose={handleCloseProfile} />
              </Box>
            ) : null}
          </Box>
        )}
      </Box>

      {/* Mobile Drawer */}
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(5,7,10,0.98)',
            backdropFilter: 'blur(8px)',
            borderLeft: '1px solid rgba(88,166,255,0.15)',
            boxShadow: '-2px 0 20px rgba(31,111,235,0.15), 0 0 20px rgba(88,166,255,0.05)',
          }
        }}
      >
        <Box sx={{ width: 260, py: 2.5 }}>
          <List>
            {navLinks.map((link) => (
              <ListItem 
                button 
                key={link.label} 
                onClick={() => handleNavClick(link.path)}
                sx={{
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: 'linear-gradient(to bottom, #58A6FF, #1F6FEB)',
                    opacity: location.pathname === link.path ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(88,166,255,0.08)',
                    '&::before': {
                      opacity: 1,
                    }
                  }
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: location.pathname === link.path ? '#58A6FF' : '#E6EDF3',
                    transition: 'all 0.2s ease',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
