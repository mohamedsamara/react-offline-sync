import webpush from "web-push";
import { z } from "zod";

export type Note = {
  uid: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type Subscription = webpush.PushSubscription;

export type NotificationPayload = {
  title: string;
  body: string;
  tag: string;
  icon?: string;
};

export const createNoteSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  createdAt: z.string().min(1, "Created at is required"),
  updatedAt: z.string().min(1, "Updated at is required"),
});

export const updateNoteSchema = createNoteSchema
  .omit({
    uid: true,
    createdAt: true,
  })
  .extend({
    isDeleted: z.boolean().optional(),
  });

export type CreateNoteRequest = z.infer<typeof createNoteSchema>;
export type UpdateNoteRequest = z.infer<typeof updateNoteSchema>;
