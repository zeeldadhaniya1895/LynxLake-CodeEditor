import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from 'lottie-react';
import animationData from '../Animation - 1750003280760.json';
// Page Components
// import AboutUs from "./AboutUs";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Material UI Components
import { Box, Typography, Container, Button, Grid, Card, Avatar } from "@mui/material";
import CodeIcon from '@mui/icons-material/Code';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import BoltIcon from '@mui/icons-material/Bolt';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';

const features = [
  {
    icon: <GroupWorkIcon fontSize="large" sx={{ color: '#58A6FF' }} />, title: "Real-time Collaboration",
    desc: "Edit code with your team live. See everyone's cursor and changes instantly."
  },
  {
    icon: <CodeIcon fontSize="large" sx={{ color: '#1F6FEB' }} />, title: "AI Code Suggestions",
    desc: "Get smart, AI-powered code completions and suggestions as you type."
  },
  {
    icon: <FolderOpenIcon fontSize="large" sx={{ color: '#58A6FF' }} />, title: "Project & File Management",
    desc: "Organize your work with projects, folders, and files. Create, delete, and manage easily."
  },
  {
    icon: <ChatIcon fontSize="large" sx={{ color: '#1F6FEB' }} />, title: "Built-in Chat",
    desc: "Communicate with your team in real-time without leaving the editor."
  },
  {
    icon: <HistoryEduIcon fontSize="large" sx={{ color: '#58A6FF' }} />, title: "Code History & Logs",
    desc: "Track changes, view logs, and restore previous versions of your code."
  },
  {
    icon: <PersonIcon fontSize="large" sx={{ color: '#BFC9CA' }} />, title: "User Profiles & Auth",
    desc: "Secure login, signup, and personalized profiles for every user."
  },
];

const steps = [
  {
    label: "Sign Up & Create a Project",
    desc: "Register, create your first project, and invite your team members.",
    icon: <PersonIcon sx={{ color: '#58A6FF' }} />,
  },
  {
    label: "Collaborate in Real-Time",
    desc: "Edit code together, chat, and see live changes instantly.",
    icon: <GroupWorkIcon sx={{ color: '#1F6FEB' }} />,
  },
  {
    label: "Boost Productivity with AI",
    desc: "Use AI-powered suggestions and tools to code faster and smarter.",
    icon: <BoltIcon sx={{ color: '#58A6FF' }} />,
  },
];

