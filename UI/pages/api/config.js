export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/upload`,
  DOWNLOAD: (port) => `${API_BASE_URL}/download/${port}`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
