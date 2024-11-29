import { Note } from "lib/types";

const NoteItem = ({ note }: { note: Note }) => {
  return (
    <div>
      <h5>{note.title}</h5>
      <p>{note.content}</p>
      <span className="text-red-500">{note.syncStatus}</span>
      <div>{note.createdAt}</div>
      <div>{note.updatedAt}</div>
      <div>ID:{note.id}</div>
      <div>uid: {note.uid}</div>
    </div>
  );
};

export default NoteItem;
