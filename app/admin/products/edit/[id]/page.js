"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProduct() {
    const { id } = useParams();
    const router = useRouter();

    const [productForm, setProductForm] = useState({
        name: "", description: "", price: "", image: "", category: "", stock: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const headers = { authorization: token };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/${id}`, { headers });
                const p = res.data.product || res.data;
                setProductForm({
                    name: p.name || "",
                    description: p.description || "",
                    price: p.price || "",
                    image: p.image || "",
                    category: p.category || "",
                    stock: p.stock || "",
                });
            } catch (e) {
                alert("Product load nahi ho saka");
                router.push("/admin");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const res = await axios.put(`http://localhost:5000/api/products/${id}`, productForm, { headers });
            alert(res.data.message || "Product updated!");
            router.push("/admin");
        } catch (e) {
            alert(e.response?.data?.message || e.message);
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full border border-gray-200 px-4 py-3 rounded-xl outline-none text-sm text-black focus:border-[#D4AF37] transition";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F3F4F6]">
                <span className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] p-6">
            <div className="max-w-3xl mx-auto">

                <button
                    onClick={() => router.push("/admin")}
                    className="text-sm text-gray-500 hover:text-black mb-5 flex items-center gap-2"
                >
                    ← Back to Dashboard
                </button>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-5 text-black">Edit Product</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            placeholder="Product Name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className={inputCls}
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className={inputCls}
                        />
                        <input
                            placeholder="Image URL"
                            value={productForm.image}
                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                            className={inputCls}
                        />
                        <input
                            type="number"
                            placeholder="Stock Quantity"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                            className={inputCls}
                        />
                        <select
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            className={inputCls}
                        >
                            <option value="">Select Category</option>
                            <option>Men</option>
                            <option>Women</option>
                        </select>
                    </div>

                    <textarea
                        rows={4}
                        placeholder="Product Description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className={inputCls + " mt-4 resize-none"}
                    />

                    <div className="flex gap-3 mt-5">
                        <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-black font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition text-sm disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Update Product"}
                        </button>
                        <button
                            onClick={() => router.push("/admin")}
                            className="border border-gray-300 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition text-black"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}