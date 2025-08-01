// API URLs based on environment
const isDevelopment = process.env.NODE_ENV === "development";

export const API_BASE_URL = isDevelopment 
  ? "http://localhost:3001"
  : "https://easypublication.onrender.com";

export const DATA_FILE_URL = isDevelopment
  ? "/data/all-publications.json"
  : "https://easypublication.onrender.com/data/all-publications.json";

export const API_ENDPOINTS = {
  groqKey: `${API_BASE_URL}/api/groq-key`,
  searchDoi: `${API_BASE_URL}/api/search-doi`,
  searchPublications: `${API_BASE_URL}/api/search-publications`,
  updatePublication: `${API_BASE_URL}/api/update-publication`,
  upload: `${API_BASE_URL}/api/upload`,
  health: `${API_BASE_URL}/api/health`,
};
