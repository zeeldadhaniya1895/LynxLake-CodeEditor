import React from "react";

// Material UI Components
import { Box, Typography, Link, Grid, IconButton, Container } from "@mui/material";

// Material UI Icons
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = ({ gridBG }) => {
  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(180deg, #05070A 0%, #10131A 100%)",
        color: "#E6EDF3",
        py: 6,
        position: "relative",
        overflow: 'hidden',
        zIndex: 10,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.2), transparent)",
        }
      }}
    >
      {/* Animated grid background if provided */}
      {gridBG && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>{gridBG}</Box>
      )}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                mb: 3,
                background: "linear-gradient(45deg, #58A6FF, #1F6FEB)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
              }}
            >
              LynxLake
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#8B949E",
                mb: 2,
                lineHeight: 1.6,
              }}
            >
              Your Modern Code Editor for Collaborative Development
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                href="https://github.com/ManojDhundhalva/LynxLake"
                target="_blank"
                sx={{
                  color: "#58A6FF",
                  "&:hover": {
                    background: "rgba(88, 166, 255, 0.1)",
                  },
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                href="mailto:LynxLake.service@gmail.com"
                sx={{
                  color: "#58A6FF",
                  "&:hover": {
                    background: "rgba(88, 166, 255, 0.1)",
                  },
                }}
              >
                <EmailRoundedIcon />
              </IconButton>
              <IconButton
                href="https://www.linkedin.com/in/manoj-dhundhalva-62ba0b24b/"
                target="_blank"
                sx={{
                  color: "#58A6FF",
                  "&:hover": {
                    background: "rgba(88, 166, 255, 0.1)",
                  },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: "#E6EDF3",
              }}
            >
              Contact
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <EmailRoundedIcon sx={{ color: "#58A6FF" }} />
              <Typography
                variant="body2"
                sx={{
                  color: "#8B949E",
                }}
              >
                LynxLake.service@gmail.com
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: "#E6EDF3",
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="/"
                sx={{
                  color: "#8B949E",
                  textDecoration: "none",
                  "&:hover": {
                    color: "#58A6FF",
                  },
                }}
              >
                Home
              </Link>
              <Link
                href="/about"
                sx={{
                  color: "#8B949E",
                  textDecoration: "none",
                  "&:hover": {
                    color: "#58A6FF",
                  },
                }}
              >
                About
              </Link>
              <Link
                href="/auth"
                sx={{
                  color: "#8B949E",
                  textDecoration: "none",
                  "&:hover": {
                    color: "#58A6FF",
                  },
                }}
              >
                Login / Sign Up
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: "1px solid rgba(88, 166, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#8B949E",
            }}
          >
            © {new Date().getFullYear()} LynxLake. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
