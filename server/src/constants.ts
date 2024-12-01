export const PORT = 3000;
export const ALLOWED_ORIGINS = process.env.SOCKET_ALLOWED_DOMAINS
  ? process.env.SOCKET_ALLOWED_DOMAINS.split(",")
  : [];
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
