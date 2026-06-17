"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/admin/AdminForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Drag to Reorder</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <input type="hidden" name="ordered_ids" value={ordered.map((item) => item.id).join(",")} />
          <div className="grid gap-2">
            {ordered.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => move(item.id)}
                className="flex cursor-grab items-start gap-3 rounded-xl border border-dashed border-border bg-muted/5 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5 active:cursor-grabbing"
              >
                <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {index + 1}. {item.label}
                  </p>
                  {item.description ? <p className="mt-1 text-xs text-muted-foreground">{item.description}</p> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <SubmitButton>Save Order</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
