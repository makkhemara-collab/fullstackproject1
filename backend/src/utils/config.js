// src/utils/config.js
export const getProfilePic = (fileName) => {
  if (!fileName) return "/default-avatar.png"; // A generic fallback in your public folder
  return `http://localhost:3000/assets/upload/${fileName}`;
};