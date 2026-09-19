/**
 * Server-side API routes for the ADGES website.
 *
 * These replace the parts of the original Claude Artifact backend that had to run
 * server-side: exporting orders as a CSV file (previously the `downloads` capability)
 * and managing who is allowed to edit the site (previously `user.canEdit()`).
 *
 * Deploy with: firebase deploy --only functions
 * Local testing: firebase emulators:start --only functions,firestore,auth
 */

const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/** Verifies the caller's Firebase ID token and checks it against the admin allowlist. */
async function requireAdmin(idToken) {
  if (!idToken) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }
  const decoded = await admin.auth().verifyIdToken(idToken);
  const email = decoded.email;
  if (!email) {
    throw new HttpsError('permission-denied', 'Account has no email on file.');
  }
  const adminsDoc = await db.doc('meta/admins').get();
  const emails = adminsDoc.exists ? adminsDoc.data().emails || [] : [];
  if (!emails.includes(email)) {
    throw new HttpsError('permission-denied', 'Not an ADGES site editor.');
  }
  return { uid: decoded.uid, email };
}

/** Escapes one CSV cell per RFC 4180. */
function csvCell(value) {
  const s = String(value == null ? '' : value);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * GET /exportOrdersCsv
 * Header: Authorization: Bearer <Firebase ID token of a signed-in admin>
 * Returns: text/csv attachment of every order in the `orders` collection.
 *
 * This is the direct equivalent of the "Export CSV" button on the Orders admin page,
 * which previously used the Claude Artifact `downloads` capability.
 */
exports.exportOrdersCsv = onRequest({ cors: true }, async (req, res) => {
  try {
    const authHeader = req.get('Authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    await requireAdmin(idToken);

    const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const rows = [['Date', 'Name', 'Email', 'Phone', 'Items', 'Total', 'Notes', 'Status']];
    snap.forEach((doc) => {
      const o = doc.data();
      const itemsStr = (o.items || []).map((it) => `${it.qty}x ${it.title}`).join('; ');
      rows.push([
        o.createdAt || '',
        o.name || '',
        o.email || '',
        o.phone || '',
        itemsStr,
        (o.total || 0).toFixed(2),
        (o.notes || '').replace(/\n/g, ' '),
        o.status || 'new'
      ]);
    });
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="adges-orders.csv"');
    res.status(200).send(csv);
  } catch (err) {
    logger.error('exportOrdersCsv failed', err);
    const status = err instanceof HttpsError ? mapHttpsErrorStatus(err.code) : 500;
    res.status(status).json({ error: err.message || 'Internal error' });
  }
});

function mapHttpsErrorStatus(code) {
  switch (code) {
    case 'unauthenticated': return 401;
    case 'permission-denied': return 403;
    default: return 500;
  }
}

/**
 * Callable function: addAdmin({ email })
 * Lets an existing admin grant editor access to another email address.
 * The very first admin must be seeded manually — see README.md "First admin" section.
 */
exports.addAdmin = onCall(async (request) => {
  if (!request.auth || !request.auth.token.email) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }
  const callerEmail = request.auth.token.email;
  const adminsRef = db.doc('meta/admins');
  const adminsDoc = await adminsRef.get();
  const currentEmails = adminsDoc.exists ? adminsDoc.data().emails || [] : [];

  if (!currentEmails.includes(callerEmail)) {
    throw new HttpsError('permission-denied', 'Only existing editors can add new editors.');
  }
  const newEmail = (request.data && request.data.email || '').trim().toLowerCase();
  if (!newEmail || !newEmail.includes('@')) {
    throw new HttpsError('invalid-argument', 'A valid email address is required.');
  }
  await adminsRef.set(
    { emails: admin.firestore.FieldValue.arrayUnion(newEmail) },
    { merge: true }
  );
  logger.info(`${callerEmail} granted editor access to ${newEmail}`);
  return { ok: true, email: newEmail };
});

/**
 * Callable function: removeAdmin({ email })
 * Lets an existing admin revoke another editor's access. You cannot remove yourself
 * this way (to avoid accidentally locking everyone out) — do that from the console.
 */
exports.removeAdmin = onCall(async (request) => {
  if (!request.auth || !request.auth.token.email) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }
  const callerEmail = request.auth.token.email;
  const adminsRef = db.doc('meta/admins');
  const adminsDoc = await adminsRef.get();
  const currentEmails = adminsDoc.exists ? adminsDoc.data().emails || [] : [];

  if (!currentEmails.includes(callerEmail)) {
    throw new HttpsError('permission-denied', 'Only existing editors can remove editors.');
  }
  const targetEmail = (request.data && request.data.email || '').trim().toLowerCase();
  if (targetEmail === callerEmail) {
    throw new HttpsError('invalid-argument', 'Use the Firebase console to remove yourself.');
  }
  await adminsRef.set(
    { emails: admin.firestore.FieldValue.arrayRemove(targetEmail) },
    { merge: true }
  );
  return { ok: true };
});

/**
 * Firestore trigger: fires whenever a new order document is created.
 * Currently just logs it — this is the natural place to plug in an email/Slack
 * notification integration (e.g. via SendGrid or a Slack webhook) if you want ADGES
 * officers to be notified the moment someone places an order.
 */
exports.onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  const order = event.data.data();
  logger.info('New ADGES store order received', {
    orderId: event.params.orderId,
    buyer: order.email,
    total: order.total
  });
  // TODO: send a notification here (email/Slack/etc.) if desired.
});
