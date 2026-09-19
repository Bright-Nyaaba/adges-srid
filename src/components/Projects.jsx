import React, { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import ProjectCard from './ProjectCard.jsx';
import { addItem, updateItem, deleteItem } from '../lib/db.js';
import { uploadFile, deleteFile } from '../lib/storage.js';
import { ICON_OPTIONS } from '../data/icons.jsx';

export default function Projects({ projects, isEditor, openProjectModal }) {
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null);

  const cats = useMemo(() => ['All', ...new Set(projects.map((p) => p.cat))], [projects]);
  const list = filter === 'All' ? projects : projects.filter((p) => p.cat === filter);

  return (
    <div className="page active">
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="shell">
          <div className="section-kicker">STUDENT PROJECTS</div>
          <h2>Work by our students</h2>
          <p className="section-desc" style={{ marginTop: 12 }}>A running showcase of capstones, field projects and independent work.</p>

          <div className="filter-row mt-lg">
            {cats.map((c) => (
              <button key={c} className={'filter-btn' + (filter === c ? ' active' : '')} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>

          {isEditor && (
            <div className="admin-toolbar editor-only">
              <button className="admin-add-btn" onClick={() => setEditing({})}>+ Add project</button>
            </div>
          )}

          <div className="card-grid">
            {list.map((p, i) => (
              <ProjectCard key={p.id} project={p} colorIndex={i} isEditor={isEditor} onView={() => openProjectModal(p)} onEdit={setEditing} />
            ))}
          </div>
        </div>
      </section>

      <ProjectFormModal item={editing} itemCount={projects.length} onClose={() => setEditing(null)} />
    </div>
  );
}

function ProjectFormModal({ item, itemCount, onClose }) {
  const isOpen = item !== null;
  const isEdit = isOpen && !!item.id;
  const [cat, setCat] = useState('');
  const [title, setTitle] = useState('');
  const [team, setTeam] = useState('');
  const [year, setYear] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [icon, setIcon] = useState('chip');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setCat(item.cat || '');
      setTitle(item.title || '');
      setTeam(item.team || '');
      setYear(item.year || '');
      setDesc(item.desc || '');
      setTags((item.tags || []).join(', '));
      setIcon(item.icon || 'chip');
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
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let photoUrl = isEdit ? (item.photoUrl || '') : '';
      let photoPath = isEdit ? (item.photoPath || null) : null;
      if (file) {
        if (photoPath) deleteFile(photoPath).catch(() => {});
        const uploaded = await uploadFile(file, 'projects');
        photoUrl = uploaded.url;
        photoPath = uploaded.path || null;
      }
      const data = {
        cat: cat.trim() || 'General',
        title: title.trim(),
        team: team.trim(),
        year: year.trim(),
        desc: desc.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        icon,
        photoUrl,
        photoPath,
        order: isEdit ? (item.order || 0) : itemCount
      };
      if (isEdit) {
        await updateItem('projects', item.id, data);
      } else {
        await addItem('projects', data);
      }
      onClose();
    } catch (e) {
      console.error('[projects] save error', e);
      setError('Could not save: ' + (e.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteItem('projects', item.id);
      if (item.photoPath) deleteFile(item.photoPath).catch(() => {});
      onClose();
    } catch (e) {
      alert('Could not delete: ' + (e.message || 'unknown error'));
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={isEdit ? 'Edit project' : 'Add project'} wide>
      <div className="admin-form">
        <label>Category</label>
        <input type="text" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="e.g. Drilling Engineering" />
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Team</label>
        <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} />
        <label>Year</label>
        <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />
        <label>Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
        <label>Tags (comma-separated)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        <label>Icon</label>
        <select value={icon} onChange={(e) => setIcon(e.target.value)}>
          {ICON_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
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
            {saving ? 'Saving project…' : 'Save'}
          </button>
          {isEdit && <button className="admin-btn-danger" onClick={handleDelete}>Delete</button>}
        </div>
        {error && <p className="form-msg error">{error}</p>}
      </div>
    </Modal>
  );
}
