export const API_URL = import.meta.env.VITE_API_URL;
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export enum NOTE_SYNC_STATUS {
  NONE = "none",
  NEW = "new",
  DELETED = "deleted",
  UPDATED = "updated",
  SYNCED = "synced",
}

export enum SYNC_NOTES {
  NEW = "sync-new-notes",
  DELETED = "sync-deleted-notes",
  UPDATED = "sync-updated-notes",
}

export enum POST_MESSAGES {
  NOTIFICATION_RECEIVED = "notification-received",
  NOTES_SYNC_COMPLETE = "notes-sync-complete",
}
