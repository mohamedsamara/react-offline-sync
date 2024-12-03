import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, Textarea, Button, Card, Label, HR } from "flowbite-react";
import { MdOutlineArrowBack } from "react-icons/md";

import { NoteFormValues, noteSchema } from "lib/validations";
import { Note } from "lib/types";
import { useNotes } from "lib/hooks";
import EditNote from "./EditNote";
import PushNotification from "./PushNotification";
import NoteItem from "./NoteItem";

const Notes = () => {
  const navigate = useNavigate();
  const { notes, addNote, deleteNote, updateNote } = useNotes();

  const [editNoteModal, setEditNoteModal] = useState<{
    isOpen: boolean;
    note: Note | null;
  }>({ isOpen: false, note: null });

  const { handleSubmit, control, formState, reset } = useForm<NoteFormValues>({
    mode: "onChange",
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  const { errors, isValid, isDirty, isSubmitting } = formState;

  const onSubmit = async (data: NoteFormValues) => {
    await addNote(data);
    reset();
  };

  const onEditNoteModalClose = () =>
    setEditNoteModal({ isOpen: false, note: null });

  const onEditSubmit = async (note: Note) => {
    await updateNote(note);
    onEditNoteModalClose();
  };

  return (
    <>
      <main className="flex flex-col h-screen overflow-auto">
        <div className="p-4">
          <Button
            color="gray"
            onClick={() => navigate("/")}
            aria-label="Go back"
          >
            <MdOutlineArrowBack className="w-5 h-5" />
          </Button>
        </div>
        <div className="container p-4 mx-auto my-8">
          <Card>
            <div className="flex items-center justify-between">
              <h3>Add Note</h3>
              <PushNotification />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      id="title"
                      type="text"
                      {...field}
                      color={errors.title ? "failure" : "primary"}
                      placeholder="Enter the title"
                    />
                  )}
                />
                {errors.title && (
                  <span className="text-sm text-red-500">
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="content"
                      {...field}
                      color={errors.content ? "failure" : "primary"}
                      placeholder="Enter your note content"
                      rows={4}
                    />
                  )}
                />
                {errors.content && (
                  <span className="text-sm text-red-500">
                    {errors.content.message}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValid || !isDirty || isSubmitting}
                isProcessing={isSubmitting}
              >
                Add Note
              </Button>
            </form>
          </Card>
          <div className="mt-8">
            <h3 className="mb-2">Notes</h3>
            {notes.length > 0 ? (
              <ul className="space-y-4">
                {notes.map((note) => (
                  <li
                    key={note.uid}
                    className="p-4 border rounded-lg shadow-sm"
                  >
                    <NoteItem note={note} />
                    <HR />
                    <div className="flex justify-end">
                      <Button
                        color="warning"
                        onClick={() => setEditNoteModal({ isOpen: true, note })}
                      >
                        Edit
                      </Button>
                      <Button
                        color="failure"
                        onClick={() => deleteNote(note)}
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600">No notes found.</p>
            )}
          </div>
        </div>
      </main>
      {editNoteModal.note && (
        <EditNote
          note={editNoteModal.note}
          open={editNoteModal.isOpen}
          onEditSubmit={onEditSubmit}
          onClose={onEditNoteModalClose}
        />
      )}
    </>
  );
};

export default Notes;
