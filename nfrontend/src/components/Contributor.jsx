import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

//hooks
import useAPI from "../hooks/api";

//utils
import { getAvatar, getUserInitials, getBestUserProfileImage } from "../utils/avatar";

import {
  Box,
  Chip,
  Avatar,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress
} from "@mui/material";

//Material Icons
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

function Contributor(props) {
  const { projectId, handleClose, onContributorAdded } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserSet, setSelectedUserSet] = useState(new Set());
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [isAddingContributor, setIsAddingContributor] = useState(false);
  const [justVerify, setJustVerify] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  const { GET, POST } = useAPI();

  const inputRef = useRef(null);

  const fetchUsers = async () => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }
    setIsFetchingUsers(true);
    try {
      const { data } = await GET(`/user/search-user?searchTerm=${searchTerm}`);
      setSuggestions(data.filter(user => !selectedUserSet.has(user.emailid)));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error searching users!");
    } finally {
      setIsFetchingUsers(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSelectedUserSet((prev) => new Set(prev).add(user.emailid));
    setSearchTerm("");
    setSuggestions([]);
    inputRef.current.focus();
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers((prev) => prev.filter(user => user.id !== userToRemove.id));
    setSelectedUserSet((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userToRemove.emailid);
      return newSet;
    });
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
        handleSelectUser(suggestions[activeSuggestion]);
      }
    }
  };

  const addContributor = async (contributors) => {
    setIsAddingContributor(true);
    try {
      await POST(`api/project/add-contributor/${projectId}`, { contributors });
      toast.success("Contributors added successfully!");
      onContributorAdded();
      handleClose();
      setSelectedUsers([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsAddingContributor(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      setJustVerify(true);
      return;
    }
    addContributor(selectedUsers)
  }

  return (
    <Box sx={{
      minWidth: "300px",
      minHeight: "240px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
      position: "fixed",
      top: "50%",
      left: "50%",
      zIndex: 1000,
      bgcolor: "rgb(245, 245, 245)",
      transform: "translate(-50%, -50%)",
      p: 3,
      borderRadius: "10px",
      border: "1px solid #8C8C8C",
      // boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px"
    }}>
      <Box onClick={handleClose} sx={{
        m: 1,
        position: "absolute",
        top: 0,
        right: 0,
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <button style={{ padding: 0 }}>
          <CloseRoundedIcon fontSize="small" sx={{ color: "black" }} />
        </button>
      </Box>
      <Box sx={{ m: 3 }}>
        <Typography fontWeight="bold" fontSize="xx-large">Add Contributors</Typography>
      </Box>
      {/* Pills */}
      {selectedUsers.length ? selectedUsers.map((user, index) => (
        <Box sx={{ my: "2px", mx: "4px" }} key={index}>
          <Chip
            label={`${user.username}`} // Adjusted for firstname and lastname
            onDelete={() => handleRemoveUser(user)}
            avatar={
              <Avatar 
                src={getBestUserProfileImage(user)}
                alt="profile-image" 
                sx={{ width: 20, height: 20, border: "1px solid black" }}
                imgProps={{
                  crossOrigin: "anonymous",
                  referrerPolicy: "no-referrer",
                  decoding: "async",
                }}
              >
                {getUserInitials(user)}
              </Avatar>
            }
            sx={{
              height: "40px", display: "flex", alignItems: "center",
              "& .MuiChip-deleteIcon": {
                color: "#4D4D4D", // Customize the color of the close icon
                fontSize: "20px", // Adjust the icon size if needed
                "&:hover": {
                  color: "black", // Change color on hover for effect
                },
              },
            }}
          />
        </Box>
      )) : null}
      <form onSubmit={handleSubmit} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ m: 2 }}>
          <TextField
            autoFocus
            inputRef={inputRef}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setJustVerify(false); }}
            id="contributors"
            label="Contributors"
            placeholder="Search For a User..."
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
            autoComplete="on"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonRoundedIcon sx={{ color: "#333333" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <button style={{ fontWeight: "bold", margin: 0, borderRadius: 10 }}>
                    {isAddingContributor ? (
                      <>
                        Adding... &nbsp;&nbsp;
                        <CircularProgress
                          size={20}
                          thickness={6}
                          sx={{
                            color: "black",
                            '& circle': { strokeLinecap: 'round' },
                          }}
                        />
                      </>
                    ) : (
                      "Add"
                    )}
                  </button>
                </InputAdornment>
              )
            }}
            error={
              justVerify && (selectedUsers.length === 0)
            }
            helperText={
              justVerify &&
              (selectedUsers.length === 0 ? "Please select atleast a user." : "")
            }
            sx={{
              color: "black",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontWeight: "bold",
                "&.Mui-focused fieldset": {
                  borderColor: "black", // Keep the border color when focused
                },
              },
              "& .MuiInputLabel-root": {
                color: "black", // Change the label color
                "&.Mui-focused": {
                  color: "black", // Change the label color
                },
              },
            }}
          />
        </Box>
      </form>
      {isFetchingUsers ?
        (<CircularProgress
          size={20}
          thickness={7}
          sx={{
            color: "black",
            '& circle': { strokeLinecap: 'round' },
          }}
        />) : (suggestions.length > selectedUsers.length ? (
          suggestions.map((user, index) =>
            !selectedUserSet.has(user.emailid) && (
              <Box key={index} sx={{ width: "100%", px: 2 }}>
                <button
                  style={{ width: "100%", display: "flex", justifyContent: "flex-start", margin: 1 }}
                  selected={index === activeSuggestion}
                  onClick={() => handleSelectUser(user)}
                >
                  <Box>
                    <Avatar
                      src={getBestUserProfileImage(user)}
                      alt="profile-image"
                      sx={{ border: "1px solid black" }}
                      imgProps={{
                        crossOrigin: "anonymous",
                        referrerPolicy: "no-referrer",
                        decoding: "async",
                      }}
                    >
                      {getUserInitials(user)}
                    </Avatar>
                  </Box>
                  <Box sx={{ mx: 1 }}>
                    <Typography fontWeight="bold">
                      {user.username}
                    </Typography>
                  </Box>
                </button>
              </Box>
            )))
          : null
        )}
    </Box >
  );
}

export default Contributor;
