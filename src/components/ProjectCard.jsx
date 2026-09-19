import React from 'react';
import { IconSVG } from '../data/icons.jsx';

const BG_ROTATION = ['#155232', '#227A48', '#103F29'];

export default function ProjectCard({ project: p, colorIndex, isEditor, onView, onEdit }) {
  return (
    <div className="proj-card rel">
      {isEditor && (
        <div className="card-admin-bar">
          <button className="card-admin-btn" onClick={(e) => { e.stopPropagation(); onEdit(p); }} title="Edit">✎</button>
        </div>
      )}
      <div className="proj-thumb" style={{ background: BG_ROTATION[colorIndex % 3] }}>
        <span className="proj-cat-tag">{p.cat}</span>
        {p.photoUrl
          ? <img src={p.photoUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <IconSVG name={p.icon} />}
      </div>
      <div className="proj-body">
        <h3>{p.title}</h3>
        <div className="proj-team">{p.team} · {p.year}</div>
        <p className="proj-desc">{p.desc}</p>
        <div className="tag-row">
          {(p.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
        <a className="proj-link" onClick={onView}>View details</a>
      </div>
    </div>
  );
}
