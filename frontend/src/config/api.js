// Central API URL — set VITE_API_URL in .env for production
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API;
