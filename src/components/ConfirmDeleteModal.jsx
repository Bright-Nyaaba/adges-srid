import React, { useEffect } from 'react';

/**
 * High-reliability in-app deletion confirmation modal.
 * Replaces native window.confirm() which can fail or get silently blocked in iframe/sandboxed environments.
 */
export default function ConfirmDeleteModal({
  open,
  title = 'Confirm Deletion',
  itemName = '',
  itemDetail = '',
  confirmMessage,
  confirmLabel = 'Delete Permanently',
  isDeleting = false,
  onConfirm,
  onClose
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, isDeleting, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay open"
      style={{
        zIndex: 99999,
        background: 'rgba(5, 20, 12, 0.75)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        className="modal-box"
        style={{
          maxWidth: 440,
          width: '100%',
          borderRadius: 12,
          padding: '24px 22px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          background: 'var(--paper, #ffffff)',
          color: 'var(--ink-900, #18231c)'
        }}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              flexShrink: 0
            }}
          >
            🗑
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-900, #18231c)' }}>
              {title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '.86rem', color: 'var(--ink-500, #5c6b61)' }}>
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--alt-bg, #f4f7f4)',
            border: '1px solid var(--line, #e1e7e2)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 18
          }}
        >
          {itemName && (
            <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink-900, #18231c)' }}>
              {itemName}
            </div>
          )}
          {itemDetail && (
            <div style={{ fontSize: '.82rem', color: 'var(--ink-500, #5c6b61)', marginTop: 2 }}>
              {itemDetail}
            </div>
          )}
          <div style={{ fontSize: '.84rem', color: 'var(--ink-700, #2c3e32)', marginTop: itemName ? 8 : 0 }}>
            {confirmMessage || 'Are you sure you want to permanently remove this record from the website directory and cloud storage?'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{ minWidth: 90 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{ minWidth: 140, fontWeight: 700 }}
          >
            {isDeleting ? '⏳ Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
