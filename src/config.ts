// Centralized config for environment variables
// Reads both VITE_BACKEND_BASE_URL and VITE_API_BASE_URL for flexibility

const rawBase = (import.meta as any).env.VITE_BACKEND_BASE_URL || (import.meta as any).env.VITE_API_BASE_URL;

if (!rawBase) {
  throw new Error('Missing VITE_BACKEND_BASE_URL (or VITE_API_BASE_URL) in .env');
}

// Ensure absolute URL with protocol; if missing, default to http:// for dev ergonomics
const withProtocol = /^https?:\/\//i.test(rawBase) ? rawBase : `http://${rawBase}`;

export const API_BASE: string = withProtocol.replace(/\/$/, '');

// Defaults for room/identity; can be overridden via env
export const DEFAULT_ROOM: string = (import.meta as any).env.VITE_DEFAULT_ROOM || 'training';
export const IDENTITY_PREFIX: string = (import.meta as any).env.VITE_ID_PREFIX || 'user';
