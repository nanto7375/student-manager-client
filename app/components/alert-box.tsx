export default function AlertBox({isOpen, onClose, title, message, onConfirm, onCancel}: {isOpen: boolean, onClose: () => void, title: string, message: string, onConfirm: () => void, onCancel: () => void}) {
  if (!isOpen) return null;
  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}