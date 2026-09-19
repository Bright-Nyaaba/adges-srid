import React, { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { addItem, updateItem, deleteItem } from '../lib/db.js';
import { uploadFile, deleteFile } from '../lib/storage.js';

export default function Resources({ resources, isEditor }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byCat = {};
    resources.forEach((r) => {
      const cat = r.category || 'General';
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(r);
    });
    const result = {};
    Object.keys(byCat).forEach((cat) => {
      const items = byCat[cat].filter((r) =>
        !q || (r.title || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q)
      );
      if (items.length) result[cat] = items;
    });
    return result;
  }, [resources, search]);

  const hasAny = Object.keys(grouped).length > 0;

  return (
    <div className="page active">
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="shell">
          <div className="section-kicker">RESOURCES</div>
          <h2>Course materials &amp; references</h2>
          <p className="section-desc" style={{ marginTop: 12, marginBottom: 32 }}>
            Lecture notes, past exam papers, field &amp; safety guides and reading lists — organized by category.
          </p>
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#8CA0B4" strokeWidth="2" /><path d="M20 20L16.5 16.5" stroke="#8CA0B4" strokeWidth="2" strokeLinecap="round" /></svg>
            <input type="text" placeholder="Search resources…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {isEditor && (
            <div className="admin-toolbar editor-only">
              <button className="admin-add-btn" onClick={() => setEditing({})}>+ Add resource</button>
            </div>
          )}

          {!hasAny && <p style={{ color: 'var(--ink-500)' }}>No resources match your search.</p>}

          {Object.entries(grouped).map(([cat, items]) => (
            <div className="res-cat" key={cat}>
              <div className="res-cat-head">
                <h3>{cat}</h3>
                <span className="res-cat-count">{items.length} item{items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="res-list">
                {items.map((r) => (
                  <div className="res-row" key={r.id}>
                    <div className="res-code">{r.code}</div>
                    <div><div className="res-title">{r.title}</div></div>
                    <div className="res-meta">{r.meta}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {r.fileUrl
                        ? <a className="res-dl" href={r.fileUrl} download target="_blank" rel="noopener noreferrer">Download</a>
                        : <button className="res-dl" disabled style={{ opacity: .5, cursor: 'default' }} title="No file uploaded yet">No file</button>}
                      {isEditor && (
                        <button className="card-admin-btn" style={{ position: 'static', background: 'var(--paper-dim)', color: 'var(--ink-700)' }} onClick={() => setEditing(r)} title="Edit">✎</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ResourceFormModal item={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function ResourceFormModal({ item, onClose }) {
  const isOpen = item !== null;
  const isEdit = isOpen && !!item.id;
  const [category, setCategory] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setCategory(item.category || '');
      setCode(item.code || '');
      setTitle(item.title || '');
      setFile(null);
      setError('');
    }
  }, [item, isOpen]);

  async function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let fileUrl = isEdit ? (item.fileUrl || '') : '';
      let filePath = isEdit ? (item.filePath || null) : null;
      let meta = isEdit ? (item.meta || 'No file attached') : 'No file attached';
      if (file) {
        if (filePath) deleteFile(filePath).catch(() => {});
        const uploaded = await uploadFile(file, 'resources');
        fileUrl = uploaded.url;
        filePath = uploaded.path || null;
        meta = `${file.type || 'File'} · ${Math.max(1, Math.round(file.size / 1024))} KB`;
      }
      const data = {
        category: category.trim() || 'General',
        code: code.trim() || '—',
        title: title.trim(),
        fileUrl,
        filePath,
        meta
      };
      if (isEdit) {
        await updateItem('resources', item.id, data);
      } else {
        await addItem('resources', data);
      }
      onClose();
    } catch (e) {
      console.error('[resources] save error', e);
      setError('Could not save: ' + (e.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this resource? This cannot be undone.')) return;
    try {
      await deleteItem('resources', item.id);
      if (item.filePath) deleteFile(item.filePath).catch(() => {});
      onClose();
    } catch (e) {
      alert('Could not delete: ' + (e.message || 'unknown error'));
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={isEdit ? 'Edit resource' : 'Add resource'}>
      <div className="admin-form">
        <label>Category</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Course Materials" />
        <label>Code</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DE-201" />
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Well Logging & Formation Evaluation Notes" />
        <label>File (PDF, image, or document)</label>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.csv,.md,.txt,.json,.docx" onChange={(e) => setFile(e.target.files[0] || null)} />
        {file && <p className="form-msg" style={{ color: 'var(--ink-700)' }}>Selected: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)</p>}
        {isEdit && item.fileUrl && !file && <p className="form-msg">A file is currently attached. Choose a file above to replace it.</p>}
        <div className="admin-form-actions">
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving resource…' : 'Save'}
          </button>
          {isEdit && <button className="admin-btn-danger" onClick={handleDelete}>Delete</button>}
        </div>
        {error && <p className="form-msg error">{error}</p>}
      </div>
    </Modal>
  );
}
