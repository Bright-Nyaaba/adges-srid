import React, { useState, useEffect } from 'react';
import { updateDocPath, setDocMerge } from '../lib/db.js';

/**
 * WordPress-style inline text editor.
 * Allows site admins to click and edit any words, letters, headings, and paragraphs directly.
 */
export default function EditableText({
  text,
  defaultValue = '',
  field,
  doc = 'site/content',
  isEditor = false,
  as = 'p',
  className = '',
  style = {},
  multiline,
  placeholder = 'Click to edit...'
}) {
  const displayValue = text !== undefined && text !== null && text !== '' ? text : defaultValue;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) {
      setDraft(displayValue);
    }
  }, [displayValue, editing]);

  const Tag = as;
  const isMulti = multiline !== undefined ? multiline : (as === 'p' || (displayValue && displayValue.length > 70));

  async function save() {
    if (saving) return;
    setSaving(true);
    setError('');
    const trimmed = draft.trim();
    try {
      await updateDocPath(doc, { [field]: trimmed });
    } catch (e) {
      try {
        await setDocMerge(doc, { [field]: trimmed });
      } catch (e2) {
        console.error('[editable-text] save error', e2);
        setError('Failed to save');
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setDraft(displayValue);
      setEditing(false);
    } else if (e.key === 'Enter' && (!isMulti || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      save();
    }
  }

  if (editing) {
    return (
      <div className={`editable-text editing-active ${className}`}>
        {isMulti ? (
          <textarea
            autoFocus
            className="editable-input multiline"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={Math.max(2, Math.min(8, Math.ceil((draft || '').length / 45)))}
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            autoFocus
            className="editable-input singleline"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        )}
        <div className="edit-save-row">
          <button
            type="button"
            className="edit-save-btn"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : '✓ Save'}
          </button>
          <button
            type="button"
            className="edit-cancel-btn"
            onClick={() => {
              setDraft(displayValue);
              setEditing(false);
            }}
          >
            Cancel
          </button>
          {defaultValue && draft !== defaultValue && (
            <button
              type="button"
              className="edit-reset-btn"
              onClick={() => setDraft(defaultValue)}
              title="Reset to default text"
            >
              ↺ Reset
            </button>
          )}
          <span className="edit-hint-key">{isMulti ? 'Ctrl+Enter to save' : 'Enter to save'}</span>
        </div>
        {error && <span className="edit-error-msg">{error}</span>}
      </div>
    );
  }

  return (
    <div
      className={`editable-text ${isEditor ? 'is-editable-hover' : ''}`}
      style={style}
    >
      <Tag
        className={className}
        onClick={isEditor ? () => { setDraft(displayValue); setEditing(true); } : undefined}
      >
        {displayValue || <span className="editable-placeholder">{placeholder}</span>}
      </Tag>
      {isEditor && (
        <button
          type="button"
          className="edit-pencil editor-only"
          onClick={(e) => {
            e.stopPropagation();
            setDraft(displayValue);
            setEditing(true);
          }}
          title="Click to edit words in WordPress mode"
        >
          ✎ Edit
        </button>
      )}
    </div>
  );
}
