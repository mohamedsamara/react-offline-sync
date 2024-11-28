import { useState, useEffect } from "react";

import {
  dbAddNote,
  dbGetNotes,
  dbUpdateNote,
  dbDeleteNote,
  dbUpdateNoteStatus,
} from "lib/db";
import { createNote, deleteNote, updateNote } from "lib/api";
import { triggerSyncTask } from "lib/sync";
import { Note } from "lib/types";
import { NoteFormValues } from "lib/validations";
import { SYNC_NOTES } from "lib/constants";
import { useOnlineStatus } from "lib/hooks";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const isOnline = useOnlineStatus();

  const refreshNotes = async () => {
    const dbNotes = await dbGetNotes();
    const formattedNotes = dbNotes.filter((n) => !n.isDeleted);
    setNotes(formattedNotes);
  };

  useEffect(() => {
    refreshNotes();
    const interval = setInterval(refreshNotes, 5000);
    return () => clearInterval(interval);
  }, []);

  // SYNC_COMPLETE Listener
  useEffect(() => {
    const syncMessageListener = (event: MessageEvent) => {
      if (event.data && event.data.action === SYNC_NOTES.SYNC_COMPLETE)
        refreshNotes();
    };
    navigator.serviceWorker.addEventListener("message", syncMessageListener);
    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        syncMessageListener
      );
    };
  }, []);

  const handleAddNote = async (payload: NoteFormValues) => {
    try {
      const note = await dbAddNote(payload);
      let newNote: Note = { ...note };

      if (isOnline) {
        // Add remote note
        const response = await createNote(note);
        const serverNote = response.data;

        newNote = {
          ...newNote,
          uid: serverNote.uid,
          updatedAt: new Date().toISOString(),
        };
        // Update note with server generated uid
        await dbUpdateNote(newNote);
      } else {
        await dbUpdateNoteStatus(note.id, "NEW");
        triggerSyncTask(SYNC_NOTES.NEW);
      }

      setNotes((prevNotes) => [newNote, ...prevNotes]);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleUpdateNote = async (note: Note) => {
    try {
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === note.id ? { ...note } : n))
      );

      // Update local note
      await dbUpdateNote(note);

      if (isOnline) {
        await updateNote(note);
      } else {
        // Don't trigger sync for new notes
        if (note.syncStatus === "NEW") return;
        await dbUpdateNoteStatus(note.id, "UPDATED");
        triggerSyncTask(SYNC_NOTES.UPDATED);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    try {
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== note.id));

      // Update note isDeleted flag
      await dbUpdateNote({ ...note, isDeleted: true });

      if (isOnline) {
        // Delete from server
        await deleteNote(note.uid);
      } else {
        if (note.syncStatus === "NEW") {
          // Delete note completely if NEW
          await dbDeleteNote(note.id);
          return;
        }
        await dbUpdateNoteStatus(note.id, "DELETED");
        triggerSyncTask(SYNC_NOTES.DELETED);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return {
    notes,
    addNote: handleAddNote,
    deleteNote: handleDeleteNote,
    updateNote: handleUpdateNote,
  };
};
