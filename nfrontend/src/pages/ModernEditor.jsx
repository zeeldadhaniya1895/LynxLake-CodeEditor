import React, { useState } from "react";
import ModernFileExplorer from "../components/ModernFileExplorer";
import ModernCodeEditor from "../components/ModernCodeEditor";
import ProjectHeader from "../components/ProjectHeader";
import InteractiveBackground from "../components/InteractiveBackground";
import { Box, Typography, Container, Avatar, Button, IconButton } from "@mui/material";
import { useUser } from "../context/user";
import { getBestProfileImage, getUserInitials } from "../utils/avatar";
import CodeIcon from '@mui/icons-material/Code';

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "transparent",
    position: "relative",
    zIndex: 1,
  },
  sidebar: (sidebarOpen) => ({
    width: sidebarOpen ? "240px" : 0,
    minWidth: sidebarOpen ? "240px" : 0,
    maxWidth: sidebarOpen ? "400px" : 0,
    background: "#23272f",
    color: "white",
    overflowY: "auto",
    height: "100%",
    boxShadow: sidebarOpen ? "2px 0 8px rgba(0,0,0,0.04)" : "none",
    zIndex: 2,
    transition: "width 0.3s, min-width 0.3s, max-width 0.3s",
    display: sidebarOpen ? 'block' : 'block',
  }),
  mainContent: (sidebarOpen) => ({
    flexGrow: 1,
    background: "transparent",
    width: sidebarOpen ? "calc(100% - 240px)" : "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    zIndex: 2,
    transition: "width 0.3s",
  }),
  welcomeBox: (sidebarOpen) => ({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#E6EDF3",
    textAlign: "center",
    zIndex: 1,
    position: "relative",
    pointerEvents: sidebarOpen ? 'none' : 'auto',
  }),
};

function ModernEditor() {
  const [selectedFile, setSelectedFile] = useState(null); // { id, name, ... }
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240); // default width
  const { userInfo } = useUser();
  const profileImageSrc = getBestProfileImage(userInfo);
  const initials = getUserInitials(userInfo);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', background: 'transparent' }}>
      <InteractiveBackground />
      {/* Navbar - VS Code style */}
      <ProjectHeader
        searchValue={""}
        onSearchChange={() => {}}
        onSortProjects={() => {}}
        isAscending={true}
        userInfo={userInfo}
        isProfileVisible={false}
        onToggleProfile={() => {}}
        onCloseProfile={() => {}}
        profileRef={null}
        showSearchAndSort={false}
      />
      {/* Main Editor Layout */}
      <Box sx={styles.container}>
        <Box sx={{
          width: sidebarOpen ? sidebarWidth : 0,
          minWidth: sidebarOpen ? sidebarWidth : 0,
          maxWidth: sidebarOpen ? 500 : 0,
          background: "#23272f",
          color: "white",
          overflowY: "auto",
          height: "100%",
          boxShadow: sidebarOpen ? "2px 0 8px rgba(0,0,0,0.04)" : "none",
          zIndex: 2,
          transition: "width 0.3s, min-width 0.3s, max-width 0.3s",
          display: sidebarOpen ? 'block' : 'block',
        }}>
          <ModernFileExplorer setSelectedFile={setSelectedFile} selectedFile={selectedFile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} />
        </Box>
        <Box sx={styles.mainContent(sidebarOpen)}>
          {/* If no file is selected, show VS Code style welcome/empty state */}
          {!selectedFile ? (
            <Box sx={styles.welcomeBox(sidebarOpen)}>
              <Avatar
                sx={{ width: 80, height: 80, mb: 2, bgcolor: '#23272f', border: '2px solid #58A6FF', fontSize: 40 }}
                src={profileImageSrc}
              >
                {initials}
              </Avatar>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, background: 'linear-gradient(135deg, #E6EDF3, #58A6FF)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Welcome to CoEdit
              </Typography>
              <Typography variant="h6" sx={{ color: '#A0B3D6', mb: 3 }}>
                Start by selecting a file from the left or create a new one.<br />
                <span style={{ color: '#58A6FF' }}>Collaborate live, just like VS Code!</span>
              </Typography>
              <CodeIcon sx={{ fontSize: 60, color: '#58A6FF', mb: 2 }} />
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, px: 4, py: 1, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 2, background: 'linear-gradient(135deg, #58A6FF 0%, #1F6FEB 100%)' }}
                onClick={() => {}}
                disabled
              >
                Create New File (Coming Soon)
              </Button>
            </Box>
          ) : (
            <ModernCodeEditor selectedFile={selectedFile} />
          )}
          {/* SidebarOpen Button - Always on top, outside welcomeBox */}
          {!sidebarOpen && (
            <Box
              sx={{
                position: 'fixed',
                left: 8,
                top: 80,
                zIndex: 100,
                display: 'flex',
                bgcolor: '#23272f',
                borderRadius: 2,
                boxShadow: 2,
                color: '#58A6FF',
                pointerEvents: 'auto',
              }}
            >
              <IconButton onClick={() => setSidebarOpen(true)}>
                <CodeIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ModernEditor; 