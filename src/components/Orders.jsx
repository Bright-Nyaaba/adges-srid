import React, { useState } from 'react';
import { auth, cloudInfo } from '../firebase.js';
import { backupDatabaseToCloudStorage, exportOrdersCsvClient } from '../lib/storage.js';
import { formatAdminErrorMessage } from '../lib/db.js';

export default function Orders({ orders = [], leaders = [], gallery = [], resources = [], projects = [], store = [], text = {} }) {
  const [exporting, setExporting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState(null);
  const [error, setError] = useState('');

  function handleExportCsv() {
    try {
      exportOrdersCsvClient(orders);
    } catch (e) {
      const errorMsg = formatAdminErrorMessage(e, 'export orders CSV');
      console.error('[admin:Orders:handleExportCsv] Export failed:', {
        orderCount: orders.length,
        error: e,
        errorCode: e?.code,
        errorMessage: e?.message,
        stack: e?.stack,
        timestamp: new Date().toISOString()
      });
      setError(errorMsg);
    }
  }

  async function handleBackupDatabase() {
    setBackingUp(true);
    setError('');
    setBackupResult(null);
    try {
      const fullSnapshot = {
        meta: {
          exportedAt: new Date().toISOString(),
          databaseId: cloudInfo.databaseId,
          projectId: cloudInfo.projectId,
          storageBucket: cloudInfo.storageBucket,
          exportedBy: auth.currentUser?.email || 'admin'
        },
        collections: {
          leaders,
          gallery,
          resources,
          projects,
          store,
          orders,
          siteContent: text
        }
      };
      const result = await backupDatabaseToCloudStorage(fullSnapshot);
      setBackupResult(result);
    } catch (e) {
      const errorMsg = formatAdminErrorMessage(e, 'backup database to Cloud Storage');
      console.error('[admin:Orders:handleBackupDatabase] Cloud backup failed:', {
        error: e,
        errorCode: e?.code,
        errorMessage: e?.message,
        stack: e?.stack,
        timestamp: new Date().toISOString()
      });
      setError(errorMsg);
    } finally {
      setBackingUp(false);
    }
  }

  return (
    <div className="page active">
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="shell">
          <div className="section-kicker">DATABASE & STORAGE MANAGEMENT</div>
          <h2>Cloud Database & Store Orders</h2>
          <p className="section-desc" style={{ marginTop: 12, marginBottom: 24 }}>
            Manage store orders and cloud persistence across Google Cloud Firestore and Firebase Cloud Storage.
          </p>

          <div className="cloud-admin-panel">
            <div className="cloud-admin-info">
              <h4>
                <span className="cloud-pill-dot"></span>
                Google Cloud Storage & Firestore Connected
              </h4>
              <p>Database: <strong>{cloudInfo.databaseId}</strong> | Bucket: <strong>{cloudInfo.storageBucket}</strong></p>
            </div>
            <div className="cloud-admin-actions">
              <button className="admin-add-btn" onClick={handleBackupDatabase} disabled={backingUp}>
                {backingUp ? 'Backing up to Cloud Storage…' : 'Backup Database to Cloud Storage'}
              </button>
              <button className="admin-add-btn" style={{ background: '#1B5E20' }} onClick={handleExportCsv} disabled={exporting}>
                Export Orders CSV
              </button>
            </div>
          </div>

          {backupResult && (
            <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', padding: '14px 18px', borderRadius: 6, marginBottom: 20, fontSize: '.86rem', color: '#1B5E20' }}>
              <strong>✓ Database backed up to Cloud Storage!</strong>
              <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: '.78rem' }}>
                Path: {backupResult.path} ({backupResult.sizeKb} KB)
              </div>
              <div style={{ marginTop: 8 }}>
                <a href={backupResult.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1B5E20', textDecoration: 'underline', fontWeight: 600 }}>
                  Download Snapshot from Cloud Storage →
                </a>
              </div>
            </div>
          )}

          {error && <p className="form-msg error" style={{ marginBottom: 16 }}>{error}</p>}

          <div className="wide-scroll">
            <table className="orders-table">
              <thead>
                <tr><th>Date</th><th>Buyer</th><th>Contact</th><th>Items</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ color: 'var(--ink-500)' }}>No orders yet.</td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                    <td>{o.name || '—'}</td>
                    <td>{o.email}{o.phone ? <><br />{o.phone}</> : null}</td>
                    <td>{(o.items || []).map((it) => `${it.qty}× ${it.title}`).join(', ')}</td>
                    <td>${(o.total || 0).toFixed(2)}</td>
                    <td><span className="order-status new">{o.status || 'new'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
