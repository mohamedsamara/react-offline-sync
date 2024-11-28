import { Note, NoteSyncStatus } from "lib/types";
import { NoteFormValues } from "lib/validations";

import { openDB, DBSchema } from "idb";

interface NotesDB extends DBSchema {
  notes: {
    key: number;
    value: Note;
    indexes: {
      "by-date": string;
      "by-status": string;
    };
  };
}

const DB_NAME = "notes-app";
export const NOTES_DB_STORE_NAME = "notes";
export const CONFLICTS_DB_STORE_NAME = "conflicts";

export const openNotesDatabase = async () => {
  return openDB<NotesDB>(DB_NAME, 1, {
    upgrade(db) {
      // Notes Store
      const notesStore = db.createObjectStore(NOTES_DB_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
      notesStore.createIndex("by-date", "updatedAt");
      notesStore.createIndex("by-status", "syncStatus");
    },
  });
};

const getNotesDatabase = async () => {
  const db = await openNotesDatabase();
  const tx = db.transaction(NOTES_DB_STORE_NAME, "readwrite");
  const store = tx.objectStore(NOTES_DB_STORE_NAME);
  return { store, tx };
};

/* Starting db functions */
export const dbGetNotes = async () => {
  const { store, tx } = await getNotesDatabase();
  const notes = await store.getAll();
  await tx.done;
  return notes;
};

export const dbGetNotesByStatus = async (status: NoteSyncStatus) => {
  const { store, tx } = await getNotesDatabase();
  const notesToSync = await store.getAll();
  const notes = notesToSync.filter((note) => note.syncStatus === status);
  tx.done;
  return notes;
};

export const dbAddNote = async (note: NoteFormValues) => {
  const { store, tx } = await getNotesDatabase();
  const newNote = {
    ...note,
    // Add default properties
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    syncStatus: "NONE",
  } as Note;
  const id = await store.add(newNote);
  await tx.done;
  return { ...newNote, id };
};

export const dbBatchAddNotes = async (notes: Note[]) => {
  const { store, tx } = await getNotesDatabase();
  await store.clear();
  await Promise.all(
    notes.map((note) => {
      return store.add(note);
    })
  );
  await tx.done;
};

export const dbUpdateNoteStatus = async (
  id: number,
  status: NoteSyncStatus
) => {
  const { store, tx } = await getNotesDatabase();
  const note = await store.get(id);
  if (!note) return;
  note.syncStatus = status;
  store.put(note);
  await tx.done;
};

export const dbDeleteNote = async (id: number) => {
  const { store, tx } = await getNotesDatabase();
  store.delete(id);
  await tx.done;
};

export const dbUpdateNote = async (note: Note) => {
  const { store, tx } = await getNotesDatabase();
  await store.put(note);
  await tx.done;
};
