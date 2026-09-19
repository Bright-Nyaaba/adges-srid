// File upload helper with client-side image optimization and resilient storage.
// Provides instant, non-blocking image upload even if Firebase Storage bucket is
// inaccessible, unconfigured, or experiencing CORS/network timeouts.
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase.js';

/**
 * Compresses and resizes image files client-side using HTML5 Canvas.
 * Converts multi-megabyte raw photos into lightweight, crisp WebP/JPEG data URLs (~35KB-80KB).
 */
export async function optimizeImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = {}) {
  if (!file) return null;
  if (!file.type || !file.type.startsWith('image/')) {
    return readFileAsDataURL(file);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to high-quality JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp') && webpData.length < e.target.result.length) {
            return resolve(webpData);
          }
        } catch {
          // ignore
        }
        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/** Reads any file into a Base64 Data URL. */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a File/Blob.
 * First optimizes the image client-side so user data is immediately available and preserved.
 * Then attempts Firebase Storage with a strict 2.5-second timeout.
 * If Firebase Storage is unavailable or hangs, seamlessly returns the optimized data URL.
 * NEVER hangs or leaves the UI stuck in "Saving..."!
 */
export async function uploadFile(file, folder = 'misc') {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // 1. Process client-side optimization first
  let dataUrl = null;
  const isImage = file.type && file.type.startsWith('image/');

  if (isImage) {
    try {
      dataUrl = await optimizeImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
    } catch (err) {
      console.warn('[storage] Client image optimization fallback', err);
    }
  } else {
    // Non-image file (PDF / document)
    if (file.size <= 1024 * 1024) { // Up to 1MB
      try {
        dataUrl = await readFileAsDataURL(file);
      } catch (err) {
        console.warn('[storage] FileReader failed', err);
      }
    }
  }

  // 2. Attempt Firebase Storage upload with a strict 2.5s timeout
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `uploads/${folder}/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, path);

    const uploadPromise = uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream'
    }).then(async () => {
      const url = await getDownloadURL(storageRef);
      return { path, url, name: file.name, type: file.type, size: file.size };
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout')), 2500)
    );

    const cloudResult = await Promise.race([uploadPromise, timeoutPromise]);
    return cloudResult;
  } catch (err) {
    console.info('[storage] Using resilient client-optimized payload (cloud storage bypassed or timed out):', err.message);

    if (dataUrl) {
      return {
        path: null,
        url: dataUrl,
        name: file.name,
        type: file.type,
        size: dataUrl.length,
        isInline: true
      };
    }

    // If file was too large and not an image, throw a clear error
    throw new Error('File upload could not complete. For documents, please select a file under 1MB.');
  }
}

/** Best-effort delete of a previously uploaded file (non-blocking). */
export async function deleteFile(path) {
  if (!path || typeof path !== 'string' || path.startsWith('data:')) return;
  try {
    const deletePromise = deleteObject(ref(storage, path));
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
    await Promise.race([deletePromise, timeoutPromise]);
  } catch (err) {
    console.warn('[storage] delete failed (non-fatal)', path, err);
  }
}

/**
 * Backs up full database contents (all collections) to Firebase Cloud Storage or local download.
 */
export async function backupDatabaseToCloudStorage(databaseData) {
  const jsonStr = JSON.stringify(databaseData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const filename = `database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const path = `uploads/database_backups/${filename}`;

  try {
    const storageRef = ref(storage, path);
    const uploadPromise = uploadBytes(storageRef, blob, { contentType: 'application/json' }).then(async () => {
      const url = await getDownloadURL(storageRef);
      return {
        path,
        url,
        filename,
        sizeKb: Math.round(blob.size / 1024),
        createdAt: new Date().toISOString()
      };
    });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.warn('[storage] Cloud backup fallback to client download URL', err);
    const localUrl = URL.createObjectURL(blob);
    return {
      path: null,
      url: localUrl,
      filename,
      sizeKb: Math.round(blob.size / 1024),
      createdAt: new Date().toISOString(),
      isLocalDownload: true
    };
  }
}

/** Direct client-side CSV export of store orders. */
export function exportOrdersCsvClient(orders = []) {
  const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Items', 'Total ($)', 'Status', 'Notes'];
  const rows = orders.map((o) => [
    o.id || '',
    o.createdAt || '',
    `"${(o.name || '').replace(/"/g, '""')}"`,
    `"${(o.email || '').replace(/"/g, '""')}"`,
    `"${(o.phone || '').replace(/"/g, '""')}"`,
    `"${(o.items || []).map((i) => `${i.qty}x ${i.title}`).join('; ').replace(/"/g, '""')}"`,
    (o.total || 0).toFixed(2),
    o.status || 'new',
    `"${(o.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `adges-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
