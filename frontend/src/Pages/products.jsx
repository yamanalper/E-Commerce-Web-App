import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import { useEffect, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import "./products.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            window.alert(error);
        }
    }, [error]);

    useEffect(() => {
        (async () => {
            try {
                const response = await AxiosWithAuth().get("/products");
                setProducts(Array.isArray(response.data) ? response.data : []);
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
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="productsPage">
            <div className="productsHeader">
                <h2>Products</h2>
            </div>
            <div className="productsGrid">
                {loading && (
                    <div className="productsEmpty" style={{ gridColumn: "1/-1" }}>
                        Loading...
                    </div>
                )}
                {!loading && error && (
                    <div className="productsEmpty" style={{ gridColumn: "1/-1", color: "#dc2626" }}>
                        {error}
                    </div>
                )}
                {!loading && !error && products.length === 0 && (
                    <div className="productsEmpty">No products available</div>
                )}
                {!loading && !error &&
                    products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
        </div>
    );
}
