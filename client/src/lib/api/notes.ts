import { ApiResponse, Note } from "lib/types";
import { API_URL } from "lib/constants";

export const fetchNotes = async (): Promise<ApiResponse<Note[]>> => {
  const response = await fetch(`${API_URL}/notes/`);
  if (!response.ok) {
    throw new Error(`Failed to get notes from server: ${response.statusText}`);
  }
  const result: ApiResponse<Note[]> = await response.json();
  return result;
};

export const fetchNote = async (uid: string): Promise<ApiResponse<Note>> => {
  const response = await fetch(`${API_URL}/notes/${uid}`);
  if (!response.ok) {
    throw new Error("Failed to get note from server");
  }
  const result: ApiResponse<Note> = await response.json();
  return result;
};

export const createNote = async (note: Note): Promise<ApiResponse<Note>> => {
  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error("Failed to add note to server");
  }
  const result: ApiResponse<Note> = await response.json();
  return result;
};

export const updateNote = async (note: Note): Promise<ApiResponse<Note>> => {
  const response = await fetch(`${API_URL}/notes/${note.uid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) throw new Error("Failed to update the note on the server");

  const result: ApiResponse<Note> = await response.json();
  return result;
};

export const deleteNote = async (uid: string): Promise<ApiResponse<Note>> => {
  const response = await fetch(`${API_URL}/notes/${uid}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to delete a note on server");
  }
  const result: ApiResponse<Note> = await response.json();
  return result;
};
