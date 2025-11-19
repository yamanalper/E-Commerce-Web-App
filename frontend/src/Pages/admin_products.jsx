import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './admin_products.css';


export function AdminProducts() {
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [products, setProducts] = useState(null);


    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await AxiosWithAuth().get('/admin/products');
                if (!cancelled) setProducts(response.data);
            } catch (error) {
                if (!cancelled) setError(true);
                if (error.response?.status === 403) {
                    if (!cancelled) setError(true);
                } else {
                    console.error('Error fetching admin products data:', error);
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleRemove = (productId) => async () => {
        try {
            const response = await AxiosWithAuth().delete(`/admin/products/${productId}`);
            console.log('Delete response:', response);
            setProducts(products.filter(product => product.id !== productId));
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    const handleEdit = (productId) => async () => {
        navigate(`/admin/products/edit/${productId}`);
    }

    const handleCreate = () => {
        navigate(`/admin/products/new`);
    }

    return (
        <div className='adminPage'>
            <h1>Admin Panel - Products</h1>
            {error && <div>Access Denied</div>}
            {products ? (
                products.length > 0 ? (
                    <div className="adminTableWrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product ID</th>
                                    <th>Title</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>{product.title}</td>
                                        <td>${product.price.toFixed(2)}</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <div className="actionButtons">
                                                <button onClick={handleEdit(product.id)}>Edit</button>
                                                <button onClick={handleRemove(product.id)}>Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="emptyState">No products found.</div>
                )
            ) : (
                !error && <div className="loadingState">Loading...</div>
            )}
            <div className="createProductButton">
                <button onClick={handleCreate}>Create New Product</button>
            </div>
        </div>
    )
}