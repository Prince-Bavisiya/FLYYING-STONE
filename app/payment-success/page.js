"use client";

import { Suspense, useEffect, useState } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useBag } from "../../context/BagContext";

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearBag } = useBag();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const sessionId = searchParams.get("session_id");
                if (!sessionId) { setLoading(false); return; }

                const token = localStorage.getItem("token");
                await axios.get(`http://localhost:5000/api/payment/verify/${sessionId}`, {
                    headers: { authorization: token },
                });

                clearBag();
                setSuccess(true);
            } catch (error) {
                console.log(error);
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };
        verifyPayment();
    }, []);

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-[#FF3E6C] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400 tracking-widest uppercase font-semibold">Verifying Payment...</p>
            </div>
        );
    }

    /* ── Failed ── */
    if (!success) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
                <div className="bg-white border border-[#E5E7EB] w-full max-w-sm p-8 text-center">

                    <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                    </div>

                    <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase mb-2">Payment Failed</p>
                    <h1 className="text-lg font-black text-[#0F172A]">Verification Failed</h1>
                    <p className="text-xs text-gray-400 mt-2 leading-5">
                        We could not verify your payment. Please try again or contact support.
                    </p>

                    <button onClick={() => router.push("/checkout")}
                        className="mt-6 w-full bg-[#0F172A] text-white py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-black transition">
                        TRY AGAIN
                    </button>

                    <button onClick={() => router.push("/")}
                        className="mt-3 w-full border border-[#E5E7EB] text-gray-500 py-3.5 text-xs font-bold tracking-widest uppercase hover:border-[#0F172A] hover:text-[#0F172A] transition">
                        GO TO HOME
                    </button>

                </div>
            </div>
        );
    }

    /* ── Success ── */
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
            <div className="bg-white border border-[#E5E7EB] w-full max-w-sm p-8 text-center">

                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12l3 3 5-5" />
                    </svg>
                </div>

                <p className="text-[10px] text-green-600 font-bold tracking-widest uppercase mb-2">Payment Confirmed</p>
                <h1 className="text-xl font-black text-[#0F172A]">Order Placed!</h1>
                <p className="text-xs text-gray-400 mt-2 leading-5">
                    Thank you for shopping with Flyying Stone.<br />
                    Your order has been confirmed successfully.
                </p>

                {/* Divider */}
                <div className="border-t border-[#E5E7EB] my-6" />

                {/* Info Pills */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { icon: "📦", label: "Processing" },
                        { icon: "🚚", label: "3–5 Days" },
                        { icon: "↩️", label: "7 Day Return" },
                    ].map(item => (
                        <div key={item.label} className="bg-[#F8F9FA] border border-[#E5E7EB] p-3">
                            <p className="text-base">{item.icon}</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                <button onClick={() => router.push("/profile")}
                    className="w-full bg-[#FF3E6C] text-white py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-[#e8325c] transition">
                    VIEW MY ORDERS
                </button>

                <button onClick={() => router.push("/")}
                    className="mt-3 w-full border border-[#E5E7EB] text-gray-500 py-3.5 text-xs font-bold tracking-widest uppercase hover:border-[#0F172A] hover:text-[#0F172A] transition">
                    CONTINUE SHOPPING
                </button>

            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}