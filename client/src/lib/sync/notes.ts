import {
  dbAddNote,
  dbGetNotes,
  dbGetNotesByStatus,
  dbUpdateNote,
} from "lib/db";
import {
  createNote,
  deleteNote,
  fetchNote,
  fetchNotes,
  updateNote,
} from "lib/api";

// Sync added notes
export const syncAddedNotes = async () => {
  const notesToAdd = await dbGetNotesByStatus("NEW");
  if (notesToAdd.length === 0) return;
  for (const localNote of notesToAdd) {
    try {
      await createNote(localNote);
      await dbUpdateNote({
        ...localNote,
        syncStatus: "SYNCED",
      });
    } catch (error) {
      console.error("Sync failed for note", localNote);
    }
  }
};

// Sync updated notes
export const syncUpdatedNotes = async () => {
  const notesToSync = await dbGetNotesByStatus("UPDATED");

  for (const localNote of notesToSync) {
    try {
      const response = await fetchNote(localNote.uid);
      const serverNote = response.data;

      if (serverNote) {
        if (serverNote.updatedAt > localNote.updatedAt) {
          // Server has the latest version, overwrite local
          await dbUpdateNote({
            ...serverNote,
            syncStatus: "SYNCED",
          });
        } else {
          // No change detected between local and server. Resume user update action
          await updateNote(localNote);
          await dbUpdateNote({
            ...localNote,
            syncStatus: "SYNCED",
          });
        }
      } else {
        // No change detected between local and server. Resume user update action
        await updateNote(localNote);
        await dbUpdateNote({
          ...localNote,
          syncStatus: "SYNCED",
        });
      }
    } catch (error) {
      console.error("Sync failed for updated note", error);
    }
  }
};

// Sync deleted notes
export const syncDeletedNotes = async () => {
  const notesToDelete = await dbGetNotesByStatus("DELETED");

  for (const localNote of notesToDelete) {
    try {
      const response = await fetchNote(localNote.uid);
      const serverNote = response.data;

      if (serverNote) {
        if (serverNote.updatedAt > localNote.updatedAt) {
          // Server has the latest version, overwrite local
          if (serverNote.isDeleted) {
            // Server already deleted the note, delete local note
            await dbUpdateNote({
              ...serverNote,
              syncStatus: "SYNCED",
            });
          } else {
            // Server note is not deleted but has a more recent update. Recover local note
            await dbUpdateNote({
              ...serverNote,
              isDeleted: false,
              syncStatus: "SYNCED",
            });
          }
        } else {
          // No change detected between local and server. Resume user delete action
          await deleteNote(localNote.uid);
          await dbUpdateNote({
            ...localNote,
            syncStatus: "SYNCED",
          });
        }
      } else {
        // Server doesn't have this note, so keep the deletion locally
        await dbUpdateNote({
          ...localNote,
          syncStatus: "SYNCED",
        });
      }
    } catch (error) {
      console.error("Sync failed for deleted note", error);
    }
  }
};

export const syncNotes = async () => {
  const localNotes = await dbGetNotes();
  const localNoteMap = new Map(localNotes.map((note) => [note.uid, note]));

  const response = await fetchNotes();
  const serverNotes = response.data;

  const notesToAdd = serverNotes.filter(
    (serverNote) => !localNoteMap.has(serverNote.uid)
  );

  if (notesToAdd.length > 0) {
    for (const note of notesToAdd) {
      await dbAddNote({ ...note, syncStatus: "NONE" });
    }
  }

  const notesToUpdate = serverNotes.filter((serverNote) => {
    const localNote = localNoteMap.get(serverNote.uid);
    return localNote && serverNote.updatedAt > localNote.updatedAt;
  });

  if (notesToUpdate.length > 0) {
    for (const note of notesToUpdate) {
      await dbUpdateNote({
        ...localNoteMap.get(note.uid),
        ...note,
      });
    }
  }

  const notesToDelete = serverNotes.filter((serverNote) => {
    const localNote = localNoteMap.get(serverNote.uid);
    return localNote && !localNote.isDeleted && serverNote.isDeleted;
  });

  if (notesToDelete.length > 0) {
    for (const note of notesToDelete) {
      await dbUpdateNote({
        ...localNoteMap.get(note.uid),
        ...note,
      });
    }
  }
};
