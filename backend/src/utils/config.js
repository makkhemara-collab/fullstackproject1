// src/utils/config.js
export const getProfilePic = (fileName) => {
  if (!fileName) return "/default-avatar.png"; // A generic fallback in your public folder
  return `https://fullstackproject1-2.onrender.com/assets/upload/${fileName}`;
};