import express, { Request, Response } from "express";
import webpush from "web-push";

import { handleApiError } from "./utils";
import { FRONTEND_URL } from "./constants";
import { io } from "./index";

import {
  Note,
  Subscription,
  NotificationPayload,
  CreateNoteRequest,
  UpdateNoteRequest,
  createNoteSchema,
  updateNoteSchema,
} from "./types";

const router = express.Router();

// In-memory notes store (this could later be replaced with a database like MongoDB)
let notes: Note[] = [];
// In-memory subscriptions store
let subscriptions: Subscription[] = [];

// Function to send push notification
const sendPushNotification = async (
  subscription: Subscription,
  payload: NotificationPayload
) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

// POST: Subscribe for push notifications
router.post("/subscribe", (req: Request, res: Response) => {
  try {
    const subscription = req.body;
    if (!subscription) {
      return res
        .status(400)
        .json({ success: false, message: "Subscription data missing." });
    }

    // Add the subscription to the in-memory store
    subscriptions.push(subscription);

    // Send a confirmation response
    res
      .status(201)
      .json({ success: true, message: "Subscribed successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
});

// POST: Unsubscribe from push notifications
router.post("/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res
        .status(400)
        .json({ success: false, message: "Endpoint is required." });
    }

    subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);

    res
      .status(200)
      .json({ success: true, message: "Unsubscribed successfully." });
  } catch (error) {
    handleApiError(error, res);
  }
});

// GET: Get all notes
router.get("/notes", (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: notes });
  } catch (error) {
    handleApiError(error, res);
  }
});

// GET: Get a note by uid
router.get("/notes/:uid", (req: Request, res: Response) => {
  try {
    const noteId = req.params.uid;

    if (!noteId) {
      return res
        .status(400)
        .json({ success: false, message: "Note id is missing" });
    }

    const note = notes.find((n) => n.uid === noteId);

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note is not found" });
    }

    res.json({ success: true, data: note });
  } catch (error) {
    handleApiError(error, res);
  }
});

// POST: Add a new note
router.post("/notes", (req: Request, res: Response) => {
  try {
    const validatedBody: CreateNoteRequest = createNoteSchema.parse(req.body);

    const { uid, title, content, createdAt, updatedAt } = validatedBody;

    if (!title || !content || !createdAt || !updatedAt) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required." });
    }

    const newNote = {
      uid: uid,
      title,
      content,
      createdAt,
      updatedAt,
      isDeleted: false,
    };

    notes.push(newNote);

    const notificationPayload = {
      title: "Note Created",
      body: `${newNote.title} was added.`,
      url: `${FRONTEND_URL}/notes`,
      tag: "new-note",
    };

    subscriptions.forEach((subscription) => {
      sendPushNotification(subscription, notificationPayload);
    });

    io.emit("note-update", { action: "add", note: newNote });

    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    handleApiError(error, res);
  }
});

// PUT: Update a note by uid
router.put("/notes/:uid", (req: Request, res: Response) => {
  try {
    const validatedBody: UpdateNoteRequest = updateNoteSchema.parse(req.body);

    const { title, content, updatedAt, isDeleted } = validatedBody;

    if (!title || !content || !updatedAt) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required." });
    }

    const noteId = req.params.uid;

    if (!noteId) {
      return res
        .status(400)
        .json({ success: false, message: "Note ID is required." });
    }

    const noteToUpdate = notes.find((note) => note.uid === noteId);

    if (!noteToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found." });
    }

    const newNote = {
      ...noteToUpdate,
      title,
      content,
      updatedAt,
      isDeleted: isDeleted ?? noteToUpdate.isDeleted,
    };

    notes = notes.map((n) => (n.uid === noteId ? { ...newNote } : n));

    const notificationPayload = {
      title: "Note Updated",
      body: `${title} was updated.`,
      url: `${FRONTEND_URL}/notes`,
      tag: "update-note",
    };

    subscriptions.forEach((subscription) => {
      sendPushNotification(subscription, notificationPayload);
    });

    io.emit("note-update", { action: "update", note: newNote });

    res.status(200).json({
      success: true,
      data: newNote,
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// DELETE: Delete a note by uid
router.delete("/notes/:uid", (req: Request, res: Response) => {
  try {
    const noteId = req.params.uid;

    if (!noteId) {
      return res
        .status(400)
        .json({ success: false, message: "Note ID is required." });
    }

    const noteToUpdate = notes.find((note) => note.uid === noteId);

    if (!noteToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found." });
    }

    noteToUpdate.isDeleted = true;
    noteToUpdate.updatedAt = new Date().toISOString();

    const notificationPayload = {
      title: "Note Deleted",
      body: `${noteToUpdate.title} was deleted.`,
      url: `${FRONTEND_URL}/notes`,
      tag: "delete-note",
    };

    subscriptions.forEach((subscription) => {
      sendPushNotification(subscription, notificationPayload);
    });

    io.emit("note-update", { action: "delete", note: noteToUpdate });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

export default router;
