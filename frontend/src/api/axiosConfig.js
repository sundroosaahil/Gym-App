import axios from 'axios';

// Same-origin path: Vercel rewrites /api/* to the Render backend (see vercel.json).
// This makes the auth cookie first-party from the browser's perspective,
// which is required for it to persist reliably on iOS Safari/Chrome (WebKit's ITP
// blocks/evicts cross-site cookies even with SameSite=None; Secure).
const baseURL = '/api';

const api = axios.create({
  baseURL,
  withCredentials: true
});

export default api;