import { useState, useEffect } from "react";
import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import { useParams } from "react-router-dom";
import './search.css';
import { set } from "react-hook-form";


export function Search() {
    const { query: routeQuery = '' } = useParams();
    const [products, setProducts] = useState([]);
    const [text, setText] = useState(routeQuery);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!routeQuery) return;
        setText(routeQuery);
        let ignore = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await AxiosWithAuth().get(`/products/search/${encodeURIComponent(routeQuery)}`);
                if (!ignore) setProducts(data);
            } catch (err) {
                if (!ignore) setError('Failed to fetch products. Please try again.');
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, [routeQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        const term = text.trim();
        if (!term) return;
        window.location.hash = `#/products/search/${encodeURIComponent(term)}`;
    };

    return (
        <main className="searchPage">
            <h1>Search Products</h1>
            <form onSubmit={handleSearch} className="searchForm">
                <input
                    type="text"
                    placeholder="Enter product name..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    query={text}
                    aria-label="Search products"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="errorMessage">{error}</p>}

            <section className="searchResults">
                {products.length === 0 && !loading && !error && <p>No products found. Try a different search.</p>}
                {products.map(product => (
                    <div key={product.id} className="productCard">
                        {product.product_images && product.product_images[0] && (
                            <img src={product.product_images[0].image_url} alt={product.title} />
                        )}
                        <h2>{product.title}</h2>
                        <p>${product.price}</p>
                        <a href={`#/products/${product.id}`} className="viewBtn">View Details</a>
                    </div>
                ))}
            </section>
        </main>
    );
}