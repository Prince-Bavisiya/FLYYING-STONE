"use client";

import { useRouter } from "next/navigation";
import { useBag } from "../../context/BagContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Bag() {

    const router = useRouter();

    const {
        products,
        loading,
        increaseQuantity,
        decreaseQuantity,
        removeFromBag,
    } = useBag();

    const {
        isWishlisted,
        toggleWishlist,
    } = useWishlist();

    const totalPrice = products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const totalItems = products.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <p className="text-sm text-gray-400 tracking-widest uppercase">
                    Loading...
                </p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">👜</div>

                <h2 className="text-xl font-black text-[#0F172A]">
                    Your Bag is Empty
                </h2>

                <p className="text-sm text-gray-400">
                    Add items to get started
                </p>

                <button
                    onClick={() => router.push("/")}
                    className="mt-3 bg-[#FF3E6C] text-white text-xs font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-[#e8325c] transition"
                >
                    CONTINUE SHOPPING
                </button>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#F8F9FA]">

            {/* Page Header */}
            <div className="bg-white border-b border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-black text-[#0F172A] tracking-tight">My Bag</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{totalItems} item{totalItems > 1 ? "s" : ""} in your bag</p>
                    </div>
                    <button onClick={() => router.push("/")}
                        className="text-xs font-bold text-[#FF3E6C] hover:underline underline-offset-2 tracking-wider uppercase">
                        ← Continue Shopping
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">

                    {/* ── LEFT — Items ── */}
                    <div className="space-y-3">

                        {products.map((item) => (
                            <div key={`${item.id}-${item.size}`}
                                className="bg-white border border-[#E5E7EB] p-3 sm:p-4 flex gap-3 sm:gap-4">

                                {/* Product Image */}
                                <div className="flex-shrink-0 w-20 h-24 sm:w-28 sm:h-32 bg-[#F8F9FA] overflow-hidden">
                                    <img src={item.image} alt={item.name}
                                        className="w-full h-full object-cover" />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold tracking-widest uppercase mb-0.5">
                                                {item.category === "Men" ? "Premium Collection" : "Luxury Collection"}
                                            </p>
                                            <h3 className="text-xs sm:text-sm font-black text-[#0F172A] leading-tight">{item.name}</h3>
                                        </div>
                                        <p className="text-xs sm:text-sm font-black text-[#0F172A] flex-shrink-0">
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    {/* Size + Return */}
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] sm:text-xs text-gray-500 border border-[#E5E7EB] px-2 py-0.5 font-semibold">
                                            Size: {item.size}
                                        </span>
                                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">↩ 7 Day Return</span>
                                    </div>

                                    {/* Unit Price */}
                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                                        ₹{Math.round(Number(item.price)).toLocaleString("en-IN")} × {item.quantity}
                                    </p>

                                    {/* Quantity + Remove + Wishlist */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                        <div className="flex items-center border border-[#E5E7EB]">
                                            <button onClick={() => decreaseQuantity(item.id, item.size)}
                                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#0F172A] hover:bg-[#F8F9FA] transition text-sm font-bold">
                                                −
                                            </button>
                                            <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-bold text-[#0F172A]">
                                                {item.quantity}
                                            </span>
                                            <button onClick={() => increaseQuantity(item.id, item.size)}
                                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#0F172A] hover:bg-[#F8F9FA] transition text-sm font-bold">
                                                +
                                            </button>
                                        </div>

                                        <button onClick={() => removeFromBag(item.id, item.size)}
                                            className="text-xs font-bold text-gray-400 hover:text-red-500 transition uppercase tracking-wider">
                                            Remove
                                        </button>

                                        {/* ── Working Wishlist Button ── */}
                                        <button
                                            onClick={() => toggleWishlist(item)}
                                            className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition
                                                ${isWishlisted(item.id)
                                                    ? "text-[#FF3E6C]"
                                                    : "text-gray-400 hover:text-[#FF3E6C]"
                                                }`}
                                        >
                                            {isWishlisted(item.id) ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg>
                                            )}
                                            {isWishlisted(item.id) ? "Wishlisted" : "Wishlist"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Delivery Info */}
                        <div className="bg-white border border-[#E5E7EB] p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-50 flex items-center justify-center text-sm">🚚</div>
                                <div>
                                    <p className="text-sm font-bold text-[#0F172A]">Free Delivery</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Estimated delivery: 3–5 business days</p>
                                </div>
                                <span className="ml-auto text-xs font-bold text-green-600">FREE</span>
                            </div>
                        </div>

                    </div>

                    {/* ── RIGHT — Price Summary ── */}
                    <div className="lg:sticky lg:top-6 space-y-3">

                        {/* Summary Card */}
                        <div className="bg-white border border-[#E5E7EB]">
                            <div className="px-5 py-4 border-b border-[#E5E7EB]">
                                <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Price Details</h2>
                                <p className="text-[10px] text-gray-400 mt-0.5">({totalItems} item{totalItems > 1 ? "s" : ""})</p>
                            </div>

                            <div className="px-5 py-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total MRP</span>
                                    <span className="text-[#0F172A] font-semibold">₹{totalPrice.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount on MRP</span>
                                    <span className="text-green-600 font-semibold">₹0</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                </div>
                            </div>

                            <div className="px-5 py-4 border-t border-[#E5E7EB] flex justify-between items-center">
                                <span className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Total Amount</span>
                                <span className="text-lg font-black text-[#0F172A]">₹{totalPrice.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        {/* ✅ CTA — PLACE ORDER with correct redirect logic */}
                        <button
                            onClick={() => {
                                const token = localStorage.getItem("token");

                                if (!token) {
                                    // ✅ Not logged in → go to profile/login with redirect back to checkout
                                    router.push("/profile?redirect=/checkout");
                                    return;
                                }

                                // ✅ Already logged in → go directly to checkout
                                router.push("/checkout");
                            }}
                            className="w-full bg-[#FF3E6C] hover:bg-[#e8325c] text-white py-4 text-sm font-black tracking-widest uppercase transition"
                        >
                            PLACE ORDER
                        </button>

                        {/* Trust Badges */}
                        <div className="bg-white border border-[#E5E7EB] p-4">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                {[
                                    { icon: "🔒", text: "Secure Payment" },
                                    { icon: "↩️", text: "Easy Returns" },
                                    { icon: "✅", text: "100% Authentic" },
                                ].map(b => (
                                    <div key={b.text}>
                                        <p className="text-lg">{b.icon}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1 leading-tight">{b.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}