import React, { useState } from 'react';

export default function WordPressAdminBar({
  user,
  onSignOut,
  onOpenCustomizer,
  onOpenNewModal,
  visualEditMode,
  setVisualEditMode,
  cloudStorageReady = true
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="wp-admin-bar" id="wp-admin-bar" role="navigation" aria-label="WordPress Site Editor Toolbar">
      <div className="wp-admin-inner">
        <div className="wp-admin-left">
          {/* WP / Emblem Crest */}
          <div className="wp-admin-brand" title="ADGES WordPress Site Editor">
            <span className="wp-admin-w-icon">W</span>
            <span className="wp-admin-site-title">ADGES Customizer</span>
          </div>

          {/* Customize Button */}
          <button
            type="button"
            className="wp-admin-btn wp-admin-customize-btn"
            onClick={onOpenCustomizer}
            title="Open Site Customizer: Colors, Fonts, Header, Logo, Footer & Cards"
          >
            <span className="wp-icon">🎨</span>
            <span>Customize Site</span>
          </button>

          {/* Toggle In-Place Highlighting */}
          <button
            type="button"
            className={`wp-admin-btn wp-admin-toggle-btn ${visualEditMode ? 'active' : ''}`}
            onClick={() => setVisualEditMode(!visualEditMode)}
            title="Toggle visible dashed edit borders around all editable text & cards"
          >
            <span className="wp-icon">{visualEditMode ? '👁️' : '✏️'}</span>
            <span>{visualEditMode ? 'Edit Borders: ON' : 'Edit Borders: OFF'}</span>
          </button>

          {/* "+ New" Dropdown */}
          <div className="wp-admin-dropdown-wrap">
            <button
              type="button"
              className="wp-admin-btn wp-admin-new-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="wp-icon">✚</span>
              <span>New</span>
              <span className="wp-caret">▼</span>
            </button>

            {dropdownOpen && (
              <>
                <div className="wp-dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                <div className="wp-dropdown-menu">
                  <div className="wp-dropdown-header">Add New Content</div>
                  <button
                    type="button"
                    className="wp-dropdown-item"
                    onClick={() => { setDropdownOpen(false); onOpenNewModal('leader'); }}
                  >
                    👤 Executive Leader
                  </button>
                  <button
                    type="button"
                    className="wp-dropdown-item"
                    onClick={() => { setDropdownOpen(false); onOpenNewModal('faculty'); }}
                  >
                    🎓 Faculty Head / Lecturer
                  </button>
                  <button
                    type="button"
                    className="wp-dropdown-item"
                    onClick={() => { setDropdownOpen(false); onOpenNewModal('project'); }}
                  >
                    💡 Student Project
                  </button>
                  <button
                    type="button"
                    className="wp-dropdown-item"
                    onClick={() => { setDropdownOpen(false); onOpenNewModal('photo'); }}
                  >
                    📷 Gallery Photo
                  </button>
                  <button
                    type="button"
                    className="wp-dropdown-item"
                    onClick={() => { setDropdownOpen(false); onOpenNewModal('resource'); }}
                  >
                    📚 Academic Resource
                  </button>
                  <button
                    type="button"
                    className="wp-dropdown-item"
                    onClick={() => { setDropdownOpen(false); onOpenNewModal('store'); }}
                  >
                    🛍️ Store Product
                  </button>
                  <button
                    type="button"
                    className="wp-dropdown-item"
                    onClick={() => { setDropdownOpen(false); onOpenCustomizer('cards'); }}
                  >
                    🃏 Cards & Sections Manager
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="wp-admin-right">
          {/* Cloud Storage indicator */}
          <div className="wp-admin-cloud-indicator" title="Connected to Google Cloud Firestore">
            <span className="wp-cloud-dot" />
            <span className="wp-cloud-text">Cloud Sync: Live</span>
          </div>

          {/* User Profile */}
          <div className="wp-admin-user">
            <span className="wp-user-greeting">Howdy, <strong>{user?.email ? user.email.split('@')[0] : 'Admin'}</strong></span>
            <button
              type="button"
              className="wp-admin-signout-btn"
              onClick={onSignOut}
              title="Sign out of Admin Editor"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
