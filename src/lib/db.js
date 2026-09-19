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

export async function addItem(collectionName, data) {
  const clean = sanitizeData(data);
  return addDoc(collection(db, collectionName), clean);
}

export async function updateItem(collectionName, id, data) {
  const clean = sanitizeData(data);
  return updateDoc(doc(db, collectionName, id), clean);
}

export async function deleteItem(collectionName, idOrItem) {
  if (!idOrItem) return Promise.resolve();
  const targetId = typeof idOrItem === 'string' ? idOrItem : idOrItem?.id;
  const targetName = typeof idOrItem === 'object' ? idOrItem?.name : null;
  const targetPosition = typeof idOrItem === 'object' ? (idOrItem?.position || idOrItem?.role) : null;

  const tasks = [];

  // 1. Direct document deletion by document ID
  if (targetId) {
    tasks.push(
      deleteDoc(doc(db, collectionName, String(targetId))).catch((err) => {
        console.warn(`[db] direct deleteDoc for ${collectionName}/${targetId}:`, err?.message);
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
              console.warn(`[db] scan delete failed for doc ${d.id}:`, e?.message);
            })
          );
        }
      });
      await Promise.allSettled(subTasks);
    } catch (err) {
      console.warn(`[db] query scan delete for ${collectionName}:`, err?.message);
    }
  })());

  return Promise.allSettled(tasks);
}

export async function isCollectionEmpty(collectionName) {
  try {
    const snap = await getDocs(query(collection(db, collectionName), fbLimit(1)));
    return snap.empty;
  } catch (e) {
    return true;
  }
}

export async function getDocData(path) {
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    return null;
  }
}

export async function setDocMerge(path, data) {
  const clean = sanitizeData(data);
  return setDoc(doc(db, path), clean, { merge: true });
}

export async function updateDocPath(path, data) {
  const clean = sanitizeData(data);
  return updateDoc(doc(db, path), clean);
}

export async function createOrder(order) {
  try {
    return await addDoc(collection(db, 'orders'), { ...order, createdAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[db] createOrder offline/demo fallback', err);
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
