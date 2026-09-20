// Firestore data-access layer. This replaces the Claude Artifact `db` capability
// (collection/doc/onSnapshot) with the equivalent Firebase Firestore v9 modular SDK calls.
// The shape is intentionally similar — collections of documents, live subscriptions —
// so the CRUD logic in the components ports over with minimal changes.
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit as fbLimit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/** Subscribe to a collection, optionally ordered, calling onData(items) on every change. */
export function subscribeCollection(name, { orderByField, orderDirection = 'asc', onData, onError }) {
  try {
    const colRef = collection(db, name);
    const q = orderByField ? query(colRef, orderBy(orderByField, orderDirection)) : colRef;
    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (err) => { console.warn(`[db] ${name} subscription error`, err); onError && onError(err); }
    );
  } catch (err) {
    console.warn(`[db] ${name} subscription init error`, err);
    onError && onError(err);
    return () => {};
  }
}

/** Subscribe to a single document (e.g. site/content), calling onData(data|null) on every change. */
export function subscribeDoc(path, onData, onError) {
  try {
    return onSnapshot(
      doc(db, path),
      (snap) => onData(snap.exists() ? snap.data() : null),
      (err) => { console.warn(`[db] doc ${path} subscription error`, err); onError && onError(err); }
    );
  } catch (err) {
    console.warn(`[db] doc ${path} subscription init error`, err);
    onError && onError(err);
    return () => {};
  }
}

function sanitizeData(data) {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) return data.map(sanitizeData);
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      out[k] = sanitizeData(v);
    }
  }
  return out;
}

/**
 * Translates Firebase / network errors into clear, actionable UI messages.
 */
export function formatAdminErrorMessage(err, actionDescription = 'save changes') {
  if (!err) return `Failed to ${actionDescription}. Please try again.`;
  const code = err.code || '';
  const rawMsg = err.message || '';

  if (code === 'permission-denied' || rawMsg.includes('permission') || rawMsg.includes('insufficient permissions')) {
    return `Permission Denied: Your account does not have write access to update this content in Firestore. Please ensure you are logged in with authorized admin credentials.`;
  }
  if (code === 'unavailable' || rawMsg.includes('network') || rawMsg.includes('offline')) {
    return `Network Unavailable: Unable to connect to Firestore. Please check your internet connection and try again.`;
  }
  if (code === 'not-found') {
    return `Document Not Found: The database record you are trying to update does not exist or has already been removed.`;
  }
  if (code === 'resource-exhausted' || code === 'quota-exceeded') {
    return `Firestore Quota Limit: Database request quota exceeded. Please wait a few moments before trying again.`;
  }
  if (code === 'deadline-exceeded' || rawMsg.includes('timeout')) {
    return `Request Timed Out: The database took too long to complete this update. Please try again.`;
  }
  if (code === 'unauthenticated') {
    return `Session Expired: You must be logged in to make administrative changes. Please sign in again.`;
  }
  if (code === 'invalid-argument') {
    return `Invalid Data: One or more fields contains invalid formatting: ${rawMsg}`;
  }

  return rawMsg || `Failed to ${actionDescription}. (Error: ${code || 'unknown'})`;
}

export async function addItem(collectionName, data) {
  const clean = sanitizeData(data);
  try {
    const docRef = await addDoc(collection(db, collectionName), clean);
    console.info(`[db:addItem] Successfully created item in "${collectionName}" with ID "${docRef.id}"`, {
      collection: collectionName,
      docId: docRef.id,
      timestamp: new Date().toISOString()
    });
    return docRef;
  } catch (err) {
    console.error(`[db:addItem] Failed to add document to collection "${collectionName}":`, {
      operation: 'addItem',
      collection: collectionName,
      payload: clean,
      errorCode: err?.code,
      errorMessage: err?.message,
      stack: err?.stack,
      rawError: err,
      timestamp: new Date().toISOString()
    });
    throw err;
  }
}

