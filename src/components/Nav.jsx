import React, { useState } from 'react';
import { signOut, cloudInfo } from '../lib/auth.js';
import AdgesLogo from './AdgesLogo.jsx';

const PAGES = [
  ['home', 'Home'],
  ['about', 'About'],
  ['leadership', 'Leadership'],
  ['gallery', 'Gallery'],
  ['resources', 'Resources'],
  ['projects', 'Student Projects'],
  ['store', 'Store']
];

export default function Nav({
  page,
  goTo,
  isEditor,
  user,
  cartCount,
  onOpenCart,
  siteSettings,
  onOpenCustomizer
}) {
  const [open, setOpen] = useState(false);

  function nav(p) {
    goTo(p);
    setOpen(false);
  }

  const userLabel = user?.username || (user?.email ? user.email.split('@')[0] : 'Admin');
  const headerCfg = siteSettings?.header || {};
  const navLabels = headerCfg.navLabels || {};

  const navItems = [
    ['home', navLabels.home || 'Home'],
    ['about', navLabels.about || 'About'],
    ['leadership', navLabels.leadership || 'Leadership'],
    ['gallery', navLabels.gallery || 'Gallery'],
    ['resources', navLabels.resources || 'Resources'],
    ['projects', navLabels.projects || 'Student Projects'],
    ['store', navLabels.store || 'Store']
  ];

  return (
    <>
      {/* Top Announcement Notice Bar (if enabled in WordPress Customizer) */}
      {headerCfg.announcementActive && headerCfg.announcementText && (
        <div className="announcement-bar" role="alert">
          <div className="announcement-inner">
            <span>{headerCfg.announcementText}</span>
            {headerCfg.announcementLink && (
              <a
                href={headerCfg.announcementLink}
                className="announcement-link"
                onClick={(e) => {
                  if (headerCfg.announcementLink.startsWith('#')) {
                    const target = headerCfg.announcementLink.replace('#', '');
                    if (['home', 'about', 'leadership', 'gallery', 'resources', 'projects', 'store'].includes(target)) {
                      e.preventDefault();
                      nav(target);
                    }
                  }
                }}
              >
                Learn more &rarr;
              </a>
            )}
            {isEditor && (
              <button
                type="button"
                className="announcement-edit-btn"
                onClick={() => onOpenCustomizer?.('header')}
                title="Edit announcement in customizer"
              >
                ✎ Edit
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="nav">
        <div className="nav-inner">
          <a
            href="#home"
            className="brand rel"
            onClick={(e) => { e.preventDefault(); nav('home'); }}
            title={headerCfg.brandTitle || 'ADGES-SRID'}
          >
            <AdgesLogo
              className="crest"
              size={headerCfg.logoSize || 42}
              customLogoUrl={headerCfg.customLogoUrl}
              shape={headerCfg.logoShape || 'circle'}
            />
            <span className="brand-text">
              <span className="dept">{headerCfg.brandTitle || 'ADGES-SRID'}</span>
              <span className="univ">{headerCfg.brandSubtitle || 'Drilling & Geological Engineering • UMaT'}</span>
            </span>

            {isEditor && (
              <button
                type="button"
                className="nav-brand-edit-pencil editor-only"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenCustomizer?.('identity');
                }}
                title="Edit Logo, Title & Letters in WordPress Customizer"
              >
                ✎
              </button>
            )}
          </a>

          <ul className={'nav-links' + (open ? ' open' : '')}>
            {navItems.map(([key, label]) => (
              <li key={key}>
                <button className={page === key ? 'active' : ''} onClick={() => nav(key)}>{label}</button>
              </li>
            ))}
            {isEditor && (
              <li className="editor-only">
                <button className={page === 'orders' ? 'active' : ''} onClick={() => nav('orders')}>Orders &amp; Cloud</button>
              </li>
            )}
          </ul>

          <div className="nav-right">
            {/* Cloud Storage and Admin Editing badges: visible ONLY to authenticated admin */}
            {isEditor && cloudInfo.isConfigured && (
              <span
                className="cloud-pill editor-only"
                title={`Connected to Firebase Cloud Storage (${cloudInfo.storageBucket}) & Firestore Database (${cloudInfo.databaseId})`}
              >
                <span className="cloud-pill-dot"></span>
                Cloud Storage
              </span>
            )}
            {isEditor && (
              <button
                type="button"
                className="customize-nav-pill editor-only"
                onClick={() => onOpenCustomizer?.('theme')}
                title="Open Theme & Colors Customizer"
              >
                🎨 Theme
              </button>
            )}

            <button className="cart-btn" onClick={onOpenCart} aria-label="Cart">
              Cart <span className="cart-count">{cartCount}</span>
            </button>

            {/* Sign out button: visible ONLY to authenticated admin */}
            {user && (
              <button
                id="admin-signout-btn"
                className="cart-btn editor-only"
                onClick={signOut}
                title={`Signed in as ${user.email || user.username} — click to sign out`}
              >
                Sign out
              </button>
            )}

            <button className="hamburger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

