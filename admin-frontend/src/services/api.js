import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy forwards to http://localhost:8085/api
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Strip accidental wrapping quotes if present
    const cleanToken = token.replace(/^["']|["']$/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// Response handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 🔴 401 means Token is Expired/Invalid -> Log them out
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }

    // 🟡 403 means Role/Permission Mismatch -> DO NOT log out.
    // Just pass the error back so the form's catch block can alert the real message.
    return Promise.reject(err);
  }
);

export default api;