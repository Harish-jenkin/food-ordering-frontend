export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-2 text-stone-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
