// Central place for the backend URL. In production, set REACT_APP_API_URL
// in your Vercel project's Environment Variables to your deployed backend
// (e.g. https://house-hunt-api.onrender.com). Locally, it falls back to
// your dev backend on port 5000 automatically.

export const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000";