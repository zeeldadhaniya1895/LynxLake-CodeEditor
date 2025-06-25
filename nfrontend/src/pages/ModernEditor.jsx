import React, { useState } from "react";
import ModernFileExplorer from "../components/ModernFileExplorer";
import ModernCodeEditor from "../components/ModernCodeEditor";
import ProjectHeader from "../components/ProjectHeader";
import InteractiveBackground from "../components/InteractiveBackground";
import { Box, Typography, Container, Avatar, Button, IconButton } from "@mui/material";
import { useUser } from "../context/user";
import { getBestProfileImage, getUserInitials } from "../utils/avatar";
import CodeIcon from '@mui/icons-material/Code';
import EditorLayout from "../components/layout/EditorLayout";
import { useParams } from "react-router-dom";

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
  const { projectId } = useParams();
  const [selectedFile, setSelectedFile] = useState(null); // { id, name, ... }
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240); // default width
  const { userInfo } = useUser();
  const profileImageSrc = getBestProfileImage(userInfo);
  const initials = getUserInitials(userInfo);

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#0d1117' }}>
      <EditorLayout projectId={projectId} />
    </Box>
  );
}

export default ModernEditor; 