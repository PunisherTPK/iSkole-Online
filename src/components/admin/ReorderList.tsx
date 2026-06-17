"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/admin/AdminForms";

type ReorderItem = {
  id: string;
  label: string;
  description?: string;
};

export function ReorderList({ items, action }: { items: ReorderItem[]; action: (formData: FormData) => Promise<void> }) {
  const [ordered, setOrdered] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function move(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const dragged = ordered.find((item) => item.id === draggedId);
    if (!dragged) return;
    const withoutDragged = ordered.filter((item) => item.id !== draggedId);
    const targetIndex = withoutDragged.findIndex((item) => item.id === targetId);
    setOrdered([...withoutDragged.slice(0, targetIndex), dragged, ...withoutDragged.slice(targetIndex)]);
  }

  if (!items.length) return null;

  return (
    <form action={action} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="ordered_ids" value={ordered.map((item) => item.id).join(",")} />
      <h2 className="text-xl font-bold text-slate-950">Drag to Reorder</h2>
      <div className="mt-4 grid gap-2">
        {ordered.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggedId(item.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => move(item.id)}
            className="cursor-grab rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3"
          >
            <p className="text-sm font-bold text-slate-950">{index + 1}. {item.label}</p>
            {item.description ? <p className="mt-1 text-xs text-slate-500">{item.description}</p> : null}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <SubmitButton>Save Order</SubmitButton>
      </div>
    </form>
  );
}
