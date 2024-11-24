import { openDB, DBSchema } from "idb";

import { Note } from "lib/types";
import { NoteFormData } from "lib/validations";

// Define the schema for the IndexedDB
interface NotesDB extends DBSchema {
  notes: {
    key: number;
    value: {
      id: number;
      title: string;
      content: string;
      date: string;
    };
    indexes: { "by-date": string };
  };
}

const dbName = "notes-db";
const storeName = "notes";

// Open the IndexedDB database
const openDatabase = async () => {
  return openDB<NotesDB>(dbName, 1, {
    upgrade(db) {
      const store = db.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("by-date", "date");
    },
  });
};

export const addNote = async (note: NoteFormData): Promise<Note> => {
  const db = await openDatabase();
  const newNote = { ...note, date: new Date().toISOString() };
  const id = await db.add(storeName, newNote as any);
  return { id, ...newNote };
};
export const getNotes = async (): Promise<Note[]> => {
  const db = await openDatabase();
  return db.getAll(storeName);
};

export const deleteNote = async (id: number): Promise<void> => {
  const db = await openDatabase();
  await db.delete(storeName, id);
};
