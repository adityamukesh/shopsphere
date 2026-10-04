import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/format.js';

// Validates a 6-digit Indian pincode (must not start with 0)
const PINCODE_RE = /^[1-9][0-9]{5}$/;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(
    user?.address || { line1: '', city: '', state: '', pincode: '' }
  );
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [placing, setPlacing] = useState(false);

  const update = (key) => (e) => {
    const value = e.target.value;
    setAddress((a) => ({ ...a, [key]: value }));
    if (key === 'pincode') {
      if (value && !PINCODE_RE.test(value)) {
        setPincodeError('Enter a valid 6-digit Indian pincode (cannot start with 0)');
      } else {
        setPincodeError('');
      }
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    // Block submission if pincode is invalid
    if (!PINCODE_RE.test(address.pincode)) {
      setPincodeError('Enter a valid 6-digit Indian pincode (cannot start with 0)');
      return;
    }

    setPlacing(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        items: items.map(({ product, name, price, quantity }) => ({ product, name, price, quantity })),
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      navigate('/orders', { state: { placed: data._id } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) return <p className="muted">Nothing to check out.</p>;

  return (
    <section className="checkout">
      <form className="card form" onSubmit={placeOrder}>
        <h1>Shipping details</h1>
        <input required placeholder="Address line" value={address.line1} onChange={update('line1')} />
        <input required placeholder="City" value={address.city} onChange={update('city')} />
        <input required placeholder="State" value={address.state} onChange={update('state')} />

        <input
          required
          placeholder="Pincode"
          value={address.pincode}
          onChange={update('pincode')}
          maxLength={6}
          inputMode="numeric"
          pattern="[1-9][0-9]{5}"
        />
        {pincodeError && <p className="error" style={{ marginTop: -8 }}>{pincodeError}</p>}

        <label>Payment method</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="COD">Cash on delivery</option>
          <option value="ONLINE" disabled>Online payment (coming soon)</option>
        </select>

        {error && <p className="error">{error}</p>}
        <button className="btn full" disabled={placing || !!pincodeError}>
          {placing ? 'Placing order...' : `Place order · ${formatINR(totalPrice)}`}
        </button>
      </form>
    </section>
  );
}