export async function updateItem(collectionName, id, data) {
  const clean = sanitizeData(data);
  const docId = String(id);
  try {
    await updateDoc(doc(db, collectionName, docId), clean);
    console.info(`[db:updateItem] Successfully updated document "${collectionName}/${docId}"`, {
      collection: collectionName,
      docId,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`[db:updateItem] Failed to update document "${collectionName}/${docId}":`, {
      operation: 'updateItem',
      collection: collectionName,
      docId,
      payload: clean,
      errorCode: err?.code,
      errorMessage: err?.message,
      stack: err?.stack,
      rawError: err,
      timestamp: new Date().toISOString()
    });
    throw err;
  }
}

export async function deleteItem(collectionName, idOrItem) {
  if (!idOrItem) return Promise.resolve();
  const targetId = typeof idOrItem === 'string' ? idOrItem : idOrItem?.id;
  const targetName = typeof idOrItem === 'object' ? idOrItem?.name : null;
  const targetPosition = typeof idOrItem === 'object' ? (idOrItem?.position || idOrItem?.role) : null;

  console.info(`[db:deleteItem] Initiating delete from "${collectionName}"`, {
    collection: collectionName,
    targetId,
    targetName,
    targetPosition,
    timestamp: new Date().toISOString()
  });

  const tasks = [];
  let deleteErrors = [];

  // 1. Direct document deletion by document ID
  if (targetId) {
    tasks.push(
      deleteDoc(doc(db, collectionName, String(targetId))).catch((err) => {
        console.warn(`[db:deleteItem] Direct deleteDoc failed for ${collectionName}/${targetId}:`, {
          collection: collectionName,
          targetId,
          errorCode: err?.code,
          errorMessage: err?.message,
          error: err
        });
        deleteErrors.push(err);
      })
    );
  }

  // 2. Scan collection documents to delete any documents matching id or name
  tasks.push((async () => {
    try {
      const snap = await getDocs(collection(db, collectionName));
      const subTasks = [];
      const cleanName = targetName ? String(targetName).trim().toLowerCase() : null;
      const cleanId = targetId ? String(targetId).trim().toLowerCase() : null;
      const cleanPos = targetPosition ? String(targetPosition).trim().toLowerCase() : null;

      snap.forEach((d) => {
        const data = d.data() || {};
        const docId = String(d.id || '').trim().toLowerCase();
        const dataId = data.id !== undefined && data.id !== null ? String(data.id).trim().toLowerCase() : null;
        const docName = data.name ? String(data.name).trim().toLowerCase() : null;
        const docPos = data.position ? String(data.position).trim().toLowerCase() : null;

        const idMatch = cleanId && (docId === cleanId || dataId === cleanId);
        const nameMatch = cleanName && docName && docName === cleanName;
        const posAndNameMatch = cleanPos && cleanName && docPos === cleanPos && docName === cleanName;

        if (idMatch || nameMatch || posAndNameMatch) {
          subTasks.push(
            deleteDoc(d.ref).catch((e) => {
              console.warn(`[db:deleteItem] Scan delete failed for doc ${d.id}:`, {
                docId: d.id,
                errorCode: e?.code,
                errorMessage: e?.message,
                error: e
              });
              deleteErrors.push(e);
            })
          );
        }
      });
      await Promise.allSettled(subTasks);
    } catch (err) {
      console.error(`[db:deleteItem] Query scan delete error for collection "${collectionName}":`, {
        collection: collectionName,
        errorCode: err?.code,
        errorMessage: err?.message,
        error: err
      });
      deleteErrors.push(err);
    }
  })());

  const results = await Promise.allSettled(tasks);
  if (deleteErrors.length > 0 && tasks.length > 0) {
    const isTotalFailure = deleteErrors.length >= tasks.length;
    if (isTotalFailure) {
      const primaryErr = deleteErrors[0];
      console.error(`[db:deleteItem] All delete operations failed for "${collectionName}":`, {
        collection: collectionName,
        targetId,
        errors: deleteErrors
      });
      throw primaryErr;
    }
  }

  return results;
}

export async function isCollectionEmpty(collectionName) {
  try {
    const snap = await getDocs(query(collection(db, collectionName), fbLimit(1)));
    return snap.empty;
  } catch (e) {
    console.warn(`[db:isCollectionEmpty] Error checking collection "${collectionName}":`, e?.message);
    return true;
  }
}

export async function getDocData(path) {
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn(`[db:getDocData] Error fetching document "${path}":`, {
      path,
      errorCode: e?.code,
      errorMessage: e?.message
    });
    return null;
  }
}

export async function setDocMerge(path, data) {
  const clean = sanitizeData(data);
  try {
    await setDoc(doc(db, path), clean, { merge: true });
    console.info(`[db:setDocMerge] Successfully saved document at "${path}"`, {
      path,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`[db:setDocMerge] Failed to set/merge document at "${path}":`, {
      operation: 'setDocMerge',
      path,
      payload: clean,
      errorCode: err?.code,
      errorMessage: err?.message,
      stack: err?.stack,
      rawError: err,
      timestamp: new Date().toISOString()
    });
    throw err;
  }
}

export async function updateDocPath(path, data) {
  const clean = sanitizeData(data);
  try {
    await updateDoc(doc(db, path), clean);
    console.info(`[db:updateDocPath] Successfully updated document at "${path}"`, {
      path,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`[db:updateDocPath] Failed to update document at "${path}":`, {
      operation: 'updateDocPath',
      path,
      payload: clean,
      errorCode: err?.code,
      errorMessage: err?.message,
      stack: err?.stack,
      rawError: err,
      timestamp: new Date().toISOString()
    });
    throw err;
  }
}

export async function createOrder(order) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), { ...order, createdAt: new Date().toISOString() });
    console.info(`[db:createOrder] Order created in Firestore with ID "${docRef.id}"`);
    return docRef;
  } catch (err) {
    console.error('[db:createOrder] Failed to create order in Firestore, falling back to local storage:', {
      order,
      errorCode: err?.code,
      errorMessage: err?.message,
      error: err,
      timestamp: new Date().toISOString()
    });
    try {
      const existing = JSON.parse(localStorage.getItem('adges_demo_orders') || '[]');
      const newOrder = { ...order, id: 'demo-' + Date.now(), createdAt: new Date().toISOString() };
      existing.push(newOrder);
      localStorage.setItem('adges_demo_orders', JSON.stringify(existing));
      return newOrder;
    } catch {
      return { ...order, id: 'demo-' + Date.now() };
    }
  }
}

export { serverTimestamp };
