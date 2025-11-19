import React, { useEffect, useState } from 'react';
import { AxiosWithAuth } from '../../utils/AxiosWithAuth';
import { Navigate, useNavigate } from 'react-router-dom';

export function Admin() {
    const [error, setError] = useState(false);
    const [orders, setOrders] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await AxiosWithAuth().get('/admin');
                if (!cancelled) setOrders(response.data);
            } catch (error) {
                if (!cancelled) setError(true);
                if (error.response?.status === 403) {
                    if (!cancelled) setError(true);
                    navigate("/home");
                } else {
                    console.error('Error fetching admin data:', error);
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);
    if (error) return <div>Access Denied</div>;
    return (
        <div className='adminPage'>
            <h1>Admin Panel - Company Orders</h1>
            {orders ? (
                orders.length > 0 ? (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.title}</td>
                                        <td>{order.quantity}</td>
                                        <td>${order.price.toFixed(2)}</td>
                                        <td>{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="totalRevenue">
                            <h2>
                                Total Revenue: $
                                {orders.reduce((total, order) => total + (order.price * order.quantity), 0)?.toFixed(2) || '0.00'}
                            </h2>
                        </div>
                    </>
                ) : (
                    <p>No orders found for your company.</p>
                )
            ) : (
                <p>Loading orders...</p>
            )}
            <div className="editProductsButton">
                <button onClick={() => navigate('/admin/products')}>Edit Products</button>
            </div>
        </div>
    )
}