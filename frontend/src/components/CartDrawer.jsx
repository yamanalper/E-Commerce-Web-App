import { useEffect, useState } from 'react';
import { AxiosWithAuth } from '../../utils/AxiosWithAuth';
import './CartDrawer.css';

export default function CartDrawer({ open, onClose, goCart }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart when opened
    useEffect(() => {
        if (!open) return;
        let ignore = false;
        (async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            try {
                const res = await AxiosWithAuth().get('/cart');
                if (!ignore) setCartItems(res.data || []);
            } catch (err) {
                if (!ignore) {
                    console.error('Cart fetch error:', err);
                    const errorMsg = err.response?.status === 401
                        ? 'Please log in to view your cart.'
                        : err.response?.data?.message || 'Failed to load cart.';
                    setError(errorMsg);
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, [open]);

    // Keyboard close
    useEffect(() => {
        if (!open) return;
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const refetchCart = async () => {
        try { const r = await AxiosWithAuth().get('/cart'); setCartItems(r.data || []); } catch { }
    };

    const optimistic = (productId, delta) => {
        setCartItems(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
    };

    const handleIncrease = async (productId) => {
        optimistic(productId, +1);
        try {
            const { data } = await AxiosWithAuth().post(`/cart/increase/${productId}`);
            if (data?.quantity !== undefined) optimistic(productId, data.quantity - cartItems.find(i => i.product_id === productId)?.quantity - 1); // adjust to server value
        } catch { setError('Failed to update item quantity.'); refetchCart(); }
    };

    const handleDecrease = async (productId) => {
        optimistic(productId, -1);
        try {
            const { data } = await AxiosWithAuth().post(`/cart/decrease/${productId}`);
            if (data?.quantity !== undefined) refetchCart();
        } catch { setError('Failed to update item quantity.'); refetchCart(); }
    };

    const handleRemove = async (productId) => {
        const snapshot = cartItems;
        setCartItems(prev => prev.filter(i => i.product_id !== productId));
        try { await AxiosWithAuth().delete(`/cart/delete_item/${productId}`); }
        catch { setCartItems(snapshot); setError('Failed to remove item.'); }
    };

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);

    return (
        <div className={`cartDrawerOverlay ${open ? 'open' : ''}`}>
            <button className="cartDrawerBackdrop" aria-label="Close cart" onClick={onClose}></button>
            <aside className={`cartDrawerPanel ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Shopping cart">
                <div className="cartDrawer__header">
                    <h2>Your Cart</h2>
                    <button onClick={onClose} className="closeBtn" aria-label="Close cart">✕</button>
                </div>
                <div className="cartDrawer__content">
                    {loading && <div className="cartLoading">Loading...</div>}
                    {error && <div className="cartError">{error}</div>}
                    {!loading && !error && cartItems.length === 0 && <div className="cartEmpty">Your cart is empty.</div>}
                    {!loading && !error && cartItems.length > 0 && (
                        <ul className="drawerCartList">
                            {cartItems.map(item => {
                                const lineTotal = (item.price * item.quantity).toFixed(2);
                                return (
                                    <li key={item.id || item.product_id} className="drawerItemCard">
                                        <div className="drawerItemMain">
                                            <h3 className="drawerItemTitle" title={item.title}>{item.title}</h3>
                                            <div className="drawerMetaRow">
                                                <span className="priceTag">${item.price}</span>
                                                <div className="drawerQtyPill" aria-label="Quantity selector">
                                                    <button type="button" aria-label="Decrease quantity" onClick={() => handleDecrease(item.product_id)} className="qtyBtn">−</button>
                                                    <span className="qtyVal" aria-live="polite">{item.quantity}</span>
                                                    <button type="button" aria-label="Increase quantity" onClick={() => handleIncrease(item.product_id)} className="qtyBtn">＋</button>
                                                </div>
                                                <button className="removeLine" onClick={() => handleRemove(item.product_id)} aria-label={`Remove ${item.title}`}>Remove</button>
                                            </div>
                                        </div>
                                        <div className="drawerLineTotal" aria-label="Line total">${lineTotal}</div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div className="cartDrawer__footer">
                    <div className="drawerSubtotalRow"><span>Subtotal</span><span>${subtotal}</span></div>
                    <button onClick={() => { onClose(); goCart(); }} className="btn btn-primary btn-block">Go to Cart</button>
                </div>
            </aside>
        </div>
    );
}
