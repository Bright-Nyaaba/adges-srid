import React, { useState, useMemo } from 'react';
import Modal from './Modal.jsx';
import ConfirmDeleteModal from './ConfirmDeleteModal.jsx';
import EditableText from './EditableText.jsx';
import { addItem, updateItem, deleteItem, formatAdminErrorMessage } from '../lib/db.js';
import { uploadFile, deleteFile } from '../lib/storage.js';
import { IconSVG } from '../data/icons.jsx';
import { DEFAULT_TEXT } from '../data/defaults.js';

const PALETTE = ['#155232', '#227A48', '#103F29', '#E8B923', '#0B2E1E'];

export default function FacultySection({
  faculty = [],
  isEditor,
  text = {},
  onOpenCustomizer,
  onDeleteFaculty,
  onSaveFaculty
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteFaculty, setPendingDeleteFaculty] = useState(null);
  const [feedback, setFeedback] = useState(null);

  async function executeDeleteFaculty(item) {
    if (!item) return;
    const roleText = item.position ? `"${item.name}" (${item.position})` : `"${item.name}"`;
    const targetKey = item.id || item.name;
    setDeletingId(targetKey);
    try {
      if (onDeleteFaculty) {
        await onDeleteFaculty(item);
      } else {
        await deleteItem('faculty', item);
        if (item.photoPath) deleteFile(item.photoPath).catch(() => {});
      }
      setFeedback({ type: 'success', msg: `Removed ${item.name || 'faculty member'} successfully.` });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Could not delete: ' + (err.message || 'unknown error') });
    } finally {
      setDeletingId(null);
      setPendingDeleteFaculty(null);
    }
  }

  // Tabs for organizing Faculty Heads vs Academic Lecturers
  const tabs = [
    { id: 'all', label: 'All Faculty' },
    { id: 'heads', label: 'Faculty Heads & Leadership' },
    { id: 'drilling', label: 'Drilling Engineering' },
    { id: 'geology', label: 'Geological Engineering' }
  ];

  const filteredFaculty = useMemo(() => {
    let list = [...faculty].sort((a, b) => (a.order || 0) - (b.order || 0));

    if (activeTab === 'heads') {
      list = list.filter((f) => f.role === 'head' || f.category === 'Leadership');
    } else if (activeTab === 'drilling') {
      list = list.filter((f) => f.category === 'Drilling');
    } else if (activeTab === 'geology') {
      list = list.filter((f) => f.category === 'Geology');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.position && f.position.toLowerCase().includes(q)) ||
        (f.department && f.department.toLowerCase().includes(q)) ||
        (f.specialization && f.specialization.toLowerCase().includes(q)) ||
        (f.qualification && f.qualification.toLowerCase().includes(q))
      );
    }

    return list;
  }, [faculty, activeTab, searchQuery]);

  return (
    <section className="faculty-section" id="faculty-lecturers">
      <div className="shell">
        {/* Section Header */}
        <div className="faculty-header-row">
          <div>
            <EditableText
              as="div"
              className="section-kicker"
              text={text['home.facultyKicker']}
              defaultValue={DEFAULT_TEXT['home.facultyKicker']}
              field="home.facultyKicker"
              isEditor={isEditor}
            />
            <EditableText
              as="h2"
              text={text['home.facultyHeading']}
              defaultValue={DEFAULT_TEXT['home.facultyHeading']}
              field="home.facultyHeading"
              isEditor={isEditor}
            />
          </div>
          <div style={{ maxWidth: '54ch' }}>
            <EditableText
              as="p"
              className="section-desc"
              text={text['home.facultyDesc']}
              defaultValue={DEFAULT_TEXT['home.facultyDesc']}
              field="home.facultyDesc"
              isEditor={isEditor}
            />
          </div>
        </div>

        {/* Live Feedback Toast Banner */}
        {feedback && (
          <div
            style={{
              marginBottom: 20,
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
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Controls: Filter Pills & Search */}
        <div className="faculty-controls">
          <div className="faculty-filter-group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`faculty-filter-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="faculty-search-box">
              <span className="faculty-search-icon">🔍</span>
              <input
                type="text"
                className="faculty-search-input"
                placeholder="Search faculty or research…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-500)',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {isEditor && (
              <button
                type="button"
                className="admin-add-btn"
                onClick={() => setEditingFaculty({})}
                title="Add new Faculty Head or Lecturer"
              >
                + Add Faculty
              </button>
            )}
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="faculty-grid">
          {filteredFaculty.length > 0 ? (
            filteredFaculty.map((item, idx) => {
              const isHead = item.role === 'head' || item.category === 'Leadership';
              return (
                <div
                  key={item.id || idx}
                  className={`faculty-card rel ${isHead ? 'is-head' : 'is-lecturer'}`}
                >
                  {/* WordPress Admin Edit Bar */}
                  {isEditor && (
                    <div className="card-admin-bar">
                      <button
                        type="button"
                        className="card-admin-btn"
                        onClick={() => setEditingFaculty(item)}
                        title={`Edit ${item.name}`}
                        aria-label={`Edit ${item.name}`}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className={`card-admin-btn danger ${deletingId === (item.id || item.name) ? 'is-deleting' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteFaculty(item);
                        }}
                        disabled={deletingId === (item.id || item.name)}
                        title={`Delete ${item.name} (${item.position})`}
                        aria-label={`Delete ${item.name}`}
                      >
                        {deletingId === (item.id || item.name) ? '⏳' : '🗑'}
                      </button>
                    </div>
                  )}

                  {/* Photo / Avatar Header */}
                  <div
                    className="faculty-photo-wrap"
                    style={{ background: item.bg || PALETTE[idx % PALETTE.length] }}
                  >
                    {isHead ? (
                      <span className="faculty-badge head">★ Faculty Head</span>
                    ) : (
                      <span className="faculty-badge lecturer">Academic Lecturer</span>
                    )}

                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="faculty-photo-img"
                        loading="lazy"
                      />
                    ) : (
                      <IconSVG name="school" size={64} color="rgba(255, 255, 255, 0.75)" />
                    )}
                  </div>

                  {/* Content Body */}
                  <div className="faculty-card-content">
                    <div className="faculty-name-row">
                      <h4 className="faculty-name">{item.name}</h4>
                      <div className="faculty-position">{item.position}</div>
                      <div className="faculty-dept">{item.department}</div>
                    </div>

                    {item.qualification && (
                      <span className="faculty-qualifications">
                        🎓 {item.qualification}
                      </span>
                    )}

                    {item.specialization && (
                      <div className="faculty-specialization">
                        <strong>Research:</strong> {item.specialization}
                      </div>
                    )}

                    {item.bio && (
                      <p className="faculty-bio">{item.bio}</p>
                    )}

                    {/* Footer with Contact Links */}
                    <div className="faculty-footer">
                      <div className="faculty-footer-main">
                        {item.email ? (
                          <a
                            href={`mailto:${item.email}`}
                            className="faculty-email-link"
                            title={`Email ${item.name}`}
                          >
                            <span>✉</span>
                            <span>{item.email}</span>
                          </a>
                        ) : (
                          <span style={{ color: 'var(--ink-500)', fontSize: '.75rem' }}>UMaT Faculty</span>
                        )}
                      </div>

                      <div className="faculty-footer-meta">
                        {item.office && (
                          <span className="faculty-office" title="Office Location">
                            <span>📍</span>
                            <span>{item.office}</span>
                          </span>
                        )}

                        {item.linkedinUrl && (
                          <a
                            href={item.linkedinUrl.startsWith('http://') || item.linkedinUrl.startsWith('https://') ? item.linkedinUrl : `https://${item.linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="faculty-linkedin-link"
                            title={`${item.name} on LinkedIn`}
                            aria-label={`${item.name}'s LinkedIn Profile`}
                          >
                            <IconSVG name="linkedin" size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="faculty-empty-notice">
              <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 600 }}>No faculty members found matching criteria.</p>
              <p style={{ margin: '6px 0 0', fontSize: '.84rem' }}>Try clearing the search query or selecting a different category tab.</p>
            </div>
          )}
        </div>
      </div>

      {/* In-app Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        open={Boolean(pendingDeleteFaculty)}
        title="Delete Faculty Member"
        itemName={pendingDeleteFaculty?.name}
        itemDetail={pendingDeleteFaculty?.position ? `${pendingDeleteFaculty.position} • ${pendingDeleteFaculty.department || ''}` : ''}
        confirmMessage="Are you sure you want to permanently delete this lecturer / faculty member from the directory?"
        confirmLabel="Delete Member"
        isDeleting={Boolean(deletingId && pendingDeleteFaculty && deletingId === (pendingDeleteFaculty.id || pendingDeleteFaculty.name))}
        onConfirm={() => executeDeleteFaculty(pendingDeleteFaculty)}
        onClose={() => setPendingDeleteFaculty(null)}
      />

      {/* Editor Modal for Adding / Modifying Faculty */}
      {editingFaculty !== null && (
        <FacultyFormModal
          faculty={editingFaculty}
          totalCount={faculty.length}
          onClose={() => setEditingFaculty(null)}
          onDelete={onDeleteFaculty}
          onSave={onSaveFaculty}
        />
      )}
    </section>
  );
}

function FacultyFormModal({ faculty, totalCount, onClose, onDelete, onSave }) {
  const isEdit = !!faculty && (!!faculty.id || !!faculty.name || !!faculty.position);
  const [name, setName] = useState(faculty?.name || '');
  const [position, setPosition] = useState(faculty?.position || '');
  const [role, setRole] = useState(faculty?.role || 'lecturer');
  const [category, setCategory] = useState(faculty?.category || 'Drilling');
  const [department, setDepartment] = useState(faculty?.department || 'Department of Drilling Engineering');
  const [qualification, setQualification] = useState(faculty?.qualification || '');
  const [specialization, setSpecialization] = useState(faculty?.specialization || '');
  const [bio, setBio] = useState(faculty?.bio || '');
  const [email, setEmail] = useState(faculty?.email || '');
  const [office, setOffice] = useState(faculty?.office || '');
  const [linkedinUrl, setLinkedinUrl] = useState(faculty?.linkedinUrl || '');
  const [bg, setBg] = useState(faculty?.bg || '#155232');
  const [order, setOrder] = useState(faculty?.order ?? totalCount + 1);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState('');

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
      setError('Faculty name is required.');
      return;
    }
    if (!position.trim()) {
      setError('Position / Academic title is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let photoUrl = isEdit ? (faculty?.photoUrl || '') : '';
      let photoPath = isEdit ? (faculty?.photoPath || null) : null;

      if (file) {
        if (photoPath) {
          deleteFile(photoPath).catch(() => {});
        }
        const uploaded = await uploadFile(file, 'faculty');
        photoUrl = uploaded.url;
        photoPath = uploaded.path || null;
      }

      const payload = {
        name: name.trim(),
        position: position.trim(),
        role,
        category,
        department: department.trim(),
        qualification: qualification.trim(),
        specialization: specialization.trim(),
        bio: bio.trim(),
        email: email.trim(),
        office: office.trim(),
        linkedinUrl: linkedinUrl.trim(),
        bg,
        order: Number(order) || 0,
        photoUrl,
        photoPath
      };

      if (isEdit && faculty?.id) {
        payload.id = faculty.id;
      }

      if (onSave) {
        await onSave(payload, isEdit, faculty);
      } else if (isEdit && faculty?.id) {
        await updateItem('faculty', faculty.id, payload);
      } else {
        await addItem('faculty', payload);
      }
      onClose();
    } catch (err) {
      const errorMsg = formatAdminErrorMessage(err, isEdit ? 'update faculty member' : 'add faculty member');
      console.error('[admin:FacultySection:handleSave] Save operation failed:', {
        facultyId: faculty?.id,
        isEdit,
        payload,
        errorCode: err?.code,
        errorMessage: err?.message,
        error: err,
        stack: err?.stack,
        timestamp: new Date().toISOString()
      });
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  }

  async function executeDelete() {
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(faculty);
      } else {
        await deleteItem('faculty', faculty);
        if (faculty?.photoPath) {
          deleteFile(faculty.photoPath).catch(() => {});
        }
      }
      onClose();
    } catch (err) {
      const errorMsg = formatAdminErrorMessage(err, 'delete faculty member');
      console.error('[admin:FacultySection:executeDelete] Deletion operation failed:', {
        facultyId: faculty?.id,
        name: faculty?.name,
        errorCode: err?.code,
        errorMessage: err?.message,
        error: err,
        stack: err?.stack,
        timestamp: new Date().toISOString()
      });
      setError(errorMsg);
      setDeleting(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? `Edit Faculty: ${faculty.name}` : 'Add Faculty Head or Lecturer'}
      wide
    >
      <div className="admin-form" style={{ marginTop: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label>Full Name & Academic Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. K. Addai-Mensah"
            />
          </div>
          <div>
            <label>Position / Designation</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Head of Department"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label>Role Type</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="head">Faculty Head / Leadership</option>
              <option value="lecturer">Academic Lecturer</option>
            </select>
          </div>
          <div>
            <label>Academic Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Leadership">Leadership & Administration</option>
              <option value="Drilling">Drilling Engineering</option>
              <option value="Geology">Geological Engineering</option>
            </select>
          </div>
        </div>

        <label>Department / School</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Department of Drilling Engineering, SRID, UMaT"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label>Academic Qualifications</label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. PhD, MSc, BSc, FGhIG"
            />
          </div>
          <div>
            <label>Office Location</label>
            <input
              type="text"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              placeholder="e.g. SRID Academic Block, Room 204"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label>Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. faculty@umat.edu.gh"
            />
          </div>
          <div>
            <label>LinkedIn Profile URL</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <div>
            <label>Research Specialization & Courses</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Directional Drilling, Well Completion, Offshore Hydraulics"
            />
          </div>
          <div>
            <label>Display Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>
        </div>

        <label>Biography / Academic Profile</label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief summary of research experience, fieldwork supervision, or academic background..."
        />

        <label>Faculty Portrait Photo</label>
        <input type="file" accept="image/*" onChange={handleFileSelect} />
        {previewUrl ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '.76rem', color: 'var(--ink-500)', marginBottom: 4 }}>New photo preview:</div>
            <img className="file-preview" src={previewUrl} alt="Selected preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }} />
          </div>
        ) : (isEdit && faculty.photoUrl && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '.76rem', color: 'var(--ink-500)', marginBottom: 4 }}>Current portrait:</div>
            <img className="file-preview" src={faculty.photoUrl} alt="Current" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }} />
          </div>
        ))}

        <label style={{ marginTop: 12 }}>Avatar Backdrop Color</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setBg(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: c,
                border: bg === c ? '2px solid var(--gold-500)' : '1px solid var(--line)',
                cursor: 'pointer',
                boxShadow: bg === c ? '0 0 0 2px var(--gold-400)' : 'none'
              }}
            />
          ))}
        </div>

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
              ⚠️ Permanently delete this faculty member?
            </div>
            <div style={{ fontSize: '.84rem', color: '#7f1d1d', marginBottom: 12 }}>
              "{name || 'Lecturer'}" ({position || 'Faculty Member'}) will be permanently removed from the departmental directory.
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
                {deleting ? '⏳ Deleting…' : 'Yes, Delete Member'}
              </button>
            </div>
          </div>
        )}

        <div className="admin-form-actions" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="admin-btn-primary" onClick={handleSave} disabled={saving || deleting || showConfirmDelete}>
              {saving ? 'Saving faculty member…' : (isEdit ? 'Save Changes' : 'Add Faculty Member')}
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
              🗑 Delete Lecturer / Member
            </button>
          )}
        </div>
        {error && <p className="form-msg error">{error}</p>}
      </div>
    </Modal>
  );
}
