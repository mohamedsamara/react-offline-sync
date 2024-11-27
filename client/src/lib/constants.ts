export const API_URL = import.meta.env.VITE_API_URL;

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
  SYNC_COMPLETE = "notes-sync-complete",
}
