import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { addItem, updateItem, deleteItem } from '../lib/db.js';
import { uploadFile, deleteFile } from '../lib/storage.js';
import { IconSVG, STORE_ICON_OPTIONS } from '../data/icons.jsx';

const PALETTE = ['#155232', '#227A48', '#103F29', '#E8B923'];

export default function Store({ store, isEditor, addToCart }) {
  const [editing, setEditing] = useState(null);
  const [addedId, setAddedId] = useState(null);

  function handleAdd(item) {
    addToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <div className="page active">
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="shell">
          <div className="section-kicker">ADGES STORE</div>
          <h2>Wear the association</h2>
          <p className="section-desc" style={{ marginTop: 12, marginBottom: 36 }}>
            Official merchandise from the Students' Association. Add items to your cart and submit an order —
            payment is arranged separately after ADGES confirms your order.
          </p>

          {isEditor && (
            <div className="admin-toolbar editor-only">
              <button className="admin-add-btn" onClick={() => setEditing({})}>+ Add product</button>
            </div>
          )}

          <div className="card-grid">
            {store.map((s) => (
              <div className="store-card rel" key={s.id}>
                {isEditor && (
                  <div className="card-admin-bar">
                    <button className="card-admin-btn" onClick={() => setEditing(s)} title="Edit">✎</button>
                  </div>
                )}
                <div className="store-thumb" style={{ background: s.bg || '#155232' }}>
                  {s.photoUrl
                    ? <img src={s.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <IconSVG name={s.icon} />}
                </div>
                <div className="store-body">
                  <h3>{s.title}</h3>
                  <div className="store-price">${(s.priceNum || 0).toFixed(2)}</div>
                  <button className={'add-cart-btn' + (addedId === s.id ? ' added' : '')} onClick={() => handleAdd(s)}>
                    {addedId === s.id ? 'Added' : 'Add to cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoreFormModal item={editing} itemCount={store.length} onClose={() => setEditing(null)} />
    </div>
  );
}

function StoreFormModal({ item, itemCount, onClose }) {
  const isOpen = item !== null;
  const isEdit = isOpen && !!item.id;
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [icon, setIcon] = useState('shirt');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTitle(item.title || '');
      setPrice(item.priceNum !== undefined ? String(item.priceNum) : '');
      setIcon(item.icon || 'shirt');
      setFile(null);
      setPreviewUrl(null);
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
    if (!title.trim()) { setError('Product name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let photoUrl = isEdit ? (item.photoUrl || '') : '';
      let photoPath = isEdit ? (item.photoPath || null) : null;
      if (file) {
        if (photoPath) deleteFile(photoPath).catch(() => {});
        const uploaded = await uploadFile(file, 'store');
        photoUrl = uploaded.url;
        photoPath = uploaded.path || null;
      }
      const data = {
        title: title.trim(),
        priceNum: parseFloat(price) || 0,
        icon,
        photoUrl,
        photoPath,
        bg: (isEdit && item.bg) || PALETTE[itemCount % PALETTE.length],
        order: isEdit ? (item.order || 0) : itemCount
      };
      if (isEdit) {
        await updateItem('store', item.id, data);
      } else {
        await addItem('store', data);
      }
      onClose();
    } catch (e) {
      console.error('[store] save error', e);
      setError('Could not save: ' + (e.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteItem('store', item.id);
      if (item.photoPath) deleteFile(item.photoPath).catch(() => {});
      onClose();
    } catch (e) {
      alert('Could not delete: ' + (e.message || 'unknown error'));
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={isEdit ? 'Edit product' : 'Add product'}>
      <div className="admin-form">
        <label>Product name</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. ADGES Field Vest" />
        <label>Price (GH₵)</label>
        <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 120" />
        <label>Icon</label>
        <select value={icon} onChange={(e) => setIcon(e.target.value)}>
          {STORE_ICON_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label>Photo (optional)</label>
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
            {saving ? 'Saving product…' : 'Save'}
          </button>
          {isEdit && <button className="admin-btn-danger" onClick={handleDelete}>Delete</button>}
        </div>
        {error && <p className="form-msg error">{error}</p>}
      </div>
    </Modal>
  );
}
