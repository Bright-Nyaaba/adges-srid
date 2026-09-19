import React from 'react';
import AdgesLogo from './AdgesLogo.jsx';
import { signOut } from '../lib/auth.js';
import { DEFAULT_SITE_SETTINGS } from '../data/defaults.js';

export default function Footer({
  goTo,
  user,
  isEditor,
  onOpenAdminLogin,
  siteSettings,
  onOpenCustomizer
}) {
  const userLabel = user?.username || (user?.email ? user.email.split('@')[0] : 'Admin');
  const footerCfg = siteSettings?.footer || DEFAULT_SITE_SETTINGS.footer;
  const headerCfg = siteSettings?.header || DEFAULT_SITE_SETTINGS.header;
  const socials = footerCfg?.socials || {};

  return (
    <footer className="footer rel" id="colophon" role="contentinfo">
      {isEditor && (
        <div className="footer-quick-edit-bar editor-only">
          <button
            type="button"
            className="wp-card-edit-btn"
            onClick={() => onOpenCustomizer?.('footer')}
            title="Edit footer address, socials, and text in WordPress Customizer"
          >
            ✎ Edit Footer &amp; Social Links
          </button>
        </div>
      )}

      <div className="shell footer-grid">
        {/* Column 1: Brand & About */}
        <div>
          <div className="brand" style={{ marginBottom: 14 }}>
            <AdgesLogo
              className="crest"
              size={headerCfg.logoSize ? Math.min(48, headerCfg.logoSize) : 42}
              customLogoUrl={headerCfg.customLogoUrl}
              shape={headerCfg.logoShape || 'circle'}
            />
            <span className="brand-text">
              <span className="dept" style={{ color: '#F3F7F1' }}>{footerCfg.brandName || 'ADGES-SRID'}</span>
              <span className="univ">UMaT Tarkwa</span>
            </span>
          </div>
          <p style={{ fontSize: '.85rem', maxWidth: '34ch', color: '#9BB3A4', lineHeight: 1.6 }}>
            {footerCfg.aboutText || 'Association of Drilling and Geological Engineering Students — bringing fieldwork and engineering together.'}
          </p>

          {/* Social icons row */}
          <div className="footer-socials">
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer" title="Twitter / X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {socials.whatsapp && (
              <a href={socials.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h5>Explore</h5>
          <ul>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); goTo('about'); }}>About</a></li>
            <li><a href="#leadership" onClick={(e) => { e.preventDefault(); goTo('leadership'); }}>Leadership</a></li>
            <li><a href="#gallery" onClick={(e) => { e.preventDefault(); goTo('gallery'); }}>Gallery</a></li>
            <li><a href="#resources" onClick={(e) => { e.preventDefault(); goTo('resources'); }}>Resources</a></li>
          </ul>
        </div>

        {/* Column 3: Students */}
        <div>
          <h5>Students</h5>
          <ul>
            <li><a href="#projects" onClick={(e) => { e.preventDefault(); goTo('projects'); }}>Student Projects</a></li>
            <li><a href="#store" onClick={(e) => { e.preventDefault(); goTo('store'); }}>Store</a></li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h5>Contact</h5>
          <ul>
            <li><a href={`mailto:${footerCfg.email || 'adges@umat.edu.gh'}`}>{footerCfg.email || 'adges@umat.edu.gh'}</a></li>
            {footerCfg.secEmail && <li><a href={`mailto:${footerCfg.secEmail}`}>{footerCfg.secEmail}</a></li>}
            <li>{footerCfg.phone || '+233 000 000 000'}</li>
            <li>{footerCfg.addressLine1 || 'SRID Block, UMaT'}</li>
            {footerCfg.addressLine2 && <li>{footerCfg.addressLine2}</li>}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="shell footer-bottom">
        <span>{footerCfg.copyright || '© 2026 ADGES — Association of Drilling and Geological Engineering Students, SRID, UMaT.'}</span>
        <div className="footer-admin-meta">
          {user ? (
            <span className="footer-admin-active">
              Admin: <strong>{userLabel}</strong> &bull;{' '}
              <button
                type="button"
                className="footer-signout-btn"
                onClick={signOut}
                title="Sign out of Admin Portal"
              >
                Sign out
              </button>
            </span>
          ) : (
            <button
              type="button"
              id="admin-portal-footer-btn"
              className="footer-admin-link"
              onClick={onOpenAdminLogin}
              title="Staff & Admin Portal"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
