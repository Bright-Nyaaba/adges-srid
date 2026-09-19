import React from 'react';

/** Generic centered modal overlay, closes on backdrop click or the × button. */
export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box" style={wide ? { maxWidth: 640 } : undefined}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        {title ? <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
