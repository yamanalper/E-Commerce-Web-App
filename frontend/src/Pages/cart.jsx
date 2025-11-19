import { useState, useEffect, useCallback } from "react";
import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import { useNavigate } from "react-router-dom";
import './cart.css';

export function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageMap, setImageMap] = useState({});
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const fetchImages = useCallback(async (items) => {
        try {
            const promises = items.map(async (it) => {
                try {
                    const res = await AxiosWithAuth().get(`/products/${it.product_id}`);
                    const first = res.data.product_images?.[0]?.image_url;
                    return { id: it.product_id, url: first || null };
                } catch {
                    return { id: it.product_id, url: null };
                }
            });
            const results = await Promise.all(promises);
            const m = {};
            results.forEach(r => { m[r.id] = r.url; });
            setImageMap(m);
        } catch { }
    }, []);

    const getCart = useCallback(async () => {
        try {
            setLoading(true);
            const response = await AxiosWithAuth().get(`/cart`);
            setCartItems(response.data || []);
            await fetchImages(response.data || []);
        } catch (e) {
            setError("Failed to load cart items.");
        } finally {
            setLoading(false);
        }
    }, [fetchImages]);

    useEffect(() => { getCart(); }, [getCart]);

    const deleteItem = (item) => async () => {
        try {
            await AxiosWithAuth().delete(`/cart/delete_item/${item.product_id}`);
            setCartItems(prev => prev.filter(i => i.id !== item.id));
        } catch {
            setError("Failed to remove item.");
        }
    };

    const handleIncrease = async (productId) => {
        const snapshot = cartItems;
        setCartItems(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i));
        try {
            await AxiosWithAuth().post(`/cart/increase/${productId}`);
        } catch {
            setCartItems(snapshot);
            setError("Failed to update quantity.");
        }
    };

    const handleDecrease = async (productId) => {
        const snapshot = cartItems;
        setCartItems(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
        try {
            await AxiosWithAuth().post(`/cart/decrease/${productId}`);
        } catch {
            setCartItems(snapshot);
            setError("Failed to update quantity.");
        }
    };

    const handleCheckout = () => {
        if (!cartItems.length) return setError("Your cart is empty.");
        navigate('/payment');
    };

    if (loading) return <div className="cartPageState">Loading cart...</div>;
    if (error) return <div className="cartPageState errorState">{error}</div>;

    return (
        <div className="cartPage">
            <h1 className="headingBar">Your Cart</h1>
            {cartItems.length === 0 ? (
                <div className="emptyCart">
                    <p>Your cart is empty.</p>
                    <button className="btn btn-primary btn-pill" onClick={() => navigate('/products')}>Browse Products</button>
                </div>
            ) : (
                <div className="cartLayout">
                    <div className="cartItemsList">
                        {cartItems.map(item => {
                            const img = imageMap[item.product_id];
                            return (
                                <div key={item.id} className="cartItemCard fade-in">
                                    <div className="thumbWrap">
                                        {img ? <img src={img} alt={item.title} /> : <span className="thumbFallback">{item.title.charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <div className="itemMain">
                                        <h3 className="itemTitle">{item.title}</h3>
                                        <div className="itemMeta">
                                            <span className="priceTag">${item.price}</span>
                                            <div className="qtyControls" aria-label="Quantity selector">
                                                <button type="button" aria-label="Decrease quantity" onClick={() => handleDecrease(item.product_id)}>−</button>
                                                <span className="qtyVal" aria-live="polite">{item.quantity}</span>
                                                <button type="button" aria-label="Increase quantity" onClick={() => handleIncrease(item.product_id)}>＋</button>
                                            </div>
                                        </div>
                                        <div className="itemActions">
                                            <button className="removeLine" onClick={deleteItem(item)} aria-label={`Remove ${item.title}`}>Remove</button>
                                        </div>
                                    </div>
                                    <div className="lineTotal">${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            );
                        })}
                    </div>
                    <aside className="summaryCard">
                        <h2>Summary</h2>
                        <div className="summaryRow"><span>Items</span><span>{cartItems.length}</span></div>
                        <div className="summaryRow"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="summaryRow"><span>Estimated Tax</span><span>$0.00</span></div>
                        <div className="divider"></div>
                        <div className="summaryTotal"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
                        <button className="btn btn-primary btn-pill checkoutBtn" disabled={!cartItems.length} onClick={handleCheckout}>Proceed to Checkout</button>
                    </aside>
                </div>
            )}
        </div>
    );
}

export default Cart;