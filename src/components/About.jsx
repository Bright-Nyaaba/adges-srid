import React from 'react';
import EditableText from './EditableText.jsx';
import { DEFAULT_TEXT, DEFAULT_SITE_SETTINGS } from '../data/defaults.js';

export default function About({
  goTo,
  text = {},
  isEditor,
  leaders,
  siteSettings,
  onOpenCustomizer
}) {
  const preview = leaders.slice(0, 4);
  const cards = siteSettings?.cards || DEFAULT_SITE_SETTINGS.cards;
  const milestones = cards?.milestones || DEFAULT_SITE_SETTINGS.cards.milestones;
  const values = cards?.values || DEFAULT_SITE_SETTINGS.cards.values;

  return (
    <div className="page active">
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="shell">
          <EditableText
            as="div"
            className="section-kicker"
            text={text['about.kicker']}
            defaultValue={DEFAULT_TEXT['about.kicker']}
            field="about.kicker"
            isEditor={isEditor}
          />
          <EditableText
            as="h2"
            style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', maxWidth: '24ch' }}
            text={text['about.headline']}
            defaultValue={DEFAULT_TEXT['about.headline']}
            field="about.headline"
            isEditor={isEditor}
          />
          <hr className="rule-gold" />
          <EditableText
            as="p"
            className="section-desc"
            text={text['about.intro']}
            defaultValue={DEFAULT_TEXT['about.intro']}
            field="about.intro"
            isEditor={isEditor}
          />

          <div className="about-cols mt-lg">
            <div className="mv-block">
              <EditableText
                as="h3"
                text={text['about.missionTitle']}
                defaultValue={DEFAULT_TEXT['about.missionTitle']}
                field="about.missionTitle"
                isEditor={isEditor}
              />
              <EditableText
                as="p"
                text={text['about.mission']}
                defaultValue={DEFAULT_TEXT['about.mission']}
                field="about.mission"
                isEditor={isEditor}
              />
            </div>
            <div className="mv-block">
              <EditableText
                as="h3"
                text={text['about.visionTitle']}
                defaultValue={DEFAULT_TEXT['about.visionTitle']}
                field="about.visionTitle"
                isEditor={isEditor}
              />
              <EditableText
                as="p"
                text={text['about.vision']}
                defaultValue={DEFAULT_TEXT['about.vision']}
                field="about.vision"
                isEditor={isEditor}
              />
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="section-tight alt-bg">
        <div className="shell">
          <div className="section-head">
            <div>
              <EditableText
                as="div"
                className="section-kicker"
                text={text['about.historyKicker']}
                defaultValue={DEFAULT_TEXT['about.historyKicker']}
                field="about.historyKicker"
                isEditor={isEditor}
              />
              <EditableText
                as="h2"
                text={text['about.historyHeading']}
                defaultValue={DEFAULT_TEXT['about.historyHeading']}
                field="about.historyHeading"
                isEditor={isEditor}
              />
            </div>
            {isEditor && (
              <button
                type="button"
                className="wp-card-edit-btn"
                onClick={() => onOpenCustomizer?.('cards')}
                title="Edit timeline milestone cards in WordPress Customizer"
              >
                ✎ Edit History Milestones
              </button>
            )}
          </div>

          <div className="timeline">
            {milestones.map((ms, idx) => (
              <TimelineItem key={ms.id || idx} year={ms.year} title={ms.title} desc={ms.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Preview & Values */}
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <EditableText
                as="div"
                className="section-kicker"
                text={text['about.leadershipKicker']}
                defaultValue={DEFAULT_TEXT['about.leadershipKicker']}
                field="about.leadershipKicker"
                isEditor={isEditor}
              />
              <EditableText
                as="h2"
                text={text['about.leadershipHeading']}
                defaultValue={DEFAULT_TEXT['about.leadershipHeading']}
                field="about.leadershipHeading"
                isEditor={isEditor}
              />
            </div>
            <a href="#leadership" className="btn btn-outline" onClick={(e) => { e.preventDefault(); goTo('leadership'); }}>
              {text['about.leadershipCta'] || DEFAULT_TEXT['about.leadershipCta']}
            </a>
          </div>

          <div className="people-grid">
            {preview.map((l) => (
              <div className="person" key={l.id || l.name}>
                <div className="person-avatar" style={{ background: l.bg || '#155232' }}>
                  {l.photoUrl
                    ? <img src={l.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    : <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#F6D766" strokeWidth="1.6" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="#F6D766" strokeWidth="1.6" strokeLinecap="round" /></svg>}
                </div>
                <h4>{l.name}</h4>
                <span>{l.position}</span>
              </div>
            ))}
          </div>

          {/* Core Values Section */}
          <div className="values-row-wrap rel">
            {isEditor && (
              <div className="values-admin-bar">
                <button
                  type="button"
                  className="wp-card-edit-btn"
                  onClick={() => onOpenCustomizer?.('cards')}
                  title="Edit values cards in WordPress Customizer"
                >
                  ✎ Edit Core Values Cards
                </button>
              </div>
            )}
            <div className="values-row">
              {values.map((v, idx) => (
                <div className="value-cell" key={v.id || idx}>
                  <h4>{v.title}</h4>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineItem({ year, title, desc }) {
  return (
    <div className="tl-item">
      <div className="tl-year">{year}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}
