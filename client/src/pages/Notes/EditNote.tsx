import { Button, Modal, TextInput, Textarea, Label } from "flowbite-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { NoteFormValues, noteSchema } from "lib/validations";
import { Note } from "lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  note: Note;
  onEditSubmit: (note: Note) => void;
};

const EditNote = ({ note, open, onClose, onEditSubmit }: Props) => {
  const { handleSubmit, control, formState } = useForm<NoteFormValues>({
    mode: "onChange",
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note.title,
      content: note.content,
    },
  });
  const { errors, isValid, isDirty, isSubmitting } = formState;

  const onSubmit = async (data: NoteFormValues) => {
    onEditSubmit({
      ...note,
      title: data.title,
      content: data.content,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Modal dismissible show={open} onClose={onClose}>
      <Modal.Header> Edit Note</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
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
              Save
            </Button>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditNote;
