import React from 'react';
import EditableText from './EditableText.jsx';
import ProjectCard from './ProjectCard.jsx';
import FacultySection from './FacultySection.jsx';
import { DEFAULT_TEXT, DEFAULT_SITE_SETTINGS } from '../data/defaults.js';

export default function Home({
  goTo,
  projects,
  faculty = [],
  text = {},
  isEditor,
  openProjectModal,
  siteSettings,
  onOpenCustomizer,
  onDeleteFaculty,
  onSaveFaculty
}) {
  const cards = siteSettings?.cards || DEFAULT_SITE_SETTINGS.cards;
  const heroStats = cards?.heroStats || DEFAULT_SITE_SETTINGS.cards.heroStats;
  const features = cards?.features || DEFAULT_SITE_SETTINGS.cards.features;
  const events = cards?.events || DEFAULT_SITE_SETTINGS.cards.events;

  return (
    <div className="page active">
      <header className="hero">
        <div className="shell hero-grid">
          <div>
            <div className="hero-eyebrow-wrap">
              <EditableText
                as="span"
                className="eyebrow-tag"
                text={text['hero.eyebrow']}
                defaultValue={DEFAULT_TEXT['hero.eyebrow']}
                field="hero.eyebrow"
                isEditor={isEditor}
              />
            </div>
            <EditableText
              as="h1"
              text={text['hero.headline']}
              defaultValue={DEFAULT_TEXT['hero.headline']}
              field="hero.headline"
              isEditor={isEditor}
            />
            <EditableText
              as="p"
              className="hero-lede"
              text={text['hero.lede']}
              defaultValue={DEFAULT_TEXT['hero.lede']}
              field="hero.lede"
              isEditor={isEditor}
            />
            <div className="hero-ctas">
              <div className="editable-cta-wrap">
                <a href="#about" className="btn btn-gold" onClick={(e) => { e.preventDefault(); goTo('about'); }}>
                  {text['hero.ctaAbout'] || DEFAULT_TEXT['hero.ctaAbout']}
                </a>
                {isEditor && (
                  <EditableText
                    as="span"
                    text={text['hero.ctaAbout']}
                    defaultValue={DEFAULT_TEXT['hero.ctaAbout']}
                    field="hero.ctaAbout"
                    isEditor={isEditor}
                    className="inline-cta-editor"
                  />
                )}
              </div>
              <div className="editable-cta-wrap">
                <a href="#projects" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); goTo('projects'); }}>
                  {text['hero.ctaProjects'] || DEFAULT_TEXT['hero.ctaProjects']}
                </a>
                {isEditor && (
                  <EditableText
                    as="span"
                    text={text['hero.ctaProjects']}
                    defaultValue={DEFAULT_TEXT['hero.ctaProjects']}
                    field="hero.ctaProjects"
                    isEditor={isEditor}
                    className="inline-cta-editor"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Hero Panel Cards */}
          <div className="hero-panel rel">
            {isEditor && (
              <div className="hero-panel-admin-bar">
                <button
                  type="button"
                  className="wp-card-edit-btn"
                  onClick={() => onOpenCustomizer?.('cards')}
                  title="Edit Stat Cards in WordPress Customizer"
                >
                  ✎ Edit Cards
                </button>
              </div>
            )}
            <div className="hero-panel-title">
              <EditableText
                as="span"
                text={text['hero.panelTitle']}
                defaultValue={DEFAULT_TEXT['hero.panelTitle']}
                field="hero.panelTitle"
                isEditor={isEditor}
              />
            </div>
            {heroStats.map((stat, idx) => (
              <div className="stat-row" key={stat.id || idx}>
                <span className="stat-num">{stat.num}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ============ FACULTY HEADS & ACADEMIC LECTURERS ============ */}
      <FacultySection
        faculty={faculty}
        isEditor={isEditor}
        text={text}
        onOpenCustomizer={onOpenCustomizer}
        onDeleteFaculty={onDeleteFaculty}
        onSaveFaculty={onSaveFaculty}
      />

      {/* Feature Pillars Section */}
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <EditableText
                as="div"
                className="section-kicker"
                text={text['home.whyKicker']}
                defaultValue={DEFAULT_TEXT['home.whyKicker']}
                field="home.whyKicker"
                isEditor={isEditor}
              />
              <EditableText
                as="h2"
                text={text['home.whyHeading']}
                defaultValue={DEFAULT_TEXT['home.whyHeading']}
                field="home.whyHeading"
                isEditor={isEditor}
              />
            </div>
            <div style={{ maxWidth: '48ch' }}>
              <EditableText
                as="p"
                className="section-desc"
                text={text['home.whyDesc']}
                defaultValue={DEFAULT_TEXT['home.whyDesc']}
                field="home.whyDesc"
                isEditor={isEditor}
              />
            </div>
          </div>

          <div className="grid-3 rel">
            {isEditor && (
              <div className="section-quick-edit-bar">
                <button
                  type="button"
                  className="wp-card-edit-btn"
                  onClick={() => onOpenCustomizer?.('cards')}
                  title="Customize these 3 feature cards"
                >
                  ✎ Edit Feature Cards
                </button>
              </div>
            )}
            {features.map((feat, idx) => (
              <div className="feature-card" key={feat.id || idx}>
                <div className="feature-num">{feat.num}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Strip */}
      <section className="section-tight alt-bg">
        <div className="shell">
          <div className="section-head">
            <div>
              <EditableText
                as="div"
                className="section-kicker"
                text={text['home.eventsKicker']}
                defaultValue={DEFAULT_TEXT['home.eventsKicker']}
                field="home.eventsKicker"
                isEditor={isEditor}
              />
              <EditableText
                as="h2"
                text={text['home.eventsHeading']}
                defaultValue={DEFAULT_TEXT['home.eventsHeading']}
                field="home.eventsHeading"
                isEditor={isEditor}
              />
            </div>
            {isEditor && (
              <button
                type="button"
                className="wp-card-edit-btn"
                onClick={() => onOpenCustomizer?.('cards')}
                title="Add or edit calendar events"
              >
                ✎ Edit Calendar Events
              </button>
            )}
          </div>

          <div className="events-strip">
            {events.map((ev, idx) => (
              <div className="event-item" key={ev.id || idx}>
                <div className="event-date">{ev.date}</div>
                <h4>{ev.title}</h4>
                <p>{ev.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Heads & Academic Lecturers Directory */}
      <FacultySection
        faculty={faculty}
        isEditor={isEditor}
        text={text}
        onOpenCustomizer={onOpenCustomizer}
        onDeleteFaculty={onDeleteFaculty}
        onSaveFaculty={onSaveFaculty}
      />

      {/* Recent Student Projects Section */}
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <EditableText
                as="div"
                className="section-kicker"
                text={text['home.projectsKicker']}
                defaultValue={DEFAULT_TEXT['home.projectsKicker']}
                field="home.projectsKicker"
                isEditor={isEditor}
              />
              <EditableText
                as="h2"
                text={text['home.projectsHeading']}
                defaultValue={DEFAULT_TEXT['home.projectsHeading']}
                field="home.projectsHeading"
                isEditor={isEditor}
              />
            </div>
            <a href="#projects" className="btn btn-outline" onClick={(e) => { e.preventDefault(); goTo('projects'); }}>
              {text['home.projectsCta'] || DEFAULT_TEXT['home.projectsCta']}
            </a>
          </div>
          <div className="card-grid">
            {projects.slice(0, 3).map((p, i) => (
              <ProjectCard key={p.id || i} project={p} colorIndex={i} isEditor={false} onView={() => openProjectModal(p)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
