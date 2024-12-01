import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import webpush from "web-push";
import { z } from "zod";
import http from "http";
import { Server } from "socket.io";

import { handleApiError } from "./utils";
import {
  PORT,
  ALLOWED_ORIGINS,
  FRONTEND_URL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
} from "./constants";
import {
  Note,
  Subscription,
  NotificationPayload,
  CreateNoteRequest,
  UpdateNoteRequest,
  createNoteSchema,
  updateNoteSchema,
} from "./types";

const app = express();

app.use(cors());
app.use(express.json());

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Setup CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A client connected to the Socket.IO server.");
  socket.on("disconnect", () => {
    console.log("A client disconnected.");
  });
});

// In-memory notes store (this could later be replaced with a database like MongoDB)
let notes: Note[] = [];
// In-memory subscriptions store
let subscriptions: Subscription[] = [];

webpush.setVapidDetails(
  "mailto:example@yourdomain.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

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
app.post("/api/subscribe", (req: Request, res: Response) => {
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
app.post("/api/unsubscribe", async (req: Request, res: Response) => {
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
app.get("/api/notes", (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: notes });
  } catch (error) {
    handleApiError(error, res);
  }
});

// GET: Get a note by uid
app.get("/api/notes/:uid", (req: Request, res: Response) => {
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
app.post("/api/notes", (req: Request, res: Response) => {
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
app.put("/api/notes/:uid", (req: Request, res: Response) => {
  try {
    const validatedBody: UpdateNoteRequest = updateNoteSchema.parse(req.body);

    const { title, content, updatedAt } = validatedBody;

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
app.delete("/api/notes/:uid", (req: Request, res: Response) => {
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

// Middleware for other routes and error handling...
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unexpected error occurred:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
