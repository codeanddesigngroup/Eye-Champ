"use client";

import { Trash2, X } from "lucide-react";
import "./DeleteConfirmDialog.css";

type DeleteConfirmDialogProps = {
  open: boolean;
  count: number;
  singular: string;
  plural: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmDialog({ open, count, singular, plural, deleting, onCancel, onConfirm }: DeleteConfirmDialogProps) {
  if (!open) return null;

  const label = count === 1 ? singular : plural;

  return <div className="admin-delete-backdrop" onMouseDown={() => !deleting && onCancel()}>
    <section className="admin-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="admin-delete-title" onMouseDown={event => event.stopPropagation()}>
      <button className="admin-delete-close" type="button" onClick={onCancel} disabled={deleting} aria-label="Close confirmation"><X size={17} /></button>
      <span className="admin-delete-icon"><Trash2 size={22} /></span>
      <h2 id="admin-delete-title">Delete {count} {label}?</h2>
      <p>This action permanently removes the selected {label} from the database and cannot be undone.</p>
      <footer>
        <button type="button" onClick={onCancel} disabled={deleting}>Cancel</button>
        <button className="danger" type="button" onClick={onConfirm} disabled={deleting}>{deleting ? "Deleting..." : "Delete permanently"}</button>
      </footer>
    </section>
  </div>;
}
