import React, { useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

function FileTreeNode({ node, level = 0, onAdd, onRename, onDelete, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(node.isFolder ? !!node.expand : false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleAdd = (e, isFolder) => {
    e.stopPropagation();
    setShowInput(isFolder ? "folder" : "file");
    setInputValue("");
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setShowInput("rename");
    setInputValue(node.name);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(node);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      if (showInput === "rename" && onRename) onRename(node, inputValue.trim());
      else if (onAdd) onAdd(node, inputValue.trim(), showInput === "folder");
      setShowInput(false);
      setInputValue("");
    } else if (e.key === "Escape") {
      setShowInput(false);
      setInputValue("");
    }
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(node);
  };

  return (
    <Box sx={{ pl: level * 2, bgcolor: selectedId === node.id ? "#353a45" : "inherit", borderRadius: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", py: 0.5, cursor: "pointer" }} onClick={handleSelect}>
        {node.isFolder ? (
          <IconButton size="small" onClick={handleExpand} sx={{ color: "white" }}>
            {expanded ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
          </IconButton>
        ) : (
          <Box sx={{ width: 32 }} />
        )}
        <Box sx={{ color: "white", display: "flex", alignItems: "center", flex: 1 }}>
          {node.isFolder ? <FolderOutlinedIcon fontSize="small" /> : <InsertDriveFileOutlinedIcon fontSize="small" />}
          {showInput === "rename" ? (
            <input
              autoFocus
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{ marginLeft: 8, background: "#23272f", color: "white", border: "1px solid #444", borderRadius: 4, padding: "2px 6px" }}
            />
          ) : (
            <Typography sx={{ ml: 1, color: "white", fontWeight: 500 }}>{node.name}</Typography>
          )}
        </Box>
        {showInput ? null : (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {node.isFolder && (
              <Tooltip title="Add Folder"><IconButton size="small" onClick={e => handleAdd(e, true)} sx={{ color: "white" }}><AddRoundedIcon fontSize="small" /></IconButton></Tooltip>
            )}
            {node.isFolder && (
              <Tooltip title="Add File"><IconButton size="small" onClick={e => handleAdd(e, false)} sx={{ color: "white" }}><InsertDriveFileOutlinedIcon fontSize="small" /></IconButton></Tooltip>
            )}
            <Tooltip title="Rename"><IconButton size="small" onClick={handleRename} sx={{ color: "white" }}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" onClick={handleDelete} sx={{ color: "white" }}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        )}
      </Box>
      {showInput && showInput !== "rename" && (
        <Box sx={{ pl: 5, py: 0.5 }}>
          <input
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={showInput === "folder" ? "New Folder" : "New File"}
            style={{ background: "#23272f", color: "white", border: "1px solid #444", borderRadius: 4, padding: "2px 6px" }}
          />
        </Box>
      )}
      {expanded && node.items && node.items.length > 0 && (
        <Box>
          {node.items.map(child => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onAdd={onAdd}
              onRename={onRename}
              onDelete={onDelete}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default FileTreeNode; 