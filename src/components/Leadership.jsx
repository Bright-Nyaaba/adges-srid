import React, { useState } from 'react';
import Modal from './Modal.jsx';
import ConfirmDeleteModal from './ConfirmDeleteModal.jsx';
import EditableText from './EditableText.jsx';
import { addItem, updateItem, deleteItem, setDocMerge } from '../lib/db.js';
import { uploadFile, deleteFile } from '../lib/storage.js';
import { IconSVG } from '../data/icons.jsx';
import { DEFAULT_TEXT, DEFAULT_SITE_SETTINGS } from '../data/defaults.js';

const PALETTE = ['#155232', '#227A48', '#E8B923', '#103F29'];

export default function Leadership({
  leaders = [],
  isEditor,
  text = {},
  siteSettings,
  onOpenCustomizer,
  onDeleteLeader,
  onSaveLeader
}) {
  const [editing, setEditing] = useState(null); // null | {} (new) | leader object
  const [editingPatron, setEditingPatron] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteLeader, setPendingDeleteLeader] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const patron = siteSettings?.cards?.patron || DEFAULT_SITE_SETTINGS.cards.patron;

  async function executeDeleteLeader(leader) {
    if (!leader) return;
    const roleDesc = leader.position ? `"${leader.position}" (${leader.name})` : `"${leader.name}"`;
    const targetKey = leader.id || leader.name;
    setDeletingId(targetKey);
    try {
      if (onDeleteLeader) {
        await onDeleteLeader(leader);
      } else {
        await deleteItem('leaders', leader);
        if (leader.photoPath) deleteFile(leader.photoPath).catch(() => {});
      }
      setFeedback({ type: 'success', msg: `Removed student position ${roleDesc} successfully.` });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Could not delete: ' + (err.message || 'unknown error') });
    } finally {
      setDeletingId(null);
      setPendingDeleteLeader(null);
    }
  }

  return (
    <div className="page active">
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="shell">
          <EditableText
            as="div"
            className="section-kicker"
            text={text['leadership.kicker']}
            defaultValue={DEFAULT_TEXT['leadership.kicker']}
            field="leadership.kicker"
            isEditor={isEditor}
          />
          <EditableText
            as="h2"
            text={text['leadership.heading']}
            defaultValue={DEFAULT_TEXT['leadership.heading']}
            field="leadership.heading"
            isEditor={isEditor}
          />
          <EditableText
            as="p"
            className="section-desc"
            style={{ marginTop: 12, marginBottom: 32 }}
            text={text['leadership.desc']}
            defaultValue={DEFAULT_TEXT['leadership.desc']}
            field="leadership.desc"
            isEditor={isEditor}
          />

          {/* Live Feedback Toast Banner */}
          {feedback && (
            <div
              style={{
                marginBottom: 28,
                padding: '12px 18px',
                borderRadius: 6,
                background: '#0d2818',
                color: '#d1fae5',
                border: '1px solid #10b981',
                fontSize: '.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontWeight: 500
              }}
            >
              <span>✓ {feedback.msg}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                style={{ background: 'none', border: 'none', color: '#d1fae5', cursor: 'pointer', fontSize: '1.1rem', padding: '0 6px' }}
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>
          )}

          {/* ============ FACULTY ADVISOR CARD ============ */}
          <div className="patron-card rel" id="faculty-advisor-card">
            {isEditor && (
              <div className="card-admin-bar">
                <button
                  type="button"
                  className="card-admin-btn"
                  onClick={() => setEditingPatron(true)}
                  title="Edit Faculty Advisor Card Details & Photo"
                  style={{ background: '#2271b1', color: '#fff', fontWeight: 600 }}
                >
                  ✎ Edit Faculty Advisor
                </button>
                <button
                  type="button"
                  className="card-admin-btn"
                  onClick={() => onOpenCustomizer?.('cards')}
                  title="Open WordPress Customizer"
                >
                  WordPress Customizer
                </button>
              </div>
            )}

            {/* Photo / Avatar */}
            <div
              className="patron-photo"
              style={{ background: patron.bg || '#103F29' }}
              title={isEditor ? "Click to change Faculty Advisor photo" : patron.name}
              onClick={() => { if (isEditor) setEditingPatron(true); }}
            >
              {patron.photoUrl ? (
                <img
                  src={patron.photoUrl}
                  alt={patron.name || 'Faculty Advisor'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#F6D766" strokeWidth="1.5" />
                  <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="#F6D766" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {isEditor && (
                <button
                  type="button"
                  className="patron-photo-change-btn editor-only"
                  onClick={(e) => { e.stopPropagation(); setEditingPatron(true); }}
                  title="Change Faculty Advisor Photo"
                >
                  📷 Change Photo
                </button>
              )}
            </div>

            {/* Info / Description */}
            <div>
              <span
                className="patron-tag"
                style={{ cursor: isEditor ? 'pointer' : 'default' }}
                onClick={() => { if (isEditor) setEditingPatron(true); }}
              >
                {patron.title || 'FACULTY ADVISOR'}
              </span>
              
              <h3
                style={{ fontSize: '1.4rem', cursor: isEditor ? 'pointer' : 'default' }}
                onClick={() => { if (isEditor) setEditingPatron(true); }}
              >
                {patron.name || 'Prof. K. Addai-Mensah'}
              </h3>

              {patron.department && (
                <div className="patron-dept">
                  {patron.department}
                </div>
              )}

              <p
                style={{ color: 'var(--ink-500)', marginTop: 8, fontSize: '.92rem', maxWidth: '58ch', lineHeight: 1.6, cursor: isEditor ? 'pointer' : 'default' }}
                onClick={() => { if (isEditor) setEditingPatron(true); }}
              >
                {patron.desc || 'Patron of ADGES and senior lecturer. Oversees the association’s academic and field activities.'}
              </p>

              {(patron.email || patron.office) && (
                <div className="patron-meta">
                  {patron.email && (
                    <span>
                      ✉ <a href={`mailto:${patron.email}`}>{patron.email}</a>
                    </span>
                  )}
                  {patron.office && (
                    <span>
                      📍 {patron.office}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============ STUDENT LEADERS GRID ============ */}
          {isEditor && (
            <div className="admin-toolbar editor-only">
              <button className="admin-add-btn" onClick={() => setEditing({})}>+ Add leader</button>
            </div>
          )}

          <div className="leader-grid">
            {leaders.map((l, idx) => (
              <div className="leader-card rel" key={l.id || l.name || idx}>
                {isEditor && (
                  <div className="card-admin-bar">
                    <button
                      type="button"
                      className="card-admin-btn"
                      onClick={() => setEditing(l)}
                      title={`Edit position: ${l.position || l.name}`}
                      aria-label={`Edit position: ${l.position || l.name}`}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className={`card-admin-btn danger ${deletingId === (l.id || l.name) ? 'is-deleting' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteLeader(l);
                      }}
                      disabled={deletingId === (l.id || l.name)}
                      title={`Delete position: ${l.position || l.name}`}
                      aria-label={`Delete position: ${l.position || l.name}`}
                    >
                      {deletingId === (l.id || l.name) ? '⏳' : '🗑'}
                    </button>
                  </div>
                )}
                <div className="leader-photo" style={{ background: l.bg || '#155232' }}>
                  {l.photoUrl
                    ? <img src={l.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <IconSVG name="person" />}
                </div>
                <div className="leader-info">
                  <h4>{l.name}</h4>
                  <span className="leader-position">{l.position}</span>
                  <div className="leader-level">{l.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In-app Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        open={Boolean(pendingDeleteLeader)}
        title="Delete Student Position"
        itemName={pendingDeleteLeader?.position || pendingDeleteLeader?.name}
        itemDetail={pendingDeleteLeader?.name ? `Current holder: ${pendingDeleteLeader.name} • ${pendingDeleteLeader.level || ''}` : ''}
        confirmMessage="Are you sure you want to permanently remove this student position from the ADGES leadership committee?"
        confirmLabel="Delete Position"
        isDeleting={Boolean(deletingId && pendingDeleteLeader && deletingId === (pendingDeleteLeader.id || pendingDeleteLeader.name))}
        onConfirm={() => executeDeleteLeader(pendingDeleteLeader)}
        onClose={() => setPendingDeleteLeader(null)}
      />

      {/* Leader CRUD Modal */}
      <LeaderFormModal
        item={editing}
        leaderCount={leaders.length}
        onClose={() => setEditing(null)}
        onDelete={onDeleteLeader}
        onSave={onSaveLeader}
      />

      {/* Faculty Advisor Editor Modal */}
      <PatronEditModal
        open={editingPatron}
        patron={patron}
        siteSettings={siteSettings}
        onClose={() => setEditingPatron(false)}
      />
    </div>
  );
}

/**
 * Dedicated Faculty Advisor Card Editor Modal
 */
function PatronEditModal({ open, patron, siteSettings, onClose }) {
  const [title, setTitle] = useState(patron.title || 'FACULTY ADVISOR');
  const [name, setName] = useState(patron.name || 'Prof. K. Addai-Mensah');
  const [department, setDepartment] = useState(patron.department || 'Patron & Senior Lecturer • Department of Geological Engineering');
  const [desc, setDesc] = useState(patron.desc || '');
  const [email, setEmail] = useState(patron.email || '');
  const [office, setOffice] = useState(patron.office || '');
  const [bg, setBg] = useState(patron.bg || '#103F29');
  const [photoUrl, setPhotoUrl] = useState(patron.photoUrl || '');
  const [photoPath, setPhotoPath] = useState(patron.photoPath || '');

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open) {
      setTitle(patron.title || 'FACULTY ADVISOR');
      setName(patron.name || 'Prof. K. Addai-Mensah');
      setDepartment(patron.department || 'Patron & Senior Lecturer • Department of Geological Engineering');
      setDesc(patron.desc || '');
      setEmail(patron.email || '');
      setOffice(patron.office || '');
      setBg(patron.bg || '#103F29');
      setPhotoUrl(patron.photoUrl || '');
      setPhotoPath(patron.photoPath || '');
      setFile(null);
      setPreviewUrl(null);
      setError('');
    }
  }, [open, patron]);

  function handleFileSelect(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Advisor name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let finalPhotoUrl = photoUrl;
      let finalPhotoPath = photoPath;

      if (file) {
        if (photoPath) deleteFile(photoPath).catch(() => {});
        const uploaded = await uploadFile(file, 'patron');
        finalPhotoUrl = uploaded.url;
        finalPhotoPath = uploaded.path || null;
      }

      const updatedPatron = {
        title: title.trim() || 'FACULTY ADVISOR',
        name: name.trim(),
        department: department.trim(),
        desc: desc.trim(),
        email: email.trim(),
        office: office.trim(),
        bg,
        photoUrl: finalPhotoUrl,
        photoPath: finalPhotoPath
      };

      const existingCards = siteSettings?.cards || DEFAULT_SITE_SETTINGS.cards;
      await setDocMerge('site/settings', {
        cards: {
          ...existingCards,
          patron: updatedPatron
        }
      });

      onClose();
    } catch (e) {
      console.error('[patron] save error', e);
      setError('Could not save faculty advisor card: ' + (e.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  function handleRemovePhoto() {
    setFile(null);
    setPreviewUrl(null);
    setPhotoUrl('');
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Faculty Advisor / Patron Card">
      <div className="admin-form">
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: '130px', flexShrink: 0 }}>
            <label>Badge Tag</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="FACULTY ADVISOR"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Advisor Name &amp; Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. K. Addai-Mensah"
              style={{ fontWeight: 600 }}
            />
          </div>
        </div>

        <label>Academic Role / Department</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Patron & Senior Lecturer • Department of Geological Engineering"
        />

        <label>Biography &amp; Oversight Description</label>
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Patron of ADGES and senior lecturer. Oversees the association’s academic and field activities..."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Contact Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="faculty@umat.edu.gh"
            />
          </div>
          <div>
            <label>Office Location (optional)</label>
            <input
              type="text"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              placeholder="SRID Block, Room 204"
            />
          </div>
        </div>

        <div style={{ marginTop: 14, padding: '12px', background: 'var(--paper-dim)', borderRadius: '6px', border: '1px solid var(--line)' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Advisor Portrait / Photo</label>
          
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 6,
                background: bg,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {previewUrl || photoUrl ? (
                <img
                  src={previewUrl || photoUrl}
                  alt="Advisor Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#F6D766" strokeWidth="1.5" />
                  <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="#F6D766" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <input type="file" accept="image/*" onChange={handleFileSelect} style={{ fontSize: '12px' }} />
              {(previewUrl || photoUrl) && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    display: 'inline-block',
                    marginTop: 6,
                    background: 'none',
                    border: 'none',
                    color: '#d63638',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  ✕ Remove photo
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: '12px', margin: 0 }}>Avatar Background Color:</label>
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{bg}</span>
          </div>
        </div>

        <div className="admin-form-actions" style={{ marginTop: 18 }}>
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#2271b1' }}>
            {saving ? 'Saving Faculty Advisor…' : 'Save Faculty Advisor Card'}
          </button>
          <button type="button" className="admin-btn-danger" onClick={onClose} style={{ background: 'none', color: 'var(--ink-700)', borderColor: 'var(--line-strong)' }}>
            Cancel
          </button>
        </div>

        {error && <p className="form-msg error">{error}</p>}
      </div>
    </Modal>
  );
}

function LeaderFormModal({ item, leaderCount, onClose, onDelete, onSave }) {
  const isOpen = item !== null;
  const isEdit = isOpen && (!!item.id || !!item.name || !!item.position);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [level, setLevel] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setName(item.name || '');
      setPosition(item.position || '');
      setLevel(item.level || '');
      setFile(null);
      setPreviewUrl(null);
      setShowConfirmDelete(false);
      setError('');
    }
  }, [item, isOpen]);

  function handleFileSelect(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleSave() {
    if (!name.trim() || !position.trim()) { setError('Name and position are required.'); return; }
    setSaving(true);
    setError('');
    try {
      let photoUrl = isEdit ? (item.photoUrl || '') : '';
      let photoPath = isEdit ? (item.photoPath || null) : null;
      if (file) {
        if (photoPath) deleteFile(photoPath).catch(() => {});
        const uploaded = await uploadFile(file, 'leaders');
        photoUrl = uploaded.url;
        photoPath = uploaded.path || null;
      }
      const data = {
        name: name.trim(),
        position: position.trim(),
        level: level.trim(),
        photoUrl,
        photoPath,
        bg: (isEdit && item.bg) || PALETTE[leaderCount % PALETTE.length],
        order: isEdit ? (item.order ?? 0) : leaderCount
      };
      if (isEdit && item.id) {
        data.id = item.id;
      }
      if (onSave) {
        await onSave(data, isEdit, item);
      } else if (isEdit && item.id) {
        await updateItem('leaders', item.id, data);
      } else {
        await addItem('leaders', data);
      }
      onClose();
    } catch (e) {
      console.error('[leadership] save error', e);
      setError('Could not save: ' + (e.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function executeDelete() {
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(item);
      } else {
        await deleteItem('leaders', item);
        if (item?.photoPath) deleteFile(item.photoPath).catch(() => {});
      }
      onClose();
    } catch (e) {
      setError('Could not delete: ' + (e.message || 'unknown error'));
      setDeleting(false);
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={isEdit ? `Edit student position: ${item.position || item.name}` : 'Add student executive position'}>
      <div className="admin-form">
        <label>Full name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Samuel Boateng" />
        <label>Position</label>
        <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. President" />
        <label>Level / Program</label>
        <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. BSc Geological Engineering, Level 400" />
        <label>Photo</label>
        <input type="file" accept="image/*" onChange={handleFileSelect} />
        {previewUrl ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: '.76rem', color: 'var(--ink-500)', marginBottom: 4 }}>New photo preview:</div>
            <img className="file-preview" src={previewUrl} alt="Selected preview" />
          </div>
        ) : (isEdit && item.photoUrl && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: '.76rem', color: 'var(--ink-500)', marginBottom: 4 }}>Current photo:</div>
            <img className="file-preview" src={item.photoUrl} alt="Current" />
          </div>
        ))}

        {showConfirmDelete && isEdit && (
          <div
            style={{
              marginTop: 18,
              padding: '14px 16px',
              borderRadius: 8,
              background: '#fee2e2',
              border: '1px solid #f87171'
            }}
          >
            <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '.92rem', marginBottom: 4 }}>
              ⚠️ Permanently delete this student position?
            </div>
            <div style={{ fontSize: '.84rem', color: '#7f1d1d', marginBottom: 12 }}>
              "{position || 'Position'}" ({name || 'Unassigned'}) will be permanently removed from the executive list.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={executeDelete}
                disabled={deleting}
              >
                {deleting ? '⏳ Deleting…' : 'Yes, Delete Position'}
              </button>
            </div>
          </div>
        )}

        <div className="admin-form-actions" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="admin-btn-primary" onClick={handleSave} disabled={saving || deleting || showConfirmDelete}>
              {saving ? 'Saving leader…' : (isEdit ? 'Save Changes' : 'Add Position')}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={onClose} disabled={saving || deleting}>
              Cancel
            </button>
          </div>
          {isEdit && !showConfirmDelete && (
            <button
              type="button"
              className="admin-btn-danger"
              onClick={() => setShowConfirmDelete(true)}
              disabled={saving || deleting}
            >
              🗑 Delete Student Position
            </button>
          )}
        </div>
        {error && <p className="form-msg error">{error}</p>}
      </div>
    </Modal>
  );
}
