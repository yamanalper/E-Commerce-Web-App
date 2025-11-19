import { useState, useMemo } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import { useNavigate } from "react-router-dom";
import './ProductCard.css';

const cld = new Cloudinary({ cloud: { cloudName: "dscme9aus" } });


export function extractPublicId(possibleUrl) {
    if (!possibleUrl) return null;

    if (!/^https?:\/\//i.test(possibleUrl)) {
        return possibleUrl.replace(/^\/+/, "").replace(/\.[^.]+$/, "");
    }
    const match = possibleUrl.match(/\/image\/upload\/(?:v\d+\/)?([^?#]+)$/i);
    if (!match) return null;
    return match[1].replace(/\.[^.]+$/, "");
}

export function ProductCard({ product }) {
    const navigate = useNavigate();
    const images = product.product_images || [];
    const [idx, setIdx] = useState(0);

    const activeImage = images[idx];
    const publicId = activeImage ? extractPublicId(activeImage.image_url) : null;

    const cldImg = useMemo(() => {
        if (!publicId) return null;
        return cld
            .image(publicId)
            .format("auto")
            .quality("auto")
            .resize(fill().width(250).height(250).gravity(autoGravity()));
    }, [publicId]);

    const next = () =>
        setIdx((i) => (images.length > 0 ? (i + 1) % images.length : 0));
    const prev = () =>
        setIdx((i) =>
            images.length > 0 ? (i - 1 + images.length) % images.length : 0
        );

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
        }
    };


    return (
        <div className="productCard">
            <div className="imageWrap">
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="carouselNav prev"
                            onClick={prev}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="carouselNav next"
                            onClick={next}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </>
                )}

                {cldImg ? (
                    <AdvancedImage cldImg={cldImg} className="active" role="button" onClick={handleCardClick} />
                ) : activeImage?.image_url ? (
                    <img
                        src={activeImage.image_url}
                        alt={product.title}
                        className="active"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
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

            <div className="productBody" role="button" onClick={handleCardClick}>
                <h3>{product.title}</h3>
                <p className="productDesc">
                    {product.description || <span style={{ opacity: 0.5 }}>No description</span>}
                </p>
                <div className="productMeta">
                    <span className="productPrice">${product.price}</span>
                    <span className="productStock">Stock: {product.stock}</span>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;