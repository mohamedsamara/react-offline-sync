import { NOTE_SYNC_STATUS } from "lib/constants";

export type NoteSyncStatus = keyof typeof NOTE_SYNC_STATUS;

export interface Note {
  uid: string;
  title: string;
  content: string;
  syncStatus: NoteSyncStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon: string;
  tag: string;
  badge: string;
  url: string;
}
