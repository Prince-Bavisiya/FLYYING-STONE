"use client";

import { Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBag } from "../../context/BagContext";

function CheckoutContent() {
        const router = useRouter();
    const searchParams = useSearchParams();
            const { products, clearBag } = useBag();

    const isBuyNow = searchParams.get("buyNow") === "true";
    const buyNowProduct = typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("buyNowProduct"))
        : null;
    const checkoutProducts = isBuyNow ? (buyNowProduct ? [buyNowProduct] : []) : products;

    const [address, setAddress] = useState({
        fullName: "", phone: "", address: "", city: "", pincode: "",
    });
    const [notes, setNotes] = useState("");
    const [activeStep, setActiveStep] = useState(1);

    // ── Coupon state ──
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { coupon, discountAmount, finalAmount }
    const [couponError, setCouponError] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);

    // Login check — redirect if not logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/profile?redirect=/checkout");
        }
    }, []);

    // FIX 1: Address Auto-fill — prefer is_default address, fallback to first
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        axios.get(
            "/api/addresses",
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then((res) => {
                if (res.data.success && res.data.addresses.length > 0) {
                    // Pick default address first, else first address
                    const defaultAddr = res.data.addresses.find(a => a.is_default === 1 || a.is_default === true);
                    const a = defaultAddr || res.data.addresses[0];
                    setAddress({
                        fullName: a.full_name,
                        phone: a.phone,
                        address: a.address,
                        city: a.city,
                        pincode: a.pincode,
                    });
                }
            })
            .catch(console.error);
    }, []);

    const totalPrice = checkoutProducts.reduce(
        (total, item) => total + item.price * item.quantity, 0
    );

    // Final amount after coupon discount
    const finalTotal = appliedCoupon ? appliedCoupon.finalAmount : totalPrice;

    // FIX 2: Coupon Reset — cart change hone par coupon reset karo
    useEffect(() => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    }, [products]);

    const validateAddress = () => {
        if (!address.fullName || !address.phone || !address.address || !address.city || !address.pincode) {
            alert("Please fill all address details."); return false;
        }
        if (address.phone.length !== 10) { alert("Enter valid phone number."); return false; }
        if (address.pincode.length !== 6) { alert("Enter valid pincode."); return false; }
        return true;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "/api/coupons/apply",
                { code: couponCode.trim(), cartTotal: totalPrice },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAppliedCoupon(res.data);
        } catch (error) {
            setCouponError(error.response?.data?.message || "Invalid coupon code.");
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    const handlePayment = async () => {
        if (!validateAddress()) return;
        try {
            const order = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                products: checkoutProducts,
                total: totalPrice,
                discount: appliedCoupon?.discountAmount || 0,
                discountPercentage: appliedCoupon?.coupon?.discount_value || 0,
                finalTotal,
                couponCode: appliedCoupon?.coupon?.code || null,
                address,
                notes,
                payment: "card",
            };
            sessionStorage.setItem("pendingOrder", JSON.stringify(order));
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "/api/payment/create-checkout-session",
                {
                    products: checkoutProducts,
                    couponCode: appliedCoupon?.coupon?.code || null,
                    finalAmount: finalTotal,
                    customer: {
                        fullName: address.fullName,
                        phone: address.phone,
                        address: address.address,
                        city: address.city,
                        pincode: address.pincode,
                        notes,
                    }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
            if (!stripe) throw new Error("Stripe failed to load.");

            const result = await stripe.redirectToCheckout({ sessionId: response.data.id });
            if (result.error) throw new Error(result.error.message);

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.message || "Payment Failed. Please try again.");
        }
    };

    const inputClass = "w-full bg-white border border-[#eaeaec] rounded px-3 py-2 text-[#282C3F] text-xs placeholder:text-[#94969f] focus:outline-none focus:border-[#FF3F6C] focus:ring-1 focus:ring-[#FF3F6C]/10 transition-all duration-200";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .step-active { color: #FF3F6C; border-color: #FF3F6C; background: #fff0f4; }
        .step-done-circle { background: #FF3F6C; border-color: #FF3F6C; }
        .payment-card { transition: all 0.15s ease; cursor: pointer; }
        .payment-card:hover { border-color: #FF3F6C !important; }
        .payment-selected { border-color: #FF3F6C !important; background: #fff0f4 !important; }
        .place-btn {
          width: 100%; background: #FF3F6C; color: white; border: none;
          padding: 11px; border-radius: 4px; font-size: 12px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: background 0.2s;
        }
        .place-btn:hover { background: #e8325c; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #FF3F6C; border-radius: 99px; }
      `}</style>

            <div className="min-h-screen bg-[#f4f4f5]">

                {/* TOP NAV BAR */}
                <div className="bg-white border-b border-[#eaeaec] px-4 py-2.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#FF3F6C] flex items-center justify-center">
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                <path d="M1 1h2l2.5 7h5l1.5-5H4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="6" cy="12" r="1" fill="white" />
                                <circle cx="10" cy="12" r="1" fill="white" />
                            </svg>
                        </div>
                        <span className="text-[#282C3F] text-sm font-bold tracking-wide">Checkout</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="4" width="10" height="7" rx="1.5" stroke="#26A541" strokeWidth="1.2" />
                            <path d="M4 4V3a2 2 0 014 0v1" stroke="#26A541" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span className="text-[#26A541] font-medium text-xs">SSL Secured</span>
                    </div>
                </div>

                {/* STEP INDICATOR */}
                <div className="bg-white border-b border-[#eaeaec]">
                    <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-0">
                        {[
                            { n: 1, label: "Shipping" },
                            { n: 2, label: "Payment" },
                            { n: 3, label: "Review" },
                        ].map((step, i) => (
                            <div key={step.n} className="flex items-center">
                                <button
                                    onClick={() => setActiveStep(step.n)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all duration-200 ${activeStep === step.n ? "step-active border" : "border-transparent"}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${activeStep > step.n ? "step-done-circle text-white border-[#FF3F6C]"
                                        : activeStep === step.n ? "border-[#FF3F6C] text-[#FF3F6C]"
                                            : "border-[#d4d5d9] text-[#94969f]"}`}>
                                        {activeStep > step.n ? (
                                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : step.n}
                                    </div>
                                    <span className={`text-xs font-semibold hidden sm:block ${activeStep === step.n ? "text-[#FF3F6C]" : activeStep > step.n ? "text-[#282C3F]" : "text-[#94969f]"}`}>
                                        {step.label}
                                    </span>
                                </button>
                                {i < 2 && (
                                    <div className={`h-px w-6 mx-0.5 ${activeStep > step.n ? "bg-[#FF3F6C]" : "bg-[#eaeaec]"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN LAYOUT */}
                <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 grid lg:grid-cols-[1fr_300px] gap-4 items-start">

                    {/* ── LEFT COLUMN ── */}
                    <div className="space-y-3">

                        {/* SHIPPING ADDRESS */}
                        <div className="bg-white rounded border border-[#eaeaec] overflow-hidden">
                            <div className="px-4 pt-3.5 pb-3 border-b border-[#eaeaec] flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-[#282C3F]">Delivery Address</h2>
                                    <p className="text-[10px] text-[#94969f] mt-0.5">Where should we deliver your order?</p>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-[#fff0f4] flex items-center justify-center">
                                    <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                                        <path d="M9 1.5C6.51 1.5 4.5 3.51 4.5 6c0 3.75 4.5 10.5 4.5 10.5s4.5-6.75 4.5-10.5c0-2.49-2.01-4.5-4.5-4.5z" stroke="#FF3F6C" strokeWidth="1.4" fill="none" />
                                        <circle cx="9" cy="6" r="1.5" stroke="#FF3F6C" strokeWidth="1.4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="px-4 py-3 space-y-3">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-[#282C3F] mb-1">Full Name *</label>
                                        <input type="text" placeholder="e.g. Arjun Sharma" value={address.fullName}
                                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-[#282C3F] mb-1">Phone Number *</label>
                                        <input type="tel" placeholder="10-digit mobile number" value={address.phone}
                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })} className={inputClass} maxLength={10} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-[#282C3F] mb-1">Street Address *</label>
                                    <textarea rows={2} placeholder="House / Flat no., Street, Locality..." value={address.address}
                                        onChange={(e) => setAddress({ ...address, address: e.target.value })} className={inputClass + " resize-none"} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-[#282C3F] mb-1">City *</label>
                                        <input type="text" placeholder="e.g. Mumbai" value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-[#282C3F] mb-1">Pincode *</label>
                                        <input type="text" placeholder="6-digit pincode" value={address.pincode}
                                            onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className={inputClass} maxLength={6} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT */}
                        <div className="bg-white rounded border border-[#eaeaec] overflow-hidden">
                            <div className="px-4 pt-3.5 pb-3 border-b border-[#eaeaec] flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-[#282C3F]">Payment Method</h2>
                                    <p className="text-[10px] text-[#94969f] mt-0.5">All transactions are secure and encrypted</p>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-[#fff0f4] flex items-center justify-center">
                                    <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                                        <rect x="1.5" y="4" width="15" height="10" rx="2" stroke="#FF3F6C" strokeWidth="1.4" />
                                        <path d="M1.5 7.5h15" stroke="#FF3F6C" strokeWidth="1.4" />
                                        <rect x="4" y="10" width="3" height="1.5" rx="0.5" fill="#FF3F6C" />
                                    </svg>
                                </div>
                            </div>
                            <div className="px-4 py-3">
                                <button className="payment-card w-full flex items-center gap-3 px-3.5 py-2.5 rounded border text-left payment-selected">
                                    <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center border-[#FF3F6C]">
                                        <div className="w-2 h-2 rounded-full bg-[#FF3F6C]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-[#FF3F6C]">Credit / Debit Card</p>
                                        <p className="text-[10px] text-[#94969f] mt-0.5">Visa · Mastercard · RuPay · Amex — Powered by Stripe</p>
                                    </div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 opacity-50" />
                                </button>
                            </div>
                        </div>

                        {/* DELIVERY INFO */}
                        <div className="bg-white rounded border border-[#eaeaec] overflow-hidden">
                            <div className="px-4 pt-3.5 pb-3 border-b border-[#eaeaec]">
                                <h2 className="text-sm font-bold text-[#282C3F]">Delivery Information</h2>
                            </div>
                            <div className="px-4 py-3">
                                <div className="grid sm:grid-cols-3 gap-2">
                                    {[
                                        { label: "Estimated Delivery", value: "3–5 Days", icon: "🕐", valueClass: "text-[#282C3F]" },
                                        { label: "Shipping Charges", value: "FREE", valueClass: "text-[#26A541]", icon: "📦" },
                                        { label: "Return Window", value: "7 Days", icon: "↩️", valueClass: "text-[#282C3F]" },
                                    ].map((info) => (
                                        <div key={info.label} className="bg-[#f4f4f5] rounded p-3 text-center border border-[#eaeaec]">
                                            <div className="text-lg mb-1">{info.icon}</div>
                                            <p className="text-[10px] text-[#94969f] font-medium">{info.label}</p>
                                            <p className={`text-xs font-bold mt-0.5 ${info.valueClass}`}>{info.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* APPLY COUPON */}
                        <div className="bg-white rounded border border-[#eaeaec] overflow-hidden">
                            <div className="px-4 pt-3.5 pb-3 border-b border-[#eaeaec] flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-[#282C3F]">Apply Coupon</h2>
                                    <p className="text-[10px] text-[#94969f] mt-0.5">Have a coupon code? Apply it here</p>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-[#fff0f4] flex items-center justify-center">
                                    <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                                        <path d="M2 9.5l6.5-6.5a1.5 1.5 0 011.06-.44h4.94a1.5 1.5 0 011.5 1.5v4.94a1.5 1.5 0 01-.44 1.06L9.06 16.06a1.5 1.5 0 01-2.12 0L2 11.12a1.5 1.5 0 010-2.12z" stroke="#FF3F6C" strokeWidth="1.4" />
                                        <circle cx="12" cy="6" r="1" fill="#FF3F6C" />
                                    </svg>
                                </div>
                            </div>
                            <div className="px-4 py-3">
                                {!appliedCoupon ? (
                                    <>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                                                className={inputClass + " flex-1"}
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="bg-[#FF3F6C] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#e8325c] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                            >
                                                {couponLoading ? "Checking..." : "Apply"}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-[10px] text-red-500 mt-1.5 font-medium">{couponError}</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between bg-[#e8f9ee] border border-[#b3eac7] rounded px-3 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#26A541] flex items-center justify-center flex-shrink-0">
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#26A541]">{appliedCoupon.coupon.code} applied</p>
                                                <p className="text-[10px] text-[#26A541] mt-0.5">
                                                    You saved ₹{appliedCoupon.discountAmount.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-[10px] text-red-500 font-bold hover:underline">
                                            ✕ Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ORDER NOTES */}
                        <div className="bg-white rounded border border-[#eaeaec] overflow-hidden">
                            <div className="px-4 pt-3.5 pb-3 border-b border-[#eaeaec]">
                                <h2 className="text-sm font-bold text-[#282C3F]">Order Notes <span className="text-[10px] font-normal text-[#94969f]">(Optional)</span></h2>
                            </div>
                            <div className="px-4 py-3">
                                <label className="block text-[10px] font-semibold text-[#282C3F] mb-1">Delivery Instructions</label>
                                <textarea rows={3} placeholder="e.g. Leave at door, preferred time, landmark nearby..."
                                    value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass + " resize-none"} />
                            </div>
                        </div>

                        {/* TRUST BADGES */}
                        <div className="bg-[#fff0f4] rounded border border-[#ffd6e0] px-4 py-3">
                            <p className="text-[#282C3F] text-xs font-bold mb-2.5">Our Promise to You</p>
                            <div className="grid sm:grid-cols-3 gap-3">
                                {[
                                    { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL encryption" },
                                    { icon: "🚚", title: "Free Shipping", sub: "On every single order" },
                                    { icon: "↩", title: "Easy Returns", sub: "No questions asked" },
                                ].map((badge) => (
                                    <div key={badge.title} className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                                            {badge.icon}
                                        </div>
                                        <div>
                                            <p className="text-[#282C3F] text-[10px] font-semibold">{badge.title}</p>
                                            <p className="text-[#94969f] text-[10px] mt-0.5">{badge.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN — ORDER SUMMARY ── */}
                    <div className="lg:sticky lg:top-4">
                        <div className="bg-white rounded border border-[#eaeaec] overflow-hidden">

                            <div className="px-4 py-3 border-b border-[#eaeaec]">
                                <h2 className="text-base font-bold text-[#282C3F]">Price Summary</h2>
                                <p className="text-[10px] text-[#94969f] mt-0.5">Prices are inclusive of all taxes</p>
                            </div>

                            {/* Items */}
                            <div className="px-4 py-3 space-y-3 max-h-52 overflow-y-auto border-b border-[#eaeaec]">
                                {checkoutProducts.map((item) => (
                                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-2.5">
                                        <div className="flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-11 h-14 rounded object-cover border border-[#eaeaec]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#282C3F] text-xs font-semibold truncate">{item.name}</p>
                                            {/* FIX 3: Size — only show if size exists (perfume/no-size products ke liye) */}
                                            {item.size && (
                                                <p className="text-[#94969f] text-[10px] mt-0.5">
                                                    Size: <span className="font-semibold text-[#282C3F]">{item.size}</span>
                                                </p>
                                            )}
                                            <p className="text-[#94969f] text-[10px]">Qty {item.quantity}</p>
                                        </div>
                                        <span className="text-[#282C3F] text-xs font-bold flex-shrink-0">
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="px-4 py-3 space-y-2 border-b border-[#eaeaec]">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#282C3F]">Bag Total</span>
                                    <span className="text-[#282C3F] font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#282C3F]">
                                        Discount {appliedCoupon && <span className="text-[#FF3F6C] font-semibold">({appliedCoupon.coupon.code})</span>}
                                    </span>
                                    <span className="text-[#26A541] font-medium">
                                        {appliedCoupon ? `- ₹${appliedCoupon.discountAmount.toLocaleString("en-IN")}` : "₹0"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#282C3F]">Delivery</span>
                                    <span className="text-[#26A541] font-semibold">Free</span>
                                </div>
                            </div>

                            <div className="px-4 py-3 border-b border-[#eaeaec]">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#282C3F] text-sm font-bold">You Pay</span>
                                    <span className="text-[#282C3F] text-base font-bold">₹{finalTotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="mt-2 bg-[#e8f9ee] border border-[#b3eac7] rounded px-3 py-2 text-center">
                                    <span className="text-[#26A541] text-xs font-medium">
                                        {appliedCoupon
                                            ? `Yay! You are saving ₹${appliedCoupon.discountAmount.toLocaleString("en-IN")}`
                                            : "Yay! You are saving ₹0"}
                                    </span>
                                </div>
                            </div>

                            <div className="px-4 py-3">
                                <button onClick={handlePayment} className="place-btn">
                                    PAY NOW — ₹{finalTotal.toLocaleString("en-IN")}
                                </button>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                        <rect x="1" y="5" width="10" height="6" rx="1.5" stroke="#94969f" strokeWidth="1.2" />
                                        <path d="M3.5 5V3.5a2.5 2.5 0 015 0V5" stroke="#94969f" strokeWidth="1.2" strokeLinecap="round" />
                                    </svg>
                                    <span className="text-[10px] text-[#94969f]">Secured by Stripe · 256-bit SSL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default function Checkout() {
    return (
        <Suspense fallback={<div className="p-10">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}