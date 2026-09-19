import React, { useState } from 'react';
import { createOrder } from '../lib/db.js';

export default function CartDrawer({ open, onClose, cart, changeQty, clearCart }) {
  const [showForm, setShowForm] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  function handleClose() {
    setShowForm(false);
    setConfirmed(null);
    setErrorMsg('');
    onClose();
  }

  async function submitOrder(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await createOrder({
        items: cart.map((c) => ({ title: c.title, price: c.price, qty: c.qty })),
        total, name: name.trim(), email: email.trim(), phone: phone.trim(), notes: notes.trim(),
        status: 'new'
      });
      setConfirmed({ name, email });
      clearCart();
      setName(''); setEmail(''); setPhone(''); setNotes(''); setShowForm(false);
    } catch (err) {
      setErrorMsg('Could not submit your order right now. Please try again in a moment.');
    }
    setSubmitting(false);
  }

  if (!open) return null;

  return (
    <div className="cart-overlay open" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="cart-drawer">
        <button className="modal-close" style={{ position: 'static', alignSelf: 'flex-end' }} onClick={handleClose} aria-label="Close">&times;</button>
        <h3>Your cart</h3>

        {confirmed ? (
          <div className="order-confirm">
            <div className="tick">✓</div>
            <h3 style={{ fontSize: '1.1rem' }}>Order placed</h3>
            <p style={{ color: 'var(--ink-500)', marginTop: 8, fontSize: '.9rem' }}>
              Thanks, {confirmed.name || 'there'} — ADGES will reach out to {confirmed.email || 'you'} to arrange payment and pickup.
            </p>
          </div>
        ) : (
          <>
            {cart.length === 0 ? (
              <p className="cart-empty">Your cart is empty. Add something from the Store.</p>
            ) : (
              <>
                {cart.map((c) => (
                  <div className="cart-line" key={c.id}>
                    <div>
                      <div className="cart-line-name">{c.title}</div>
                      <div className="cart-line-sub">${c.price.toFixed(2)} each</div>
                    </div>
                    <div className="qty-controls">
                      <button className="qty-btn" type="button" onClick={() => changeQty(c.id, -1)}>−</button>
                      <span>{c.qty}</span>
                      <button className="qty-btn" type="button" onClick={() => changeQty(c.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="cart-total-row"><span>Total</span><span>${total.toFixed(2)}</span></div>

                {!showForm && (
                  <button className="admin-add-btn" style={{ marginTop: 18 }} onClick={() => setShowForm(true)}>
                    Proceed to order
                  </button>
                )}

                {showForm && (
                  <form className="checkout-form open" onSubmit={submitOrder}>
                    <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, margin: '14px 0 6px' }}>Full name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', border: '1px solid var(--line-strong)', borderRadius: 4, padding: '10px 12px', fontSize: '.9rem' }} />
                    <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, margin: '14px 0 6px' }}>Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', border: '1px solid var(--line-strong)', borderRadius: 4, padding: '10px 12px', fontSize: '.9rem' }} />
                    <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, margin: '14px 0 6px' }}>Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', border: '1px solid var(--line-strong)', borderRadius: 4, padding: '10px 12px', fontSize: '.9rem' }} />
                    <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, margin: '14px 0 6px' }}>Notes (size, pickup preference, etc.)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      style={{ width: '100%', border: '1px solid var(--line-strong)', borderRadius: 4, padding: '10px 12px', fontSize: '.9rem', minHeight: 70 }} />
                    <p className="form-msg">No payment is collected here — ADGES will contact you to arrange payment and pickup.</p>
                    {errorMsg && <p style={{ color: '#c53030', fontSize: '.85rem', margin: '8px 0' }}>{errorMsg}</p>}
                    <div className="admin-form-actions">
                      <button type="submit" className="admin-btn-primary" disabled={submitting}>
                        {submitting ? 'Placing order…' : 'Place order'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
