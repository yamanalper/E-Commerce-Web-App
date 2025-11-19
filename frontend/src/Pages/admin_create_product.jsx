import { useFieldArray, useForm } from "react-hook-form";
import { useState } from "react";
import { AxiosWithAuth } from "../../utils/AxiosWithAuth";

export function CreateProduct() {
    const [idx, setIdx] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
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
            product_images: [""],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'product_images'
    });

    const handleCreate = async (data) => {
        try {
            setLoading(true);
            const payload = {};
            payload.title = data.title;
            payload.description = data.description;
            payload.price = parseFloat(data.price);
            payload.stock = parseInt(data.stock);
            payload.category_id = parseInt(data.category_id);
            payload.product_images = data.product_images.filter(url => url.trim() !== "");
            const response = await AxiosWithAuth().post('/admin/products', payload);
            console.log('Product created:', response.data);
            reset();
        } catch (error) {
            console.error('Error creating product:', error);
            setError('Failed to create product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='adminPage'>
            <h1>Admin Panel - Create New Product</h1>
            <form className="createProductForm" onSubmit={handleSubmit(handleCreate)} noValidate>
                <label>
                    Title:
                    <input type="text" {...register("title", { required: "Title is required" })} />
                </label>
                {errors.title && <span className="fieldError">{errors.title.message}</span>}
                <label>
                    Description:
                    <input rows={3} {...register("description", { required: "Description is required" })} />
                </label>
                {errors.description && <span className="fieldError">{errors.description.message}</span>}
                <label>
                    Price:
                    <input type="number" step="0.01" inputMode="decimal" {...register("price", { required: "Price is required", validate: v => !isNaN(parseFloat(v)) || "Invalid number" })} />
                </label>
                {errors.price && <span className="fieldError">{errors.price.message}</span>}
                <label>
                    Stock:
                    <input type="number" {...register("stock", { required: "Stock is required", validate: v => !isNaN(parseInt(v)) || "Invalid integer" })} />
                </label>
                {errors.stock && <span className="fieldError">{errors.stock.message}</span>}
                <label>
                    Category ID:
                    <input type="number" {...register("category_id", { required: "Category id required", validate: v => !isNaN(parseInt(v)) || "Invalid id" })} />
                </label>
                {errors.category_id && <span className="fieldError">{errors.category_id.message}</span>}
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
                <button type="submit" disabled={isSubmitting || loading}>{loading ? "Creating..." : "Create Product"}</button>
                {error && <div className="formError">{error}</div>}
            </form>
        </div>
    );
}   