import { Badge } from "flowbite-react";

import { Note } from "lib/types";
import { formatDateTimeString } from "lib/utils";

const NoteItem = ({ note }: { note: Note }) => {
  const createdAt = formatDateTimeString(note.createdAt);
  const updatedAt = formatDateTimeString(note.updatedAt);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-900">{note.title}</h4>
        <Badge color="info">{note.syncStatus}</Badge>
      </div>
      <div className="space-y-2 text-slate-600">
        <p>{note.content}</p>
        <div>
          <span className="text-slate-900">{`uid `}</span>({note.uid})
        </div>
        <div>
          <span className="text-slate-900">{`Created at `}</span>({createdAt})
        </div>
        <div>
          <span className="text-slate-900">{`Updated at `}</span>({updatedAt})
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
