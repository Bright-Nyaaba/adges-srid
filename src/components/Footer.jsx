import React from 'react';
import AdgesLogo from './AdgesLogo.jsx';
import { DEFAULT_SITE_SETTINGS } from '../data/defaults.js';

export default function Footer({
  goTo,
  isEditor,
  siteSettings,
  onOpenCustomizer
}) {
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
        <div className="footer-col footer-col-brand">
          <div className="brand footer-brand" style={{ marginBottom: 14 }}>
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
          <p className="footer-about-text">
            {footerCfg.aboutText || 'Association of Drilling and Geological Engineering Students — bringing fieldwork and engineering together.'}
          </p>

          {/* Social icons row */}
          <div className="footer-socials" role="list" aria-label="ADGES Social Links">
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer" title="Twitter / X" aria-label="Twitter / X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" title="Instagram" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {socials.whatsapp && (
              <a href={socials.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="footer-col footer-col-nav">
          <h5>Explore</h5>
          <ul>
            <li><a href="#about" className="footer-nav-link" onClick={(e) => { e.preventDefault(); goTo('about'); }}>About</a></li>
            <li><a href="#leadership" className="footer-nav-link" onClick={(e) => { e.preventDefault(); goTo('leadership'); }}>Leadership</a></li>
            <li><a href="#gallery" className="footer-nav-link" onClick={(e) => { e.preventDefault(); goTo('gallery'); }}>Gallery</a></li>
            <li><a href="#resources" className="footer-nav-link" onClick={(e) => { e.preventDefault(); goTo('resources'); }}>Resources</a></li>
          </ul>
        </div>

        {/* Column 3: Students */}
        <div className="footer-col footer-col-students">
          <h5>Students</h5>
          <ul>
            <li><a href="#projects" className="footer-nav-link" onClick={(e) => { e.preventDefault(); goTo('projects'); }}>Student Projects</a></li>
            <li><a href="#store" className="footer-nav-link" onClick={(e) => { e.preventDefault(); goTo('store'); }}>Store</a></li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="footer-col footer-col-contact">
          <h5>Contact</h5>
          <ul className="footer-contact-list">
            <li>
              <a href={`mailto:${footerCfg.email || 'adges@umat.edu.gh'}`} className="footer-contact-link">
                <svg className="footer-contact-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{footerCfg.email || 'adges@umat.edu.gh'}</span>
              </a>
            </li>
            {footerCfg.secEmail && (
              <li>
                <a href={`mailto:${footerCfg.secEmail}`} className="footer-contact-link">
                  <svg className="footer-contact-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>{footerCfg.secEmail}</span>
                </a>
              </li>
            )}
            <li>
              {footerCfg.phone ? (
                <a href={`tel:${footerCfg.phone.replace(/[^0-9+]/g, '')}`} className="footer-contact-link" title="Tap to call">
                  <svg className="footer-contact-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>{footerCfg.phone}</span>
                </a>
              ) : (
                <span className="footer-contact-item">
                  <svg className="footer-contact-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>+233 000 000 000</span>
                </span>
              )}
            </li>
            <li>
              <span className="footer-contact-item">
                <svg className="footer-contact-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>
                  {footerCfg.addressLine1 || 'SRID Block, UMaT'}
                  {footerCfg.addressLine2 ? `, ${footerCfg.addressLine2}` : ''}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="shell footer-bottom">
        <span className="footer-copy">{footerCfg.copyright || '© 2026 ADGES — Association of Drilling and Geological Engineering Students, SRID, UMaT.'}</span>
      </div>
    </footer>
  );
}
