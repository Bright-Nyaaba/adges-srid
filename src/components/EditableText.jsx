import React, { useState, useEffect, useRef } from 'react';
import { updateDocPath, setDocMerge, formatAdminErrorMessage } from '../lib/db.js';

/**
 * Utility to construct payload for Firestore containing both
 * the dot-notation key (e.g. 'hero.eyebrow') AND the nested object ({ hero: { eyebrow } })
 */
export function buildTextPayload(field, val) {
  const payload = { [field]: val };
  const parts = field.split('.');
  if (parts.length > 1) {
    let curr = payload;
    for (let i = 0; i < parts.length - 1; i++) {
      curr[parts[i]] = curr[parts[i]] || {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = val;
  }
  return payload;
}

/**
 * Cache text update to localStorage so it is instantly available across reloads and offline
 */
export function cacheTextLocally(field, val) {
  try {
    const raw = localStorage.getItem('adges_site_content_cache') || '{}';
    const cache = JSON.parse(raw);
    cache[field] = val;
    const parts = field.split('.');
    if (parts.length > 1) {
      let curr = cache;
      for (let i = 0; i < parts.length - 1; i++) {
        curr[parts[i]] = curr[parts[i]] || {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = val;
    }
    localStorage.setItem('adges_site_content_cache', JSON.stringify(cache));
  } catch (err) {
    console.warn('[editable-text] local cache error', err);
  }
}

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
  placeholder = 'Click to edit...',
  showLabel = true,
  buttonLabel = '✎ Edit',
  onSave
}) {
  const [localSaved, setLocalSaved] = useState(undefined);
  const displayValue = localSaved !== undefined
    ? localSaved
    : (text !== undefined && text !== null && text !== '' ? text : defaultValue);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const successTimerRef = useRef(null);

  useEffect(() => {
    if (!editing) {
      setDraft(displayValue);
    }
  }, [displayValue, editing]);

  useEffect(() => {
    if (text !== undefined && text !== null && localSaved !== undefined && text === localSaved) {
      setLocalSaved(undefined);
    }
  }, [text, localSaved]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const Tag = as;
  const isMulti = multiline !== undefined ? multiline : (as === 'p' || (displayValue && displayValue.length > 70));

  async function save() {
    if (saving) return;
    setSaving(true);
    setError('');
    const trimmed = draft.trim();

    // 1. Optimistic instant local update
    setLocalSaved(trimmed);
    cacheTextLocally(field, trimmed);

    if (onSave) {
      try { onSave(field, trimmed); } catch {}
    }

    // Dispatch global event for App.jsx and listening components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adges-text-update', {
        detail: { field, value: trimmed, doc }
      }));
    }

    // 2. Persist to Firestore: build payload with both flat dotted key and nested map
    const payload = buildTextPayload(field, trimmed);

    try {
      await setDocMerge(doc, payload);
    } catch (e) {
      try {
        await updateDocPath(doc, payload);
      } catch (e2) {
        const failureReason = formatAdminErrorMessage(e2, `save content for "${field}"`);
        console.error(`[admin:EditableText] Cloud save failed for field "${field}":`, {
          field,
          docPath: doc,
          payload,
          draftValue: trimmed,
          errorCode: e2?.code,
          errorMessage: e2?.message,
          error: e2,
          stack: e2?.stack,
          timestamp: new Date().toISOString()
        });
        setError(failureReason);
        setSaving(false);
        // Retain editing mode so user can see error and retry
        return;
      }
    }

    setSaving(false);
    setEditing(false);
    setSaveSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSaveSuccess(false), 2500);
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
        {error && (
          <div className="edit-error-banner" role="alert">
            <div className="edit-error-header">
              <span className="edit-error-icon">⚠️</span>
              <strong>Error saving changes:</strong>
            </div>
            <div className="edit-error-body">{error}</div>
            <div className="edit-error-actions">
              <button
                type="button"
                className="edit-retry-btn"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Retrying…' : '↻ Retry Save'}
              </button>
              <button
                type="button"
                className="edit-dismiss-btn"
                onClick={() => setError('')}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`editable-text ${isEditor ? 'is-editable-hover' : ''} ${saveSuccess ? 'save-success-flash' : ''}`}
      style={style}
    >
      {showLabel && (
        <Tag
          className={className}
          onClick={isEditor ? () => { setDraft(displayValue); setEditing(true); } : undefined}
        >
          {displayValue || <span className="editable-placeholder">{placeholder}</span>}
        </Tag>
      )}
      {isEditor && (
        <button
          type="button"
          className="edit-pencil editor-only"
          onClick={(e) => {
            e.stopPropagation();
            setDraft(displayValue);
            setEditing(true);
          }}
          title={`Click to edit ${field}`}
        >
          {buttonLabel}
        </button>
      )}
      {saveSuccess && (
        <span className="edit-saved-badge editor-only" title="Saved successfully">
          ✓ Saved
        </span>
      )}
      {error && !editing && (
        <span
          className="edit-error-badge editor-only"
          title={`Sync failed: ${error}. Click to reopen editor.`}
          onClick={() => { setDraft(displayValue); setEditing(true); }}
        >
          ⚠️ Sync failed: {error}
        </span>
      )}
    </div>
  );
}
