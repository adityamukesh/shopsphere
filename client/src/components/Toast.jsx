export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <span className="toast-icon">✓</span>
      <span>{message}</span>
    </div>
  );
}
