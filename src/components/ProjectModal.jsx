import React from 'react';
import Modal from './Modal.jsx';
import { IconSVG } from '../data/icons.jsx';

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <Modal open={!!project} onClose={onClose} title={project.title} wide>
      <div style={{ marginTop: 12 }}>
        {project.photoUrl ? (
          <div style={{ width: '100%', maxHeight: 320, overflow: 'hidden', borderRadius: 6, marginBottom: 16, background: '#103F29' }}>
            <img src={project.photoUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper-dim)', borderRadius: 6, marginBottom: 16 }}>
            <IconSVG name={project.icon || 'chip'} size={48} color="var(--ink-700)" />
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          {project.cat && (
            <span style={{ fontSize: '0.78rem', fontWeight: 600, background: 'var(--gold-400)', color: 'var(--navy-950)', padding: '3px 10px', borderRadius: '12px' }}>
              {project.cat}
            </span>
          )}
          {project.year && (
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
              📅 {project.year}
            </span>
          )}
          {project.team && (
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-500)' }}>
              👥 {project.team}
            </span>
          )}
        </div>

        <p style={{ color: 'var(--ink-700)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: 16 }}>
          {project.desc}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            {project.tags.map((tag, idx) => (
              <span key={idx} style={{ fontSize: '0.74rem', background: 'var(--paper-dim)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: 4, color: 'var(--ink-700)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
