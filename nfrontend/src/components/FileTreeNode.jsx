import React, { useState } from "react";
import { Box, Typography, IconButton, Tooltip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MoreVertIcon from '@mui/icons-material/MoreVert';

function FileTreeNode({ node, level = 0, onAdd, onRename, onDelete, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(node.isFolder ? !!node.expand : false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleMenuRename = (e) => {
    handleMenuClose();
    handleRename(e);
  };

  const handleMenuDelete = (e) => {
    handleMenuClose();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDelete) onDelete(node);
  };

  const handleDeleteCancel = () => setShowDeleteDialog(false);

  return (
    <Box sx={{ pl: level * 2, bgcolor: selectedId === node.id ? "#23272f" : "inherit", borderRadius: 1, '&:hover': { bgcolor: '#23272f' } }}>
      <Box
        sx={{ display: "flex", alignItems: "center", py: 0.5, cursor: "pointer", position: 'relative', '&:hover .filetree-more': { opacity: 1 } }}
        onClick={node.isFolder ? undefined : handleSelect}
      >
        {node.isFolder ? (
          <IconButton size="small" onClick={handleExpand} sx={{ color: "#A0B3D6", mr: 0.5 }}>
            {expanded ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
          </IconButton>
        ) : (
          <Box sx={{ width: 32 }} />
        )}
        <Box sx={{ color: "#E6EDF3", display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
          {node.isFolder ? <FolderOutlinedIcon fontSize="small" sx={{ color: '#58A6FF', mr: 0.5 }} /> : <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: '#A0B3D6', mr: 0.5 }} />}
          {showInput === "rename" ? (
            <input
              autoFocus
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onClick={e => e.stopPropagation()}
              style={{
                marginLeft: 8,
                background: '#181c23',
                color: '#58A6FF',
                border: '1.5px solid #58A6FF',
                borderRadius: 6,
                padding: '4px 10px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 2px 8px #58A6FF22',
                outline: 'none',
                minWidth: 80,
                maxWidth: 180,
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
            />
          ) : (
            <Typography sx={{ ml: 1, color: selectedId === node.id ? '#58A6FF' : '#E6EDF3', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '1rem' }}>{node.name}</Typography>
          )}
        </Box>
        {/* More menu */}
        {!showInput && (
          <IconButton size="small" className="filetree-more" sx={{ color: '#A0B3D6', opacity: 0, ml: 0.5, transition: 'opacity 0.2s', zIndex: 2 }} onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} onClick={e => e.stopPropagation()}>
          {node.isFolder && [
            <MenuItem key="create-file" onClick={e => { handleMenuClose(); handleAdd(e, false); }}>Create File</MenuItem>,
            <MenuItem key="create-folder" onClick={e => { handleMenuClose(); handleAdd(e, true); }}>Create Subfolder</MenuItem>,
            <Box key="divider" sx={{ borderBottom: '1px solid #23272f', my: 0.5 }} />
          ]}
          <MenuItem onClick={handleMenuRename}>Rename</MenuItem>
          <MenuItem onClick={handleMenuDelete} sx={{ color: '#ff5252' }}>Delete</MenuItem>
        </Menu>
        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteDialog} onClose={handleDeleteCancel} onClick={e => e.stopPropagation()}>
          <DialogTitle>Delete {node.isFolder ? 'Folder' : 'File'}?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete <b>{node.name}</b>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary" variant="outlined">Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">Yes, Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
      {showInput && showInput !== "rename" && (
        <Box sx={{ pl: 5, py: 0.5 }}>
          <input
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={showInput === "folder" ? "New Folder" : "New File"}
            style={{ background: "#181c23", color: "#58A6FF", border: "1.5px solid #58A6FF", borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px #58A6FF22', outline: 'none', minWidth: 80, maxWidth: 180 }}
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