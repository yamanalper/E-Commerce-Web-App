import { useForm, useFieldArray } from 'react-hook-form';
import './admin_edit_products.css';
import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import { useEffect, useState, useMemo } from 'react';
import { Cloudinary } from '@cloudinary/url-gen/index';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { extractPublicId } from '../components/ProductCard';
import { useParams } from 'react-router-dom';


export function EditProducts() {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            price: "",
            stock: "",
            category_id: "",
            product_images: [""], // start with one empty field
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'product_images'
    });

    const product_id = useParams().product_id;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productDetail, setProductDetail] = useState(null);
    const [idx, setIdx] = useState(0);
    const cld = new Cloudinary({ cloud: { cloudName: 'dscme9aus' } });

    useEffect(() => {
        loadProduct();
    }, [product_id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await AxiosWithAuth().get(`/products/${product_id}`);
            setProductDetail(response.data);
            const formValues = {
                title: response.data.title ?? "",
                description: response.data.description ?? "",
                price: response.data.price ?? "",
                stock: response.data.stock ?? "",
                category_id: response.data.category_id ?? "",
                product_images: (response.data.product_images || []).map(img => img.image_url).filter(Boolean)
            };
            if (formValues.product_images.length === 0) formValues.product_images = [""];
            reset(formValues);
            setIdx(0);
        } catch (err) {
            console.error('Error fetching product detail:', err);
            setError('Failed to load product details.');
        } finally {
            setLoading(false);
        }
    };

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);

    const handleEditSubmit = async (data) => {
        const payload = {};
        if (data.title !== undefined && data.title !== "") payload.title = data.title;
        if (data.description !== undefined && data.description !== "") payload.description = data.description;
        if (data.price !== undefined && data.price !== "") payload.price = parseInt(data.price, 10);
        if (data.stock !== undefined && data.stock !== "") payload.stock = parseInt(data.stock, 10);
        if (data.category_id !== undefined && data.category_id !== "") payload.category_id = parseInt(data.category_id, 10);
        if (Array.isArray(data.product_images)) {
            payload.product_images = data.product_images
                .map(url => url.trim())
                .filter(url => url.length > 0);
        }
        try {
            setSaving(true);
            setSaveMessage(null);
            const response = await AxiosWithAuth().post(`/admin/products/edit/${product_id}`, payload);
            // Update state with fresh data from backend
            setProductDetail(response.data);
            // Reset form with returned values
            const updated = {
                title: response.data.title ?? "",
                description: response.data.description ?? "",
                price: response.data.price ?? "",
                stock: response.data.stock ?? "",
                category_id: response.data.category_id ?? "",
                product_images: (response.data.product_images || []).map(img => img.image_url).filter(Boolean)
            };
            if (updated.product_images.length === 0) updated.product_images = [""];
            reset(updated);
            setIdx(0);
            setSaveMessage("Saved");
        } catch (error) {
            console.error('Error editing product:', error);
            setSaveMessage("Save failed");
        } finally {
            setSaving(false);
            // Optionally re-fetch to ensure relations are fresh
            // await loadProduct(); // uncomment if you suspect stale relation caching
        }
    };


    const FieldRow = ({ label, name, type = "text", register, errors }) => (
        <div className="formRow">
            <label htmlFor={name}>{label}:</label>
            <input
                id={name}
                type={type}
                {...register(name, { required: false })}
            />
            {errors[name] && <span className="error">{errors[name].message}</span>}
        </div>
    );

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

    return (
        <div className="editProductPage">
            <div className="productInfo">
                <h3>Current Product Info</h3>
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : !productDetail ? (
                    <div className="error">Product not found</div>
                ) : (
                    <div className="infoGrid">
                        <div className="infoText">
                            <h2>{productDetail.title}</h2>
                            <p className="desc">{productDetail.description || "No description"}</p>
                        </div>
                        <div className="infoImage">
                            {images.length > 0 ? (
                                <div className="imageFrame">
                                    {cldImg ? (
                                        <AdvancedImage cldImg={cldImg} className="productImage" />
                                    ) : (
                                        <div className="placeholder">No Image</div>
                                    )}
                                    {images.length > 1 && (
                                        <>
                                            <button type="button" className="carouselNav prev" onClick={prev} aria-label="Previous image">‹</button>
                                            <button type="button" className="carouselNav next" onClick={next} aria-label="Next image">›</button>
                                        </>
                                    )}
                                </div>
                            ) : <div className="placeholder">No images</div>}
                        </div>
                        <div className="infoMeta">
                            <span className="priceLabel">${productDetail.price}</span>
                            <span className="stockLabel">Stock: {productDetail.stock}</span>
                        </div>
                    </div>
                )}

            </div>
            <h2>Edit Product</h2>
            <div className="editProductForm">
                <FieldRow label="Title" name="title" register={register} errors={errors} />
                <FieldRow label="Description" name="description" register={register} errors={errors} />
                <FieldRow label="Price" name="price" type="number" register={register} errors={errors} />
                <FieldRow label="Stock" name="stock" type="number" register={register} errors={errors} />
                <FieldRow label="Category ID" name="category_id" type="number" register={register} errors={errors} />
                <div className="formRow">
                    <label>Product Images:</label>
                    <div className="imageList">
                        {fields.map((field, index) => (
                            <div key={field.id} className="imageRow">
                                <span className="imgIndex">{index + 1}.</span>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    {...register(`product_images.${index}`)}
                                />
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        className="removeImgBtn"
                                        onClick={() => remove(index)}
                                        aria-label="Remove image"
                                    >✕</button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="addImgBtn"
                            onClick={() => append("")}
                        >+ Add Image URL</button>
                    </div>
                </div>
                <button onClick={handleSubmit(handleEditSubmit)} disabled={isSubmitting || saving}>
                    {saving || isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                {saveMessage && <span className={`saveMsg ${saveMessage === 'Saved' ? 'ok' : 'err'}`}>{saveMessage}</span>}
            </div>
        </div>
    )
}