import { AlertTriangle, X } from "lucide-react";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) {
    return null;
  }

  return (
    <div className="no-print flex items-start gap-3 rounded-sm border border-pass-600/40 bg-pass-50 p-4 text-pass-700">
      <AlertTriangle className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        className="rounded-sm p-1 transition hover:bg-pass-100"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}