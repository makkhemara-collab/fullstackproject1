export const baseURL = "https://fullstackproject1-2.onrender.com/";

export const getImagePath = (path) => {
  // If no path is provided in the database, use a default coffee image
  if (!path) return "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500";
  
  // Remove any accidental starting slashes from the database path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Force exactly ONE slash between baseURL and the path
  const safeBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  
  return `${safeBaseURL}${cleanPath}`;
};