const AnimatedGridBG = ({ style }) => (
  <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', ...style }}>
    <svg width="100%" height="100%" viewBox="0 0 3000 2000" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
      <g stroke="#58A6FF88" strokeWidth="2" className="grid-animate">
        {[...Array(42)].map((_, i) => (
          <line key={i} x1={i * 72} y1="0" x2={i * 72} y2="2000">
            <animate attributeName="x1" values={`${i * 72};${i * 72 + 36};${i * 72}`} dur="8s" repeatCount="indefinite" />
            <animate attributeName="x2" values={`${i * 72};${i * 72 + 36};${i * 72}`} dur="8s" repeatCount="indefinite" />
          </line>
        ))}
        {[...Array(24)].map((_, i) => (
          <line key={i+100} x1="0" y1={i * 84} x2="3000" y2={i * 84}>
            <animate attributeName="y1" values={`${i * 84};${i * 84 + 42};${i * 84}`} dur="8s" repeatCount="indefinite" />
            <animate attributeName="y2" values={`${i * 84};${i * 84 + 42};${i * 84}`} dur="8s" repeatCount="indefinite" />
          </line>
        ))}
      </g>
      <style>{`
        @keyframes wavy-glow {
          0% { stroke: #58A6FF55; filter: brightness(1); }
          50% { stroke: #1F6FEB88; filter: brightness(1.3); }
          100% { stroke: #58A6FF55; filter: brightness(1); }
        }
        .grid-animate { animation: wavy-glow 6s infinite alternate ease-in-out; }
      `}</style>
    </svg>
  </Box>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [tagline, setTagline] = React.useState("");
  const taglineFull = "Where sharp minds collaborate in calm clarity.";

  // Check if user is logged in and redirect to /project
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
    const image = localStorage.getItem("image");

    if (authToken && username && image) {
      // User is logged in, redirect to project page
      navigate("/project");
    }
  }, [navigate]);

  React.useEffect(() => {
    let i = 0;
    setTagline("");
    const interval = setInterval(() => {
      setTagline(taglineFull.slice(0, i + 1));
      i++;
      if (i === taglineFull.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #05070A 0%, #10131A 100%)", position: "relative", overflow: "hidden" }}>
      {/* Single, seamless grid background for the whole page */}
      <Box sx={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <AnimatedGridBG style={{ width: '100vw', height: '100vh', zIndex: 0, opacity: 1 }} />
      </Box>
      {/* Soft overlay for comfort - more transparent for grid visibility */}
      <Box sx={{ position: 'absolute', zIndex: 1, width: '100%', height: '100%', pointerEvents: 'none', background: 'rgba(10,20,34,0.6)' }} />
      {/* Coding Symbols scattered on the grid - fixed positions, no animation */}
      <Box sx={{ position: 'absolute', zIndex: 2, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[  
          // Core symbols
          { symbol: '&lbrace;&rbrace;', top: '5%', left: '10%', opacity: 0.1, size: '3.8rem' },
          { symbol: '&lt; /&gt;', top: '15%', left: '25%', opacity: 0.09, size: '3.2rem' },
          { symbol: '//', top: '25%', left: '5%', opacity: 0.12, size: '3.5rem' },
          { symbol: '();', top: '35%', left: '15%', opacity: 0.1, size: '2.8rem' },
          { symbol: ';', top: '45%', left: '20%', opacity: 0.13, size: '3.2rem' },
          { symbol: '=', top: '55%', left: '10%', opacity: 0.11, size: '3rem' },
          { symbol: '&gt;', top: '65%', left: '25%', opacity: 0.1, size: '2.8rem' },
          { symbol: '&lt;', top: '75%', left: '15%', opacity: 0.12, size: '3rem' },
          { symbol: '|', top: '85%', left: '5%', opacity: 0.09, size: '2.5rem' },
          { symbol: '&', top: '95%', left: '20%', opacity: 0.1, size: '2.8rem' },

          // Keywords & Language Names
          { symbol: 'function', top: '8%', left: '40%', opacity: 0.09, size: '2rem' },
          { symbol: 'const', top: '18%', left: '50%', opacity: 0.08, size: '1.8rem' },
          { symbol: 'let', top: '28%', left: '35%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'import', top: '38%', left: '45%', opacity: 0.08, size: '1.8rem' },
          { symbol: 'export', top: '48%', left: '30%', opacity: 0.09, size: '1.9rem' },
          { symbol: 'return', top: '58%', left: '40%', opacity: 0.08, size: '1.7rem' },
          { symbol: 'if', top: '68%', left: '50%', opacity: 0.09, size: '1.6rem' },
          { symbol: 'else', top: '78%', left: '35%', opacity: 0.08, size: '1.7rem' },
          { symbol: 'try', top: '88%', left: '45%', opacity: 0.09, size: '1.6rem' },
          { symbol: 'catch', top: '98%', left: '30%', opacity: 0.08, size: '1.7rem' },

          { symbol: 'JS', top: '12%', left: '70%', opacity: 0.09, size: '1.8rem' },
          { symbol: 'Python', top: '22%', left: '85%', opacity: 0.08, size: '1.9rem' },
          { symbol: 'React', top: '32%', left: '75%', opacity: 0.09, size: '2rem' },
          { symbol: 'Node', top: '42%', left: '90%', opacity: 0.08, size: '1.8rem' },
          { symbol: 'Java', top: '52%', left: '80%', opacity: 0.09, size: '1.9rem' },
          { symbol: 'C++', top: '62%', left: '95%', opacity: 0.08, size: '2rem' },
          { symbol: 'HTML', top: '72%', left: '70%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'CSS', top: '82%', left: '85%', opacity: 0.08, size: '1.8rem' },
          { symbol: 'PHP', top: '92%', left: '75%', opacity: 0.09, size: '1.6rem' },
          { symbol: 'Ruby', top: '2%', left: '55%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Go', top: '2%', left: '80%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Swift', top: '12%', left: '60%', opacity: 0.08, size: '1.8rem' },
          { symbol: 'TypeScript', top: '22%', left: '70%', opacity: 0.09, size: '2.1rem' },
          { symbol: 'Vue', top: '32%', left: '55%', opacity: 0.08, size: '1.8rem' },
          { symbol: 'Angular', top: '42%', left: '65%', opacity: 0.09, size: '2rem' },
          { symbol: 'Python3', top: '52%', left: '75%', opacity: 0.1, size: '2.1rem' },
          { symbol: 'Flask', top: '62%', left: '55%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'Django', top: '72%', left: '65%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'SQL', top: '82%', left: '70%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'NoSQL', top: '92%', left: '50%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'MongoDB', top: '5%', left: '30%', opacity: 0.09, size: '1.8rem' },
          { symbol: 'Express', top: '15%', left: '8%', opacity: 0.1, size: '1.9rem' },
          { symbol: 'Redux', top: '25%', left: '45%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'REST', top: '35%', left: '78%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'GraphQL', top: '45%', left: '60%', opacity: 0.1, size: '2rem' },
          { symbol: 'Docker', top: '55%', left: '88%', opacity: 0.09, size: '1.8rem' },
          { symbol: 'K8s', top: '65%', left: '5%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Cloud', top: '75%', left: '40%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'AWS', top: '85%', left: '65%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Azure', top: '95%', left: '50%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'GCP', top: '8%', left: '95%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'CI/CD', top: '20%', left: '48%', opacity: 0.09, size: '1.8rem' },
          { symbol: 'Test', top: '30%', left: '8%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Debug', top: '40%', left: '28%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Bug', top: '50%', left: '92%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Code', top: '60%', left: '70%', opacity: 0.1, size: '2rem' },
          { symbol: 'Dev', top: '70%', left: '18%', opacity: 0.09, size: '1.6rem' },
          { symbol: 'Prod', top: '80%', left: '88%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Server', top: '90%', left: '1%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'Client', top: '98%', left: '70%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'Data', top: '10%', left: '80%', opacity: 0.09, size: '1.8rem' },
          { symbol: 'Algo', top: '20%', left: '1%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Struct', top: '30%', left: '60%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Async', top: '40%', left: '7%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Await', top: '50%', left: '38%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Hook', top: '60%', left: '90%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'State', top: '70%', left: '7%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Props', top: '80%', left: '48%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Comp', top: '90%', left: '20%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Render', top: '1%', left: '30%', opacity: 0.09, size: '1.8rem' },
          { symbol: 'Flow', top: '10%', left: '95%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Build', top: '20%', left: '60%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Deploy', top: '30%', left: '90%', opacity: 0.1, size: '2rem' },
          { symbol: 'HTTP', top: '40%', left: '10%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'CLI', top: '50%', left: '25%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'npm', top: '60%', left: '40%', opacity: 0.09, size: '1.6rem' },
          { symbol: 'yarn', top: '70%', left: '55%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'webpack', top: '80%', left: '70%', opacity: 0.09, size: '1.8rem' },
          { symbol: 'babel', top: '90%', left: '85%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'Git', top: '15%', left: '80%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Branch', top: '25%', left: '95%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'Commit', top: '35%', left: '7%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Merge', top: '45%', left: '22%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'Pull', top: '55%', left: '38%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Push', top: '65%', left: '50%', opacity: 0.08, size: '1.6rem' },
          { symbol: 'Clone', top: '75%', left: '60%', opacity: 0.09, size: '1.7rem' },
          { symbol: 'Repo', top: '85%', left: '75%', opacity: 0.08, size: '1.5rem' },
          { symbol: 'Auth', top: '95%', left: '90%', opacity: 0.09, size: '1.6rem' },
          
        ].map((item, index) => (
          <Typography
            key={index}
            sx={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              fontSize: item.size,
              fontWeight: 900,
              color: '#58A6FF',
              opacity: item.opacity,
              userSelect: 'none',
              pointerEvents: 'none',
              textShadow: '0 0 12px rgba(88, 166, 255, 0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            {item.symbol}
          </Typography>
        ))}
      </Box>
      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, height: 120, background: 'linear-gradient(180deg, transparent 0%, #1F6FEB22 100%)' }} />
      <Navbar gridBG={null} />
      {/* Hero Section - Split Layout */}
      <Box sx={{ position: 'relative', minHeight: { xs: '80vh', md: '70vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Grid container alignItems="center" justifyContent="center" spacing={6}>
            {/* Left: Text */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 4, sm: 7 },
                borderRadius: 6,
                  background: 'rgba(16,28,44,0.38)',
                  boxShadow: '0 8px 48px 0 #1F6FEB33, 0 1.5px 16px 0 #0008',
                  backdropFilter: 'blur(22px)',
                  border: '1.5px solid rgba(88, 166, 255, 0.22)',
                  outline: '2.5px solid rgba(88,166,255,0.10)',
                  outlineOffset: '-6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  maxWidth: { xs: '100%', md: 440 },
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                {/* Neon Logo with animated shine */}
                <Box sx={{ position: 'relative', width: '100%', mb: 1 }}>
                <Typography
                  variant="h1"
                  sx={{
                      fontFamily: 'Montserrat, Quicksand, sans-serif',
                    fontWeight: 900,
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                      letterSpacing: '0.08em',
                      textAlign: 'center',
                      color: '#58A6FF',
                      textShadow: '0 0 24px #58A6FF, 0 0 48px #1F6FEB, 0 2px 8px #05070A',
                      filter: 'brightness(1.25) drop-shadow(0 0 12px #1F6FEB)',
                    position: 'relative',
                    zIndex: 2,
                      userSelect: 'none',
                  }}
                >
                  LynxLake
                    <Box
                      component="span"
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(88,166,255,0.08) 100%)',
                        borderRadius: 'inherit',
                        opacity: 0.7,
                        mixBlendMode: 'lighten',
                        animation: 'shine 2.8s linear infinite',
                        zIndex: 3,
                      }}
                    />
                </Typography>
                <style>{`
                    @keyframes shine {
                      0% { opacity: 0.7; left: -100%; }
                      60% { opacity: 0.7; left: 100%; }
                      100% { opacity: 0.7; left: 100%; }
                  }
                `}</style>
                </Box>
                {/* Tagline with underline highlight */}
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 600,
                    fontSize: { xs: '1.13rem', sm: '1.28rem' },
                    color: '#E6F1FF',
                    textAlign: 'center',
                    mb: 1,
                    letterSpacing: '0.01em',
                    position: 'relative',
                    zIndex: 2,
                    px: 1,
                    textShadow: '0 2px 12px #1F6FEB99',
                    '&:after': {
                      content: '""',
                      display: 'block',
                      width: '60%',
                      height: 2.5,
                      mx: 'auto',
                      mt: 1,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #58A6FF 0%, #1F6FEB 100%)',
                      opacity: 0.22,
                    },
                  }}
                >
                  <b>{tagline}</b>
                  <span style={{ color: '#1F6FEB', fontWeight: 700 }}>|</span>
                </Typography>
                {/* Description */}
                <Typography
                  sx={{
                    color: '#C7D6F9',
                    fontSize: { xs: '1.01rem', sm: '1.11rem' },
                    textAlign: 'center',
                    lineHeight: 1.7,
                    mb: 2,
                    px: 1,
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 8px #1F6FEB33',
                  }}
                >
                  The collaborative code editor where insight, harmony, and precision come together—like a calm lake reflecting every contribution.
                </Typography>
                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: "linear-gradient(90deg, #58A6FF 10%, #1F6FEB 90%)",
                      color: "#fff",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "0 4px 20px #1F6FEB33, 0 1.5px 8px #0006",
                      border: '1.5px solid rgba(88,166,255,0.18)',
                      backdropFilter: 'blur(2px)',
                      opacity: 0.93,
                      '&:hover': {
                        background: "linear-gradient(90deg, #1F6FEB 10%, #58A6FF 90%)",
                        color: '#fff',
                        boxShadow: "0 8px 32px #1F6FEB55",
                        opacity: 1,
                      },
                    }}
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      color: '#B6D6FF',
                      borderColor: '#58A6FF',
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      background: 'rgba(31,111,235,0.08)',
                      backdropFilter: 'blur(2px)',
                      boxShadow: '0 2px 12px #1F6FEB22',
                      opacity: 0.93,
                      '&:hover': {
                        background: 'rgba(31,111,235,0.18)',
                        borderColor: '#1F6FEB',
                        color: '#1F6FEB',
                        opacity: 1,
                      },
                    }}
                    onClick={() => navigate('/about')}
                  >
                    Learn More
                  </Button>
                </Box>
              </Box>
            </Grid>
            {/* Right: Animation */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(88, 166, 255, 0.2) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    zIndex: 0
                  }
                }}
              >
                <Lottie
                  animationData={animationData}
                  loop={true}
                  style={{
                    width: '100%',
                    height: 'auto',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features & Services Section - Horizontal Scroll on Mobile */}
      <Box id="features" sx={{ py: 10, background: 'transparent', position: 'relative', zIndex: 3 }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 800,
              background: "linear-gradient(90deg, #58A6FF 10%, #1F6FEB 60%, #BFC9CA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2.2rem", md: "3rem" },
              letterSpacing: "-1px",
              animation: 'fadeInUp 1.2s cubic-bezier(.23,1.01,.32,1) both',
            }}
          >
            Features & Services
          </Typography>
          <Box sx={{ overflowX: { xs: 'auto', md: 'visible' }, pb: 2 }}>
            <Grid container spacing={4} justifyContent="center" sx={{ flexWrap: { xs: 'nowrap', md: 'wrap' }, minWidth: { xs: 700, md: 'unset' } }}>
              {features.map((f, idx) => (
                <Grid item xs={8} sm={6} md={4} key={f.title} sx={{ minWidth: { xs: 260, md: 'unset' }, animation: `fadeInUp 1.${idx + 2}s cubic-bezier(.23,1.01,.32,1) both` }}>
                  <Card sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.09)',
                    boxShadow: '0 4px 24px #1F6FEB22',
                    border: '1px solid rgba(31, 111, 235, 0.10)',
                    textAlign: 'center',
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.04)',
                      boxShadow: '0 8px 32px #1F6FEBaa',
                      border: '1.5px solid #1F6FEB',
                    },
                  }}>
                    <Avatar sx={{ bgcolor: 'rgba(31,111,235,0.10)', width: 64, height: 64, mb: 2, boxShadow: '0 2px 8px #1F6FEB22' }}>
                      {f.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ color: '#58A6FF', mb: 1, fontWeight: 700 }}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ color: '#BFC9CA', fontSize: '1.08rem' }}>
                      {f.desc}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* How LynxLake Works Section */}
      <Box sx={{ py: 10, background: 'transparent', position: 'relative', zIndex: 3 }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 800,
              background: "linear-gradient(90deg, #58A6FF 10%, #1F6FEB 60%, #BFC9CA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "1.7rem", md: "2.2rem" },
              letterSpacing: "-1px",
              animation: 'fadeInUp 1.2s cubic-bezier(.23,1.01,.32,1) both',
            }}
          >
            How LynxLake Works
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {steps.map((step, idx) => (
              <Grid item xs={12} md={4} key={step.label} sx={{ animation: `fadeInUp 1.${idx + 2}s cubic-bezier(.23,1.01,.32,1) both` }}>
                <Card sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.09)',
                  boxShadow: '0 4px 24px #1F6FEB22',
                  border: '1px solid rgba(31, 111, 235, 0.10)',
                  textAlign: 'center',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.04)',
                    boxShadow: '0 8px 32px #1F6FEBaa',
                    border: '1.5px solid #1F6FEB',
                  },
                }}>
                  <Avatar sx={{ bgcolor: 'rgba(31,111,235,0.10)', width: 56, height: 56, mb: 2, boxShadow: '0 2px 8px #1F6FEB22' }}>
                    {step.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ color: '#58A6FF', mb: 1, fontWeight: 700 }}>
                    {step.label}
                  </Typography>
                  <Typography sx={{ color: '#BFC9CA', fontSize: '1.05rem' }}>
                    {step.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(90deg, #1F6FEB 0%, #58A6FF 100%)', position: 'relative', zIndex: 3 }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#05070A', fontWeight: 800, mb: 2 }}>
              Ready to build with the LynxLake community?
            </Typography>
            <Typography sx={{ color: '#E6EDF3', mb: 4 }}>
              Join LynxLake today and experience the next generation of collaborative code editing.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(90deg, #1F6FEB 0%, #58A6FF 100%)',
                color: '#05070A',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 4px 20px #1F6FEB33',
                '&:hover': {
                  background: 'linear-gradient(90deg, #58A6FF 0%, #1F6FEB 100%)',
                  color: '#fff',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/auth')}
            >
              Join Now
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default HomePage;
