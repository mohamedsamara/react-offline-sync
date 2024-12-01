import { Note, NoteSyncStatus } from "lib/types";

import { openDB, DBSchema } from "idb";

interface NotesDB extends DBSchema {
  notes: {
    key: string;
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
        keyPath: "uid",
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

export const dbAddNote = async (note: Note) => {
  const { store, tx } = await getNotesDatabase();
  const id = await store.add(note);
  await tx.done;
  return { ...note, id };
};

export const dbUpdateNoteStatus = async (
  uid: string,
  status: NoteSyncStatus
) => {
  const { store, tx } = await getNotesDatabase();
  const note = await store.get(uid);
  if (!note) return;
  note.syncStatus = status;
  await store.put(note);
  await tx.done;
};

export const dbDeleteNote = async (uid: string) => {
  const { store, tx } = await getNotesDatabase();
  await store.delete(uid);
  await tx.done;
};

export const dbUpdateNote = async (note: Note) => {
  const { store, tx } = await getNotesDatabase();
  await store.put(note);
  await tx.done;
};
