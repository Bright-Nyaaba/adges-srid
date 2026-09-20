import React, { useState } from 'react';
import { updateDocPath, setDocMerge, formatAdminErrorMessage } from '../lib/db.js';
import { uploadFile } from '../lib/storage.js';
import { DEFAULT_SITE_SETTINGS } from '../data/defaults.js';
import AdgesLogo from './AdgesLogo.jsx';

const PRESET_PALETTES = [
  {
    name: 'UMaT Forest & Gold (Official)',
    primaryColor: '#0B2E1E',
    secondaryColor: '#155232',
    accentColor: '#E8B923',
    accentGoldLight: '#F7D34D',
    bgColor: '#FFFFFF',
    darkColor: '#0B2E1E',
    inkColor: '#16241C'
  },
  {
    name: 'Earth & Terracotta',
    primaryColor: '#3D1E10',
    secondaryColor: '#7A3816',
    accentColor: '#D49B35',
    accentGoldLight: '#F3C978',
    bgColor: '#FAF7F4',
    darkColor: '#2B140A',
    inkColor: '#20120B'
  },
  {
    name: 'Royal Geology Cobalt',
    primaryColor: '#0A2540',
    secondaryColor: '#173F67',
    accentColor: '#F2C94C',
    accentGoldLight: '#FBE89C',
    bgColor: '#F6F9FC',
    darkColor: '#071828',
    inkColor: '#0D1C2E'
  },
  {
    name: 'Modern Emerald & Jade',
    primaryColor: '#0A3641',
    secondaryColor: '#146356',
    accentColor: '#F3C623',
    accentGoldLight: '#F8DC75',
    bgColor: '#F4F8F7',
    darkColor: '#08252C',
    inkColor: '#112328'
  },
  {
    name: 'Deep Obsidian & Amber',
    primaryColor: '#181E20',
    secondaryColor: '#263338',
    accentColor: '#FFB800',
    accentGoldLight: '#FFD366',
    bgColor: '#FFFFFF',
    darkColor: '#111618',
    inkColor: '#14181B'
  }
];

const FONT_DISPLAY_OPTIONS = [
  { label: 'Fraunces (Academic Serif · Default)', value: 'Fraunces' },
  { label: 'Playfair Display (Classic Editorial)', value: 'Playfair Display' },
  { label: 'Cinzel (Classical & Monumental)', value: 'Cinzel' },
  { label: 'Space Grotesk (Modern Tech & Engineering)', value: 'Space Grotesk' },
  { label: 'Outfit (Clean Contemporary)', value: 'Outfit' },
  { label: 'Inter (High-Precision Sans)', value: 'Inter' }
];

const FONT_BODY_OPTIONS = [
  { label: 'Inter (Clean & Legible · Default)', value: 'Inter' },
  { label: 'Plus Jakarta Sans (Refined Modern)', value: 'Plus Jakarta Sans' },
  { label: 'DM Sans (Friendly Geometric)', value: 'DM Sans' },
  { label: 'Outfit (Contemporary Soft)', value: 'Outfit' }
];

