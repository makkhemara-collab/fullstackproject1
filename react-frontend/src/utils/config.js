// This MUST be the Backend (the -dzlc link), NOT the frontend
export const baseURL = "https://fullstackproject1-1-dzlc.onrender.com/";

export const getImagePath = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500";
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const safeBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  
  return `${safeBaseURL}${cleanPath}`;
};