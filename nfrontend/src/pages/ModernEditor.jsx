import React, { useState } from "react";
import ModernFileExplorer from "../components/ModernFileExplorer";
import ModernCodeEditor from "../components/ModernCodeEditor";
import { Box } from "@mui/material";

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f0f0f0", // Match project page theme
  },
  sidebar: {
    minWidth: "240px",
    background: "#23272f", // Match project page sidebar color
    color: "white",
    overflowY: "auto",
    height: "100%",
    boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
  },
  mainContent: {
    flexGrow: 1,
    background: "#f0f0f0",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
};

function ModernEditor() {
  const [selectedFile, setSelectedFile] = useState(null); // { id, name, ... }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.sidebar}>
        <ModernFileExplorer setSelectedFile={setSelectedFile} selectedFile={selectedFile} />
      </Box>
      <Box sx={styles.mainContent}>
        <ModernCodeEditor selectedFile={selectedFile} />
      </Box>
    </Box>
  );
}

export default ModernEditor; 