export default function SiteCustomizer({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  initialTab = 'theme'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Local draft state initialized with current site settings or defaults
  const draft = settings || DEFAULT_SITE_SETTINGS;

  function updateDraft(updater) {
    const updated = updater(draft);
    onUpdateSettings(updated);
  }

  async function handlePublish() {
    setSaving(true);
    setSaveStatus({ type: 'info', msg: 'Publishing changes to Firestore…' });
    try {
      await updateDocPath('site/settings', draft);
      setSaveStatus({ type: 'success', msg: '✓ Published changes to live site!' });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      try {
        await setDocMerge('site/settings', draft);
        setSaveStatus({ type: 'success', msg: '✓ Published changes to live site!' });
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (err2) {
        const errorReason = formatAdminErrorMessage(err2, 'publish site settings');
        console.error('[admin:SiteCustomizer:handlePublish] Error saving site settings:', {
          targetDoc: 'site/settings',
          draftSettings: draft,
          primaryError: err,
          fallbackError: err2,
          errorCode: err2?.code,
          errorMessage: err2?.message,
          stack: err2?.stack,
          timestamp: new Date().toISOString()
        });
        setSaveStatus({
          type: 'error',
          msg: `⚠️ Error publishing changes: ${errorReason}`
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleResetDefaults() {
    if (window.confirm('Reset all site customizer settings (colors, logo, footer, header) back to official defaults?')) {
      onUpdateSettings(DEFAULT_SITE_SETTINGS);
      try {
        await updateDocPath('site/settings', DEFAULT_SITE_SETTINGS);
        setSaveStatus({ type: 'success', msg: '↺ Reset to defaults and saved to cloud.' });
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (err) {
        try {
          await setDocMerge('site/settings', DEFAULT_SITE_SETTINGS);
          setSaveStatus({ type: 'success', msg: '↺ Reset to defaults and saved to cloud.' });
          setTimeout(() => setSaveStatus(null), 3000);
        } catch (err2) {
          const errorReason = formatAdminErrorMessage(err2, 'reset site settings');
          console.error('[admin:SiteCustomizer:handleResetDefaults] Failed to reset site settings in cloud:', {
            error: err2,
            errorCode: err2?.code,
            errorMessage: err2?.message,
            stack: err2?.stack,
            timestamp: new Date().toISOString()
          });
          setSaveStatus({
            type: 'error',
            msg: `⚠️ Cloud Reset Failed: ${errorReason}`
          });
        }
      }
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadFile('branding', file);
      if (res?.url) {
        updateDraft((prev) => ({
          ...prev,
          header: { ...prev.header, customLogoUrl: res.url }
        }));
        setSaveStatus({ type: 'success', msg: '✓ Logo uploaded! Click Publish to apply permanently.' });
      }
    } catch (err) {
      console.error('[admin:SiteCustomizer:handleLogoUpload] Failed to upload logo file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: err,
        errorCode: err?.code,
        errorMessage: err?.message,
        stack: err?.stack,
        timestamp: new Date().toISOString()
      });
      setSaveStatus({
        type: 'error',
        msg: `⚠️ Logo upload failed: ${err.message || 'Could not upload file. You can paste an image URL directly.'}`
      });
    } finally {
      setUploadingLogo(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="wp-customizer-drawer" id="wp-site-customizer" role="dialog" aria-modal="true" aria-label="WordPress Site Customizer">
      {/* Top Header */}
      <div className="wp-customizer-header">
        <div className="wp-customizer-title-row">
          <div className="wp-customizer-title">
            <span className="wp-customizer-w-badge">W</span>
            <div>
              <h3>Site Customizer</h3>
              <p>WordPress Live Theme &amp; Block Editor</p>
            </div>
          </div>
          <button type="button" className="wp-customizer-close" onClick={onClose} title="Close customizer">
            ✕
          </button>
        </div>

        {/* Action bar */}
        <div className="wp-customizer-actions-bar">
          <button
            type="button"
            className="wp-publish-btn"
            onClick={handlePublish}
            disabled={saving}
          >
            {saving ? 'Publishing…' : '✓ Publish Changes'}
          </button>
          <button
            type="button"
            className="wp-reset-btn"
            onClick={handleResetDefaults}
            title="Reset to official UMaT defaults"
          >
            ↺ Reset
          </button>
          {saveStatus && (
            <span className={`wp-save-status ${saveStatus.type === 'error' ? 'is-error' : ''}`}>
              {typeof saveStatus === 'string' ? saveStatus : saveStatus.msg}
            </span>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="wp-customizer-tabs">
          <button
            type="button"
            className={`wp-tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            🎨 Colors &amp; Fonts
          </button>
          <button
            type="button"
            className={`wp-tab-btn ${activeTab === 'identity' ? 'active' : ''}`}
            onClick={() => setActiveTab('identity')}
          >
            🖼️ Logo &amp; Identity
          </button>
          <button
            type="button"
            className={`wp-tab-btn ${activeTab === 'header' ? 'active' : ''}`}
            onClick={() => setActiveTab('header')}
          >
            🧭 Header &amp; Bar
          </button>
          <button
            type="button"
            className={`wp-tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
            onClick={() => setActiveTab('footer')}
          >
            🦶 Footer &amp; Social
          </button>
          <button
            type="button"
            className={`wp-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            🃏 Cards &amp; Blocks
          </button>
        </div>
      </div>

      {/* Body panel scrollable */}
      <div className="wp-customizer-body">
        {/* ================= TAB: THEME COLORS & FONTS ================= */}
        {activeTab === 'theme' && (
          <div className="wp-tab-content">
            <div className="wp-section-card">
              <h4>1-Click Color Schemes</h4>
              <p className="wp-hint">Select a curated palette or customize every color swatch individually below.</p>
              <div className="wp-palette-grid">
                {PRESET_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    className="wp-palette-btn"
                    onClick={() => {
                      updateDraft((prev) => ({
                        ...prev,
                        theme: {
                          ...prev.theme,
                          primaryColor: pal.primaryColor,
                          secondaryColor: pal.secondaryColor,
                          accentColor: pal.accentColor,
                          accentGoldLight: pal.accentGoldLight,
                          bgColor: pal.bgColor,
                          darkColor: pal.darkColor,
                          inkColor: pal.inkColor
                        }
                      }));
                    }}
                  >
                    <div className="wp-palette-swatches">
                      <span style={{ background: pal.primaryColor }} />
                      <span style={{ background: pal.secondaryColor }} />
                      <span style={{ background: pal.accentColor }} />
                      <span style={{ background: pal.darkColor }} />
                      <span style={{ background: pal.bgColor }} />
                    </div>
                    <span className="wp-palette-name">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="wp-section-card">
              <h4>Custom Color Pickers</h4>
              <div className="wp-color-field-grid">
                <ColorInput
                  label="Primary Brand Color"
                  desc="Navigation bar, primary buttons, borders"
                  value={draft.theme?.primaryColor || '#0B2E1E'}
                  onChange={(val) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, primaryColor: val } }))}
                />
                <ColorInput
                  label="Secondary Forest Color"
                  desc="Card hover accents, sub-banners"
                  value={draft.theme?.secondaryColor || '#155232'}
                  onChange={(val) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, secondaryColor: val } }))}
                />
                <ColorInput
                  label="Accent Gold / Highlight"
                  desc="Badges, active links, gold buttons"
                  value={draft.theme?.accentColor || '#E8B923'}
                  onChange={(val) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, accentColor: val, accentGoldLight: lightenColor(val, 20) } }))}
                />
                <ColorInput
                  label="Site Background (Body Canvas)"
                  desc="Main page background"
                  value={draft.theme?.bgColor || '#FFFFFF'}
                  onChange={(val) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, bgColor: val } }))}
                />
                <ColorInput
                  label="Dark Canvas / Footer Background"
                  desc="Hero backdrop and site footer background"
                  value={draft.theme?.darkColor || '#0B2E1E'}
                  onChange={(val) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, darkColor: val } }))}
                />
                <ColorInput
                  label="Ink / Text Color"
                  desc="Body and heading font color"
                  value={draft.theme?.inkColor || '#16241C'}
                  onChange={(val) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, inkColor: val } }))}
                />
              </div>
            </div>

            <div className="wp-section-card">
              <h4>Typography Pairings</h4>
              <div className="wp-form-group">
                <label>Display / Heading Font</label>
                <select
                  value={draft.theme?.fontDisplay || 'Fraunces'}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, fontDisplay: e.target.value } }))}
                  className="wp-select"
                >
                  {FONT_DISPLAY_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="wp-form-group" style={{ marginTop: 14 }}>
                <label>Body Text Font</label>
                <select
                  value={draft.theme?.fontBody || 'Inter'}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, fontBody: e.target.value } }))}
                  className="wp-select"
                >
                  {FONT_BODY_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="wp-form-group" style={{ marginTop: 14 }}>
                <label>Card Corner Radius</label>
                <div className="wp-radius-options">
                  {[
                    { label: 'Sharp (0px)', val: '0px' },
                    { label: 'Subtle (4px)', val: '4px' },
                    { label: 'Standard (8px)', val: '8px' },
                    { label: 'Rounded (16px)', val: '16px' }
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      className={`wp-pill-btn ${draft.theme?.cardRadius === r.val ? 'active' : ''}`}
                      onClick={() => updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, cardRadius: r.val } }))}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: LOGO & IDENTITY ================= */}
        {activeTab === 'identity' && (
          <div className="wp-tab-content">
            <div className="wp-section-card">
              <h4>Department Logo</h4>
              <div className="wp-logo-preview-box">
                <AdgesLogo
                  size={draft.header?.logoSize || 52}
                  customLogoUrl={draft.header?.customLogoUrl}
                  shape={draft.header?.logoShape || 'circle'}
                />
                <div className="wp-logo-preview-text">
                  <strong>{draft.header?.brandTitle || 'ADGES-SRID'}</strong>
                  <span>{draft.header?.brandSubtitle || 'Drilling & Geological Engineering • UMaT'}</span>
                </div>
              </div>

              <div className="wp-form-group" style={{ marginTop: 16 }}>
                <label>Upload New Logo Image (PNG, WebP, JPG, SVG)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="wp-file-input"
                />
                {uploadingLogo && <span className="wp-hint">Uploading &amp; compressing logo…</span>}
              </div>

              <div className="wp-form-group" style={{ marginTop: 14 }}>
                <label>Or Paste Logo Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={draft.header?.customLogoUrl || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, customLogoUrl: e.target.value } }))}
                  className="wp-input"
                />
                {draft.header?.customLogoUrl && (
                  <button
                    type="button"
                    className="wp-text-btn"
                    onClick={() => updateDraft((prev) => ({ ...prev, header: { ...prev.header, customLogoUrl: '' } }))}
                  >
                    Use official UMaT/ADGES crest instead
                  </button>
                )}
              </div>

              <div className="wp-form-row" style={{ marginTop: 14 }}>
                <div className="wp-form-group">
                  <label>Logo Shape</label>
                  <select
                    value={draft.header?.logoShape || 'circle'}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, logoShape: e.target.value } }))}
                    className="wp-select"
                  >
                    <option value="circle">Circular</option>
                    <option value="rounded">Rounded Corners</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                <div className="wp-form-group">
                  <label>Logo Size: {draft.header?.logoSize || 42}px</label>
                  <input
                    type="range"
                    min="32"
                    max="72"
                    step="2"
                    value={draft.header?.logoSize || 42}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, logoSize: Number(e.target.value) } }))}
                    className="wp-range"
                  />
                </div>
              </div>
            </div>

            <div className="wp-section-card">
              <h4>Site Brand Text &amp; Letters</h4>
              <div className="wp-form-group">
                <label>Brand Title (Header &amp; Nav)</label>
                <input
                  type="text"
                  value={draft.header?.brandTitle || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, brandTitle: e.target.value } }))}
                  className="wp-input"
                  placeholder="ADGES-SRID"
                />
              </div>

              <div className="wp-form-group" style={{ marginTop: 14 }}>
                <label>Brand Subtitle / Affiliation</label>
                <input
                  type="text"
                  value={draft.header?.brandSubtitle || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, brandSubtitle: e.target.value } }))}
                  className="wp-input"
                  placeholder="Drilling & Geological Engineering • UMaT"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: HEADER & BAR ================= */}
        {activeTab === 'header' && (
          <div className="wp-tab-content">
            <div className="wp-section-card">
              <h4>Top Announcement Banner</h4>
              <div className="wp-checkbox-row">
                <input
                  type="checkbox"
                  id="announcementActive"
                  checked={draft.header?.announcementActive || false}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, announcementActive: e.target.checked } }))}
                />
                <label htmlFor="announcementActive">Enable top announcement notice bar</label>
              </div>

              <div className="wp-form-group" style={{ marginTop: 12 }}>
                <label>Banner Text / Notice</label>
                <input
                  type="text"
                  value={draft.header?.announcementText || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, announcementText: e.target.value } }))}
                  className="wp-input"
                  placeholder="📢 2026 Annual Drilling Week Registration is now open!"
                />
              </div>

              <div className="wp-form-group" style={{ marginTop: 12 }}>
                <label>Optional Link (e.g. #projects or URL)</label>
                <input
                  type="text"
                  value={draft.header?.announcementLink || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, header: { ...prev.header, announcementLink: e.target.value } }))}
                  className="wp-input"
                  placeholder="#projects"
                />
              </div>
            </div>

            <div className="wp-section-card">
              <h4>Navigation Tab Labels</h4>
              <p className="wp-hint">Rename any header navigation link text:</p>
              <div className="wp-nav-labels-grid">
                {[
                  { key: 'home', default: 'Home' },
                  { key: 'about', default: 'About' },
                  { key: 'leadership', default: 'Leadership' },
                  { key: 'gallery', default: 'Gallery' },
                  { key: 'resources', default: 'Resources' },
                  { key: 'projects', default: 'Projects' },
                  { key: 'store', default: 'Store' }
                ].map((item) => (
                  <div key={item.key} className="wp-nav-item-field">
                    <label>{item.key.toUpperCase()}</label>
                    <input
                      type="text"
                      value={draft.header?.navLabels?.[item.key] ?? item.default}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          header: {
                            ...prev.header,
                            navLabels: {
                              ...prev.header?.navLabels,
                              [item.key]: val
                            }
                          }
                        }));
                      }}
                      className="wp-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: FOOTER & SOCIAL ================= */}
        {activeTab === 'footer' && (
          <div className="wp-tab-content">
            <div className="wp-section-card">
              <h4>Footer Branding &amp; About Blurb</h4>
              <div className="wp-form-group">
                <label>Footer Brand Name</label>
                <input
                  type="text"
                  value={draft.footer?.brandName || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, brandName: e.target.value } }))}
                  className="wp-input"
                />
              </div>

              <div className="wp-form-group" style={{ marginTop: 14 }}>
                <label>About Association Text (Footer Column 1)</label>
                <textarea
                  rows={3}
                  value={draft.footer?.aboutText || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, aboutText: e.target.value } }))}
                  className="wp-textarea"
                />
              </div>

              <div className="wp-form-group" style={{ marginTop: 14 }}>
                <label>Copyright Notice</label>
                <input
                  type="text"
                  value={draft.footer?.copyright || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, copyright: e.target.value } }))}
                  className="wp-input"
                />
              </div>
            </div>

            <div className="wp-section-card">
              <h4>Contact Details</h4>
              <div className="wp-form-group">
                <label>Campus Address Line 1</label>
                <input
                  type="text"
                  value={draft.footer?.addressLine1 || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, addressLine1: e.target.value } }))}
                  className="wp-input"
                />
              </div>

              <div className="wp-form-group" style={{ marginTop: 12 }}>
                <label>Campus Address Line 2</label>
                <input
                  type="text"
                  value={draft.footer?.addressLine2 || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, addressLine2: e.target.value } }))}
                  className="wp-input"
                />
              </div>

              <div className="wp-form-row" style={{ marginTop: 12 }}>
                <div className="wp-form-group">
                  <label>Primary Email</label>
                  <input
                    type="email"
                    value={draft.footer?.email || ''}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, email: e.target.value } }))}
                    className="wp-input"
                  />
                </div>
                <div className="wp-form-group">
                  <label>Secondary Email</label>
                  <input
                    type="email"
                    value={draft.footer?.secEmail || ''}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, secEmail: e.target.value } }))}
                    className="wp-input"
                  />
                </div>
              </div>

              <div className="wp-form-group" style={{ marginTop: 12 }}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={draft.footer?.phone || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, footer: { ...prev.footer, phone: e.target.value } }))}
                  className="wp-input"
                />
              </div>
            </div>

            <div className="wp-section-card">
              <h4>Social Media Links</h4>
              <div className="wp-social-fields">
                <div className="wp-form-group">
                  <label>LinkedIn URL</label>
                  <input
                    type="url"
                    value={draft.footer?.socials?.linkedin || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, linkedin: val } }
                      }));
                    }}
                    className="wp-input"
                  />
                </div>
                <div className="wp-form-group">
                  <label>Twitter / X URL</label>
                  <input
                    type="url"
                    value={draft.footer?.socials?.twitter || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, twitter: val } }
                      }));
                    }}
                    className="wp-input"
                  />
                </div>
                <div className="wp-form-group">
                  <label>Instagram URL</label>
                  <input
                    type="url"
                    value={draft.footer?.socials?.instagram || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, instagram: val } }
                      }));
                    }}
                    className="wp-input"
                  />
                </div>
                <div className="wp-form-group">
                  <label>WhatsApp Link</label>
                  <input
                    type="url"
                    value={draft.footer?.socials?.whatsapp || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, whatsapp: val } }
                      }));
                    }}
                    className="wp-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: CARDS & BLOCKS ================= */}
        {activeTab === 'cards' && (
          <div className="wp-tab-content">
            {/* 1. Hero Stats Cards */}
            <div className="wp-section-card">
              <h4>Home Hero Stat Cards (At a Glance)</h4>
              <p className="wp-hint">Edit the four numbers and descriptive labels in the hero panel:</p>
              <div className="wp-cards-list">
                {(draft.cards?.heroStats || []).map((stat, idx) => (
                  <div key={stat.id || idx} className="wp-stat-edit-card">
                    <div className="wp-stat-number-col">
                      <label>Number</label>
                      <input
                        type="text"
                        value={stat.num}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const newStats = [...(prev.cards?.heroStats || [])];
                            newStats[idx] = { ...newStats[idx], num: val };
                            return { ...prev, cards: { ...prev.cards, heroStats: newStats } };
                          });
                        }}
                        className="wp-input bold-input"
                      />
                    </div>
                    <div className="wp-stat-label-col">
                      <label>Description Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const newStats = [...(prev.cards?.heroStats || [])];
                            newStats[idx] = { ...newStats[idx], label: val };
                            return { ...prev, cards: { ...prev.cards, heroStats: newStats } };
                          });
                        }}
                        className="wp-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Three Pillars Feature Cards */}
            <div className="wp-section-card">
              <h4>"Why ADGES" Feature Cards</h4>
              <div className="wp-cards-list">
                {(draft.cards?.features || []).map((feat, idx) => (
                  <div key={feat.id || idx} className="wp-block-card">
                    <div className="wp-block-card-header">
                      <span className="wp-block-badge">Card {feat.num || idx + 1}</span>
                      <input
                        type="text"
                        style={{ width: 60 }}
                        value={feat.num}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const list = [...(prev.cards?.features || [])];
                            list[idx] = { ...list[idx], num: val };
                            return { ...prev, cards: { ...prev.cards, features: list } };
                          });
                        }}
                        className="wp-input"
                        placeholder="01"
                      />
                    </div>
                    <div className="wp-form-group" style={{ marginTop: 8 }}>
                      <label>Title</label>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const list = [...(prev.cards?.features || [])];
                            list[idx] = { ...list[idx], title: val };
                            return { ...prev, cards: { ...prev.cards, features: list } };
                          });
                        }}
                        className="wp-input"
                      />
                    </div>
                    <div className="wp-form-group" style={{ marginTop: 8 }}>
                      <label>Description</label>
                      <textarea
                        rows={2}
                        value={feat.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const list = [...(prev.cards?.features || [])];
                            list[idx] = { ...list[idx], desc: val };
                            return { ...prev, cards: { ...prev.cards, features: list } };
                          });
                        }}
                        className="wp-textarea"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Upcoming Events */}
            <div className="wp-section-card">
              <div className="wp-header-with-action">
                <h4>Upcoming Events Calendar Cards</h4>
                <button
                  type="button"
                  className="wp-add-card-btn"
                  onClick={() => {
                    updateDraft((prev) => {
                      const list = [...(prev.cards?.events || [])];
                      list.push({
                        id: 'ev_' + Date.now(),
                        date: 'NEW DATE',
                        title: 'New Department Event',
                        desc: 'Event description and location.'
                      });
                      return { ...prev, cards: { ...prev.cards, events: list } };
                    });
                  }}
                >
                  + Add Event
                </button>
              </div>
              <div className="wp-cards-list">
                {(draft.cards?.events || []).map((ev, idx) => (
                  <div key={ev.id || idx} className="wp-block-card">
                    <div className="wp-form-row">
                      <div className="wp-form-group" style={{ width: 110 }}>
                        <label>Date Tag</label>
                        <input
                          type="text"
                          value={ev.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const list = [...(prev.cards?.events || [])];
                              list[idx] = { ...list[idx], date: val };
                              return { ...prev, cards: { ...prev.cards, events: list } };
                            });
                          }}
                          className="wp-input bold-input"
                          placeholder="OCT 03"
                        />
                      </div>
                      <div className="wp-form-group" style={{ flex: 1 }}>
                        <label>Event Title</label>
                        <input
                          type="text"
                          value={ev.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const list = [...(prev.cards?.events || [])];
                              list[idx] = { ...list[idx], title: val };
                              return { ...prev, cards: { ...prev.cards, events: list } };
                            });
                          }}
                          className="wp-input"
                        />
                      </div>
                      <button
                        type="button"
                        className="wp-delete-card-btn"
                        onClick={() => {
                          updateDraft((prev) => {
                            const list = (prev.cards?.events || []).filter((_, i) => i !== idx);
                            return { ...prev, cards: { ...prev.cards, events: list } };
                          });
                        }}
                        title="Delete event"
                      >
                        🗑
                      </button>
                    </div>
                    <div className="wp-form-group" style={{ marginTop: 8 }}>
                      <label>Details</label>
                      <input
                        type="text"
                        value={ev.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const list = [...(prev.cards?.events || [])];
                            list[idx] = { ...list[idx], desc: val };
                            return { ...prev, cards: { ...prev.cards, events: list } };
                          });
                        }}
                        className="wp-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Timeline Milestones */}
            <div className="wp-section-card">
              <div className="wp-header-with-action">
                <h4>About Page: History Milestones</h4>
                <button
                  type="button"
                  className="wp-add-card-btn"
                  onClick={() => {
                    updateDraft((prev) => {
                      const list = [...(prev.cards?.milestones || [])];
                      list.push({
                        id: 'ms_' + Date.now(),
                        year: '2027',
                        title: 'New Milestone',
                        desc: 'Milestone description.'
                      });
                      return { ...prev, cards: { ...prev.cards, milestones: list } };
                    });
                  }}
                >
                  + Add Milestone
                </button>
              </div>
              <div className="wp-cards-list">
                {(draft.cards?.milestones || []).map((ms, idx) => (
                  <div key={ms.id || idx} className="wp-block-card">
                    <div className="wp-form-row">
                      <div className="wp-form-group" style={{ width: 85 }}>
                        <label>Year</label>
                        <input
                          type="text"
                          value={ms.year}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const list = [...(prev.cards?.milestones || [])];
                              list[idx] = { ...list[idx], year: val };
                              return { ...prev, cards: { ...prev.cards, milestones: list } };
                            });
                          }}
                          className="wp-input bold-input"
                        />
                      </div>
                      <div className="wp-form-group" style={{ flex: 1 }}>
                        <label>Milestone Title</label>
                        <input
                          type="text"
                          value={ms.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const list = [...(prev.cards?.milestones || [])];
                              list[idx] = { ...list[idx], title: val };
                              return { ...prev, cards: { ...prev.cards, milestones: list } };
                            });
                          }}
                          className="wp-input"
                        />
                      </div>
                      <button
                        type="button"
                        className="wp-delete-card-btn"
                        onClick={() => {
                          updateDraft((prev) => {
                            const list = (prev.cards?.milestones || []).filter((_, i) => i !== idx);
                            return { ...prev, cards: { ...prev.cards, milestones: list } };
                          });
                        }}
                      >
                        🗑
                      </button>
                    </div>
                    <div className="wp-form-group" style={{ marginTop: 8 }}>
                      <label>Description</label>
                      <input
                        type="text"
                        value={ms.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const list = [...(prev.cards?.milestones || [])];
                            list[idx] = { ...list[idx], desc: val };
                            return { ...prev, cards: { ...prev.cards, milestones: list } };
                          });
                        }}
                        className="wp-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Core Values */}
            <div className="wp-section-card">
              <h4>About Page: 4 Core Values</h4>
              <div className="wp-cards-list">
                {(draft.cards?.values || []).map((val, idx) => (
                  <div key={val.id || idx} className="wp-block-card">
                    <div className="wp-form-group">
                      <label>Value Title</label>
                      <input
                        type="text"
                        value={val.title}
                        onChange={(e) => {
                          const str = e.target.value;
                          updateDraft((prev) => {
                            const list = [...(prev.cards?.values || [])];
                            list[idx] = { ...list[idx], title: str };
                            return { ...prev, cards: { ...prev.cards, values: list } };
                          });
                        }}
                        className="wp-input bold-input"
                      />
                    </div>
                    <div className="wp-form-group" style={{ marginTop: 8 }}>
                      <label>Value Description</label>
                      <textarea
                        rows={2}
                        value={val.desc}
                        onChange={(e) => {
                          const str = e.target.value;
                          updateDraft((prev) => {
                            const list = [...(prev.cards?.values || [])];
                            list[idx] = { ...list[idx], desc: str };
                            return { ...prev, cards: { ...prev.cards, values: list } };
                          });
                        }}
                        className="wp-textarea"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Faculty Advisor / Patron Card */}
            <div className="wp-section-card">
              <h4>Faculty Advisor / Patron Card</h4>
              <div className="wp-form-group">
                <label>Badge Tag</label>
                <input
                  type="text"
                  value={draft.cards?.patron?.title || 'FACULTY ADVISOR'}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, title: e.target.value } } }))}
                  className="wp-input"
                />
              </div>
              <div className="wp-form-group" style={{ marginTop: 8 }}>
                <label>Advisor Name &amp; Title</label>
                <input
                  type="text"
                  value={draft.cards?.patron?.name || 'Prof. K. Addai-Mensah'}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, name: e.target.value } } }))}
                  className="wp-input bold-input"
                />
              </div>
              <div className="wp-form-group" style={{ marginTop: 8 }}>
                <label>Academic Role / Department</label>
                <input
                  type="text"
                  value={draft.cards?.patron?.department || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, department: e.target.value } } }))}
                  className="wp-input"
                  placeholder="Patron & Senior Lecturer • Department of Geological Engineering"
                />
              </div>
              <div className="wp-form-group" style={{ marginTop: 8 }}>
                <label>Bio / Description</label>
                <textarea
                  rows={3}
                  value={draft.cards?.patron?.desc || ''}
                  onChange={(e) => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, desc: e.target.value } } }))}
                  className="wp-textarea"
                />
              </div>
              <div className="wp-form-row" style={{ marginTop: 8 }}>
                <div className="wp-form-group" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={draft.cards?.patron?.email || ''}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, email: e.target.value } } }))}
                    className="wp-input"
                    placeholder="faculty@umat.edu.gh"
                  />
                </div>
                <div className="wp-form-group" style={{ flex: 1 }}>
                  <label>Office</label>
                  <input
                    type="text"
                    value={draft.cards?.patron?.office || ''}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, office: e.target.value } } }))}
                    className="wp-input"
                    placeholder="SRID Block, Room 204"
                  />
                </div>
              </div>

              {/* Photo & Color */}
              <div style={{ marginTop: 12, padding: 10, background: '#f6f7f7', borderRadius: 4, border: '1px solid #e2e4e7' }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Advisor Photo &amp; Avatar</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 4,
                      background: draft.cards?.patron?.bg || '#103F29',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {draft.cards?.patron?.photoUrl ? (
                      <img
                        src={draft.cards?.patron?.photoUrl}
                        alt="Advisor"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="#F6D766" strokeWidth="1.5" />
                        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="#F6D766" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await uploadFile(file, 'patron');
                            updateDraft((prev) => ({
                              ...prev,
                              cards: {
                                ...prev.cards,
                                patron: {
                                  ...prev.cards?.patron,
                                  photoUrl: res.url,
                                  photoPath: res.path
                                }
                              }
                            }));
                          } catch (err) {
                            alert('Upload error: ' + err.message);
                          }
                        }
                      }}
                      style={{ fontSize: 11 }}
                    />
                    {draft.cards?.patron?.photoUrl && (
                      <button
                        type="button"
                        onClick={() => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, photoUrl: '', photoPath: null } } }))}
                        style={{ display: 'block', marginTop: 4, background: 'none', border: 'none', color: '#d63638', fontSize: 11, cursor: 'pointer', padding: 0 }}
                      >
                        ✕ Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 11, margin: 0 }}>Avatar Background:</label>
                  <input
                    type="color"
                    value={draft.cards?.patron?.bg || '#103F29'}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, cards: { ...prev.cards, patron: { ...prev.cards?.patron, bg: e.target.value } } }))}
                    style={{ width: 24, height: 24, padding: 0, border: '1px solid #c3c4c7', borderRadius: 3, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 11, fontFamily: 'monospace' }}>{draft.cards?.patron?.bg || '#103F29'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorInput({ label, desc, value, onChange }) {
  return (
    <div className="wp-color-field">
      <div className="wp-color-picker-box">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="wp-color-swatch-input"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="wp-color-hex-input"
        />
      </div>
      <div className="wp-color-info">
        <span className="wp-color-label">{label}</span>
        {desc && <span className="wp-color-desc">{desc}</span>}
      </div>
    </div>
  );
}

function lightenColor(col, amt) {
  let usePound = false;
  if (col[0] === '#') {
    col = col.slice(1);
    usePound = true;
  }
  const num = parseInt(col, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00ff) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000ff) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}
