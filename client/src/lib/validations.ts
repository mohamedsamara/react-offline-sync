import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
