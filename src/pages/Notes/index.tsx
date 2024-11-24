import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, Textarea, Button, Card, Label } from "flowbite-react";

import { Note } from "lib/types";
import { addNote, getNotes, deleteNote } from "lib/db";
import { NoteFormData, noteSchema } from "lib/validations";

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const { handleSubmit, control, formState, reset } = useForm<NoteFormData>({
    mode: "onChange",
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const { errors, isValid, isDirty, isSubmitting } = formState;

  const fetchNotes = async () => {
    const notesFromDB = await getNotes();
    const reversedNotes = notesFromDB.reverse();
    setNotes(reversedNotes);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const onSubmit = async (data: NoteFormData) => {
    await addNote(data);
    reset();
    fetchNotes();
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    fetchNotes();
  };

  return (
    <main className="h-screen flex flex-col overflow-auto">
      <div className="container mx-auto my-8 p-4">
        <Card>
          <h1 className="text-xl font-semibold">Offline Notes App</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
          <h2 className="text-lg font-medium">Notes:</h2>
          {notes.length > 0 ? (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li key={note.id} className="p-4 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <p>{note.content}</p>
                  <div className="flex justify-end mt-2">
                    <Button
                      color="failure"
                      onClick={() => handleDeleteNote(note.id)}
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
  );
};

export default Notes;
