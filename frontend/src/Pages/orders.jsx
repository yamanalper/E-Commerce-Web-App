import { useEffect, useState } from 'react';
import { AxiosWithAuth } from '../../utils/AxiosWithAuth';
import './orders.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Orders() {
    const [orderList, setOrderList] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            window.alert(error);
        }
    }, [error]);

    const getOrders = async () => {
        try {
            const response = await AxiosWithAuth().get("/orders");
            setOrderList(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.code === "ERR_CANCELED") return;
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('token');
                    setError("Session expired. Please log in again.");
                    if (navigate) navigate('/login');
                    return;
                }
            }
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getOrders();
    }, [])

    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="ordersHeader">
            {<h1>Your Orders</h1>}
            <div className="ordersBody">
                {orderList && orderList.length > 0 ? (
                    orderList.map(order => (
                        <div key={order.id} className="orderItem">
                            <h2>Order ID: {order.id}</h2>
                            <p>Date : {new Date(order.created_at).toLocaleDateString()}</p>
                            <p>Status : {order.status}</p>
                            <p>Total Amount: ${order.total_price}</p>
                            <div className="orderProducts">
                                <h3>Products:</h3>
                                <ul>
                                    {order.order_items.map(product => (
                                        <li key={product.id}>
                                            {product.title} : ${product.price} x {product.quantity} {<span> - Status: {product.status}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You have no orders.</p>
                )}
            </div>
        </div>

    )

}