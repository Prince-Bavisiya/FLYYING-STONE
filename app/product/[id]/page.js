"use client";

import Navbar from "../../../components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useBag } from "../../../context/BagContext";
import { useWishlist } from "../../../context/WishlistContext";
import { toast } from "sonner";

export default function ProductDetails() {

    const { id } = useParams();
    const router = useRouter();
    const { addToBag } = useBag();
    const { isWishlisted, toggleWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("M");
    const [added, setAdded] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [wishlistAnim, setWishlistAnim] = useState(false);

    const sizes = ["S", "M", "L", "XL"];

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/products/${id}`)
            .then((res) => setProduct(res.data.product))
            .catch(console.log);
    }, [id]);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm text-gray-400 tracking-widest uppercase">
                Loading...
            </div>
        );
    }

    // ✅ Out of Stock check
    const isOutOfStock = product.stock === 0;

    const handleAddToBag = () => {
        if (isOutOfStock) {
            toast.error("This product is out of stock.");
            return;
        }

        addToBag({ ...product, size: selectedSize });

        toast.success("Added to Bag 🛍️", {
            description: `${product.name} has been added to your bag.`,
        });

        setAdded(true);

        setTimeout(() => setAdded(false), 2000);
    };

    const handleWishlist = () => {
        toggleWishlist(product);
        setWishlistAnim(true);
        setTimeout(() => setWishlistAnim(false), 300);
    };

    const wishlisted = isWishlisted(product.id);

    return (
        <div className="min-h-screen bg-white text-black">

            <Navbar />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-8 pt-4 pb-0">
                <p className="text-xs text-gray-400 tracking-[1px]">
                    HOME &nbsp;/&nbsp; {product.category?.toUpperCase()} &nbsp;/&nbsp;
                    <span className="text-black">{product.name}</span>
                </p>
            </div>

            <div className="max-w-7xl mx-auto py-8 px-8">
                <div className="grid lg:grid-cols-[1fr_1fr] gap-14 items-start">

                    {/* ── LEFT — Image ── */}
                    <div className="sticky top-6">
                        <div className="relative overflow-hidden bg-[#F7F7F7]">
                            <img
                                src={product.image}
                                alt={product.name}
                                className={`w-full h-[560px] object-cover hover:scale-105 transition-transform duration-700 ${isOutOfStock ? "opacity-50" : ""}`}
                            />

                            {/* ✅ Out of Stock Badge */}
                            {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black text-white text-sm font-bold tracking-[3px] px-6 py-2.5 uppercase">
                                        Out of Stock
                                    </div>
                                </div>
                            )}

                            {/* Wishlist Heart Button — on image top-right */}
                            <button
                                onClick={handleWishlist}
                                className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white shadow-md transition-all duration-200
                                    ${wishlistAnim ? "scale-125" : "scale-100"}
                                    hover:scale-110`}
                                title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                {wishlisted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF2E2E" className="w-5 h-5">
                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#EF2E2E" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT — Details ── */}
                    <div className="pt-2">

                        {/* Brand tag */}
                        <p className="text-xs tracking-[3px] text-gray-400 uppercase mb-2">
                            {product.category === "Men" ? "PREMIUM COLLECTION" : "LUXURY COLLECTION"}
                        </p>

                        {/* Name + Wishlist inline */}
                        <div className="flex items-start justify-between gap-3">
                            <h1 className="text-2xl font-bold text-black leading-tight flex-1">
                                {product.name}
                            </h1>

                            {/* Wishlist text button below name */}
                            <button
                                onClick={handleWishlist}
                                className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-gray-400 hover:text-[#EF2E2E] transition mt-1 flex-shrink-0"
                            >
                                {wishlisted ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF2E2E" className="w-4 h-4">
                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                        </svg>
                                        <span className="text-[#EF2E2E]">Wishlisted</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                        Wishlist
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                <span>★</span>
                                <span>4.8</span>
                            </div>
                            <span className="text-xs text-gray-500">265 Ratings &nbsp;|&nbsp; 84 Reviews</span>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100 my-5" />

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-2xl font-bold text-black">
                                ₹{Math.round(Number(product.price)).toLocaleString("en-IN")}
                            </h2>
                            <span className="text-sm line-through text-gray-400">
                                ₹{Math.round(Number(product.price) * 1.3).toLocaleString("en-IN")}
                            </span>
                            <span className="text-sm text-green-600 font-semibold">23% OFF</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes. Free delivery.</p>

                        <div className="w-full h-[1px] bg-gray-100 my-5" />

                        {/* Size */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold tracking-[2px] uppercase">Select Size</p>
                                <button
                                    onClick={() => setShowSizeGuide(true)}
                                    className="text-xs text-[#EF2E2E] font-semibold tracking-[1px] underline underline-offset-2 cursor-pointer hover:text-black transition"
                                >
                                    SIZE GUIDE
                                </button>
                            </div>
                            <div className="flex gap-3">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                                        disabled={isOutOfStock}
                                        className={`w-11 h-11 text-xs font-bold border transition-all duration-200
                                            ${isOutOfStock
                                                ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                                                : selectedSize === size
                                                    ? "bg-black text-white border-black"
                                                    : "bg-white text-black border-gray-300 hover:border-black"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100 my-5" />

                        {/* ✅ Out of Stock Notice */}
                        {isOutOfStock && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold tracking-[1px] uppercase">
                                ⚠ This product is currently out of stock
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">

                            {/* ✅ ADD TO BAG — disabled when out of stock */}
                            <button
                                onClick={handleAddToBag}
                                disabled={isOutOfStock}
                                className={`flex-1 h-12 text-xs font-bold tracking-[2px] uppercase transition-all duration-300
                                    ${isOutOfStock
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : added
                                            ? "bg-green-600 text-white"
                                            : "bg-[#EF2E2E] hover:bg-black text-white"
                                    }`}
                            >
                                {isOutOfStock ? "OUT OF STOCK" : added ? "✓ ADDED TO BAG" : "ADD TO BAG"}
                            </button>

                            {/* ✅ BUY NOW — disabled when out of stock */}
                            <button
                                disabled={isOutOfStock}
                                onClick={() => {
                                    if (isOutOfStock) return;
                                    const token = localStorage.getItem("token");
                                    sessionStorage.setItem("buyNowProduct", JSON.stringify({ ...product, size: selectedSize, quantity: 1 }));
                                    if (!token) {
                                        router.push("/profile?redirect=/checkout?buyNow=true");
                                    } else {
                                        router.push("/checkout?buyNow=true");
                                    }
                                }}
                                className={`flex-1 h-12 text-xs font-bold tracking-[2px] uppercase transition-all duration-300
                                    ${isOutOfStock
                                        ? "border border-gray-200 text-gray-400 cursor-not-allowed"
                                        : "border border-black hover:bg-black hover:text-white"
                                    }`}
                            >
                                BUY NOW
                            </button>
                        </div>

                        {/* Delivery info */}
                        <div className="grid grid-cols-3 gap-3 mt-5">
                            {[
                                { icon: "🚚", text: "Free Delivery" },
                                { icon: "↩", text: "7 Day Return" },
                                { icon: "🔒", text: "Secure Payment" },
                            ].map((f) => (
                                <div key={f.text} className="border border-gray-100 p-3 text-center">
                                    <p className="text-base">{f.icon}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 font-medium tracking-[1px]">{f.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="w-full h-[1px] bg-gray-100 my-5" />

                        {/* Description */}
                        <div>
                            <p className="text-xs font-bold tracking-[2px] uppercase mb-3">Product Description</p>
                            <p className="text-sm text-gray-500 leading-7">{product.description}</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* SIZE GUIDE MODAL */}
            {showSizeGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSizeGuide(false)}>
                    <div className="bg-white w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold tracking-[2px] uppercase">Size Guide</h3>
                            <button onClick={() => setShowSizeGuide(false)} className="text-gray-400 hover:text-black text-xl font-light">✕</button>
                        </div>

                        <table className="w-full text-xs text-center border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-200 px-4 py-2.5 font-bold text-left">Size</th>
                                    <th className="border border-gray-200 px-4 py-2.5 font-bold">Chest (in)</th>
                                    <th className="border border-gray-200 px-4 py-2.5 font-bold">Waist (in)</th>
                                    <th className="border border-gray-200 px-4 py-2.5 font-bold">Hip (in)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { size: "S", chest: "34–36", waist: "28–30", hip: "36–38" },
                                    { size: "M", chest: "38–40", waist: "32–34", hip: "40–42" },
                                    { size: "L", chest: "42–44", waist: "36–38", hip: "44–46" },
                                    { size: "XL", chest: "46–48", waist: "40–42", hip: "48–50" },
                                ].map((row) => (
                                    <tr key={row.size} className="hover:bg-gray-50">
                                        <td className="border border-gray-200 px-4 py-2.5 font-bold text-left">{row.size}</td>
                                        <td className="border border-gray-200 px-4 py-2.5 text-gray-600">{row.chest}</td>
                                        <td className="border border-gray-200 px-4 py-2.5 text-gray-600">{row.waist}</td>
                                        <td className="border border-gray-200 px-4 py-2.5 text-gray-600">{row.hip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className="text-[10px] text-gray-400 mt-4 leading-5">
                            Measurements are in inches. If you're between sizes, we recommend sizing up for a comfortable fit.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}