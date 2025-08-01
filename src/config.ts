// API Configuration
const isDevelopment = import.meta.env.DEV;

// Use environment variable if provided, otherwise fallback to defaults
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isDevelopment 
    ? 'http://localhost:3001' 
    : 'https://easypublication.onrender.com');

// Helper function to create API URLs
export const createApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

export const API_ENDPOINTS = {
  GROQ_KEY: '/api/groq-key',
  UPDATE_PUBLICATION: '/api/update-publication',
  UPLOAD: '/api/upload',
  HEALTH: '/api/health',
  ALL_PUBLICATIONS: '/api/publications',
  PUBLICATIONS_BY_CATEGORY: '/api/publications'  // Will append category to this
} as const;
