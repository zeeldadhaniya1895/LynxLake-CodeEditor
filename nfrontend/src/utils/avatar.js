import avatar1 from "../images/avatars/avatar1.png";
import avatar2 from "../images/avatars/avatar2.png";
import avatar3 from "../images/avatars/avatar3.png";
import avatar4 from "../images/avatars/avatar4.png";
import avatar5 from "../images/avatars/avatar5.jpg";
import avatar6 from "../images/avatars/avatar6.jpg";
import avatar7 from "../images/avatars/avatar7.jpg";
import avatar8 from "../images/avatars/avatar8.jpg";
import avatar9 from "../images/avatars/avatar9.jpg";
import avatar10 from "../images/avatars/avatar10.jpg";
import avatar11 from "../images/avatars/avatar11.jpg";
import avatar12 from "../images/avatars/avatar12.jpg";
import avatar13 from "../images/avatars/avatar13.jpg";
import avatar14 from "../images/avatars/avatar14.jpg";
import avatar15 from "../images/avatars/avatar15.jpg";
import avatar16 from "../images/avatars/avatar16.jpg";
import avatar17 from "../images/avatars/avatar17.jpg";
import avatar18 from "../images/avatars/avatar18.jpg";
import avatar19 from "../images/avatars/avatar19.jpg";

export const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10, avatar11, avatar12, avatar13, avatar14, avatar15, avatar16, avatar17, avatar18, avatar19];

export const getAvatar = (image) => {
  // If image is a URL (Google auth or external image)
  if (typeof image === 'string' && image.startsWith('http')) {
    return image;
  }
  
  // If image is a number (selected avatar index)
  if (typeof image === 'number' && image >= 0 && image < avatars.length) {
    return avatars[image];
  }
  
  // If image is a string that's a number (selected avatar index as string)
  if (typeof image === 'string' && !isNaN(image) && parseInt(image) >= 0 && parseInt(image) < avatars.length) {
    return avatars[parseInt(image)];
  }
  
  // If image is a valid avatar path (already imported)
  if (typeof image === 'string' && avatars.includes(image)) {
    return image;
  }
  
  // Default fallback to first avatar
  return avatars[0];
};

export const getUserInitials = (userInfo) => {
  if (userInfo.fullName) {
    return userInfo.fullName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
  }
  if (userInfo.userName) {
    return userInfo.userName.slice(0, 2).toUpperCase();
  }
  return 'U';
};

// Get the best available profile image, prioritizing profileImage over image
export const getBestProfileImage = (userInfo) => {
  // If profileImage exists and is not empty, use it; otherwise fall back to image
  const imageToUse = userInfo.profileImage !== null && userInfo.profileImage !== undefined && userInfo.profileImage !== "" 
    ? userInfo.profileImage 
    : userInfo.image;
  
  return getAvatar(imageToUse);
};

// Get the best available profile image for user objects with profile_image field
export const getBestUserProfileImage = (user) => {
  // If profile_image exists and is not empty, use it; otherwise fall back to image
  const imageToUse = user.profile_image !== null && user.profile_image !== undefined && user.profile_image !== "" 
    ? user.profile_image 
    : user.image;
  
  return getAvatar(imageToUse);
};