import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import webpush from "web-push";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL;

interface Note {
  id: number;
  uid: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

type Subscription = webpush.PushSubscription;

interface NotificationPayload {
  title: string;
  body: string;
  tag: string;
  icon?: string;
}

// In-memory notes store (this could later be replaced with a database like MongoDB)
let notes: Note[] = [];
// In-memory subscriptions store
let subscriptions: Subscription[] = [];

webpush.setVapidDetails(
  "mailto:example@yourdomain.com",
  process.env.VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
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
    res.status(500).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
});

// GET: Get all notes
app.get("/api/notes", (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
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
    res.status(500).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
});

// POST: Add a new note
app.post("/api/notes", (req: Request, res: Response) => {
  try {
    const { id, title, content, synced, createdAt, updatedAt } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required." });
    }

    const newNote = {
      uid: uuidv4(),
      id,
      title,
      content,
      createdAt,
      updatedAt,
      synced,
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

    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
});

// PUT: Update a note by uid
app.put("/api/notes/:uid", (req: Request, res: Response) => {
  try {
    const noteId = req.params.uid;
    const updatedNote = req.body;

    if (!noteId) {
      return res
        .status(400)
        .json({ success: false, message: "Note ID is required." });
    }

    if (!updatedNote || typeof updatedNote !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid note data provided.",
      });
    }

    const noteToUpdate = notes.find((note) => note.uid === noteId);

    if (!noteToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found." });
    }

    notes = notes.map((n) => (n.uid === noteId ? { ...n, ...updatedNote } : n));

    const notificationPayload = {
      title: "Note Updated",
      body: `${updatedNote.title} was updated.`,
      url: `${FRONTEND_URL}/notes`,
      tag: "update-note",
    };

    subscriptions.forEach((subscription) => {
      sendPushNotification(subscription, notificationPayload);
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
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

    const notificationPayload = {
      title: "Note Deleted",
      body: `${noteToUpdate.title} was deleted.`,
      url: `${FRONTEND_URL}/notes`,
      tag: "delete-note",
    };

    subscriptions.forEach((subscription) => {
      sendPushNotification(subscription, notificationPayload);
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
