import { useParams } from "react-router-dom";
import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import { useEffect, useState, useMemo } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import { extractPublicId } from "../components/ProductCard";
import "./product_detail.css";
import { useNavigate } from "react-router-dom";


export function ProductDetail() {
    const [productDetail, setProductDetail] = useState(null);
    const { product_id } = useParams();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const cld = new Cloudinary({ cloud: { cloudName: "dscme9aus" } });
    const [idx, setIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    const addToCart = (product) => {
        AxiosWithAuth().post(`/cart/add/${product.id}/${quantity}`)
            .then(response => {

            })
            .catch(error => {
                setError("Error adding product to cart:");
            });
    };


    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const response = await AxiosWithAuth().get(`/products/${product_id}`);
                setProductDetail(response.data);
                setIdx(0);
            } catch (err) {
                console.error("Error fetching product detail:", err);
                setError("Failed to load products, Invalid Authentication. Please Log In.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetail();
    }, [product_id]);

    const images = productDetail?.product_images || [];
    const activeImage = images[idx];
    const publicId = activeImage ? extractPublicId(activeImage.image_url) : null;

    const cldImg = useMemo(() => {
        if (!publicId) return null;
        return cld
            .image(publicId)
            .format("auto")
            .quality("auto")
            .resize(fill().width(400).height(400).gravity(autoGravity()));
    }, [publicId]);

    const next = () =>
        setIdx((i) => (images.length > 0 ? (i + 1) % images.length : 0));
    const prev = () =>
        setIdx((i) =>
            images.length > 0 ? (i - 1 + images.length) % images.length : 0
        );

    useEffect(() => {
        if (error) {
            window.alert(error);
        }
    }, [error]);

    const incrementQuantity = () => setQuantity((q) => q + 1);
    const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

    const getCart = () => {
        navigate("/cart");
    };

    if (loading) {
        return <div>Loading...
            {error && <div className="error">{error}</div>}
        </div>;
    }
    if (!loading && error) {
        return <div className="error">{error}</div>;
    }
    if (!loading && !error && !productDetail) {
        return <div className="productsEmpty" style={{ gridColumn: "1/-1" }}>
            Product not found
            {error && <div className="error">{error}</div>}
        </div>;
    }
    return (
        <div>
            <div className="productDetail">
                <div className="pdInfo">
                    <h1>{productDetail.title}</h1>
                    <p>{productDetail.description || "No description"}</p>
                    <p>Price: ${productDetail.price} | Stock: {productDetail.stock}</p>
                    <button onClick={() => addToCart(productDetail)}> Add to Cart </button> <button onClick={decrementQuantity}> - </button> {quantity} <button onClick={incrementQuantity}> + </button>

                    <div className="additionalInfo">
                        <h2>Additional Information</h2>
                    </div>
                </div>

                <div className="imageWrap pdImage">
                    {images.length > 1 && (
                        <>
                            <button type="button" className="carouselNav prev" onClick={prev} aria-label="Previous image">‹</button>
                            <button type="button" className="carouselNav next" onClick={next} aria-label="Next image">›</button>
                        </>
                    )}

                    {cldImg ? (
                        <AdvancedImage cldImg={cldImg} className="active" />
                    ) : activeImage?.image_url ? (
                        <img
                            src={activeImage.image_url}
                            alt={productDetail.title}
                            className="active"
                        />
                    ) : (
                        <div className="placeholder">No Image</div>
                    )}

                    {images.length > 1 && (
                        <div className="carouselDots">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={i === idx ? "active" : ""}
                                    aria-label={`Go to image ${i + 1}`}
                                    onClick={() => setIdx(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
}
