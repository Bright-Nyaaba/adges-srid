import React, { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { addItem, updateItem, deleteItem } from '../lib/db.js';
import { uploadFile, deleteFile } from '../lib/storage.js';
import { ThumbSVG } from '../data/icons.jsx';

export default function Gallery({ gallery, isEditor }) {
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null);

  const cats = useMemo(() => ['All', ...new Set(gallery.map((g) => g.cat))], [gallery]);
  const list = filter === 'All' ? gallery : gallery.filter((g) => g.cat === filter);

  return (
    <div className="page active">
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="shell">
          <div className="section-kicker">GALLERY</div>
          <h2>Life in the association</h2>
          <p className="section-desc" style={{ marginTop: 12 }}>Moments from field trips, labs, graduation and workshops.</p>

          <div className="filter-row mt-lg">
            {cats.map((c) => (
              <button key={c} className={'filter-btn' + (filter === c ? ' active' : '')} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>

          {isEditor && (
            <div className="admin-toolbar editor-only">
              <button className="admin-add-btn" onClick={() => setEditing({})}>+ Add photo</button>
            </div>
          )}

          <div className="gal-grid">
            {list.map((g, i) => (
              <div className="gal-tile rel" key={g.id}>
                {isEditor && (
                  <div className="card-admin-bar">
                    <button className="card-admin-btn" onClick={(e) => { e.stopPropagation(); setEditing(g); }} title="Edit">✎</button>
                  </div>
                )}
                {g.photoUrl
                  ? <img src={g.photoUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ThumbSVG seed={i} />}
                <div className="gal-caption">{g.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GalleryFormModal item={editing} itemCount={gallery.length} onClose={() => setEditing(null)} />
    </div>
  );
}

function GalleryFormModal({ item, itemCount, onClose }) {
  const isOpen = item !== null;
  const isEdit = isOpen && !!item.id;
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTitle(item.title || '');
      setCat(item.cat || '');
      setFile(null);
      setPreviewUrl(null);
      setError('');
    }
  }, [item, isOpen]);

  function handleFileSelect(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const objUrl = URL.createObjectURL(selected);
      setPreviewUrl(objUrl);
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleSave() {
    if (!title.trim()) { setError('Caption is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let photoUrl = isEdit ? (item.photoUrl || '') : '';
      let photoPath = isEdit ? (item.photoPath || null) : null;
      if (file) {
        if (photoPath) deleteFile(photoPath).catch(() => {});
        const uploaded = await uploadFile(file, 'gallery');
        photoUrl = uploaded.url;
        photoPath = uploaded.path || null;
      }
      const data = {
        title: title.trim(),
        cat: cat.trim() || 'Uncategorized',
        photoUrl,
        photoPath,
        order: isEdit ? (item.order || 0) : itemCount
      };
      if (isEdit) {
        await updateItem('gallery', item.id, data);
      } else {
        await addItem('gallery', data);
      }
      onClose();
    } catch (e) {
      console.error('[gallery] save error', e);
      setError('Could not save: ' + (e.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    try {
      await deleteItem('gallery', item.id);
      if (item.photoPath) deleteFile(item.photoPath).catch(() => {});
      onClose();
    } catch (e) {
      alert('Could not delete: ' + (e.message || 'unknown error'));
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={isEdit ? 'Edit photo' : 'Add photo'}>
      <div className="admin-form">
        <label>Caption</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Field mapping in Tarkwa" />
        <label>Category</label>
        <input type="text" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="e.g. Field Trips, Labs, Graduation, Workshops" />
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
        <div className="admin-form-actions">
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving photo…' : 'Save'}
          </button>
          {isEdit && <button className="admin-btn-danger" onClick={handleDelete}>Delete</button>}
        </div>
        {error && <p className="form-msg error">{error}</p>}
      </div>
    </Modal>
  );
}
