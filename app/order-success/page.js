"use client";

import Link from "next/link";
import axios from "axios";
import { Suspense, useState, useEffect, useRef } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";

function OrderSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const invoiceRef = useRef(null);
    const [order, setOrder] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {

        const sessionId = searchParams.get("session_id"); // ✅ Stripe session ID
        const orderIdFromUrl = searchParams.get("order_id");

        // ✅ Token ke saath verify karo
        if (sessionId) {
            const token = localStorage.getItem("token");
            axios.get(`http://localhost:5000/api/payment/verify/${sessionId}`, {
                headers: { authorization: token }
            })
                .then(res => console.log("Payment verified:", res.data))
                .catch(console.error);
        }

        const pending = sessionStorage.getItem("pendingOrder");
        if (pending) {
            try {
                const parsed = JSON.parse(pending);
                setOrder({
                    ...parsed,
                    id: orderIdFromUrl || parsed.id,
                    discount: parsed.discount || 0,
                    finalTotal: parsed.finalTotal ?? parsed.total,
                    couponCode: parsed.couponCode || null,
                });
            } catch (e) {
                setOrder({ id: orderIdFromUrl || Date.now(), total: 0, finalTotal: 0, discount: 0, products: [], date: new Date().toLocaleDateString() });
            }
        } else {
            setOrder({ id: orderIdFromUrl || Date.now(), total: 0, finalTotal: 0, discount: 0, products: [], date: new Date().toLocaleDateString() });
        }

    }, []);

    const handleCopyCoupon = () => {
        navigator.clipboard.writeText("FLY200");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrintInvoice = () => {
        const printWindow = window.open("", "_blank");

        const subtotal = Number(order?.total || 0);
        const discount = Number(order?.discount || 0);
        const finalTotal = Number(order?.finalTotal ?? subtotal);

        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - Flyying Stone #${order?.id}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
                    body { padding: 40px; color: #0F172A; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #E5E7EB; }
                    .brand { font-size: 22px; font-weight: 900; letter-spacing: 6px; }
                    .brand-sub { font-size: 10px; color: #FF3E6C; letter-spacing: 3px; margin-top: 4px; }
                    .invoice-title { font-size: 28px; font-weight: 900; color: #0F172A; }
                    .invoice-meta { font-size: 12px; color: #6B7280; margin-top: 4px; }
                    .section { margin-bottom: 24px; }
                    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #6B7280; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { background: #F8F9FA; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; }
                    td { padding: 12px; font-size: 13px; border-bottom: 1px solid #F3F4F6; }
                    .total-row { font-weight: 900; font-size: 15px; border-top: 2px solid #0F172A; }
                    .discount-row { color: #16A34A; }
                    .status-paid { background: #DCFCE7; color: #16A34A; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
                    .coupon-badge { background: #FFF0F4; color: #FF3E6C; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; margin-left: 6px; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="brand">FLYYING STONE</div>
                        <div class="brand-sub">PREMIUM FASHION</div>
                    </div>
                    <div style="text-align:right">
                        <div class="invoice-title">INVOICE</div>
                        <div class="invoice-meta">#ORD-${order?.id}</div>
                        <div class="invoice-meta">${order?.date || new Date().toLocaleDateString("en-IN")}</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px">
                    <div class="section">
                        <div class="section-title">Billed To</div>
                        <div style="font-size:13px;line-height:1.8">
                            <strong>${order?.address?.fullName || "Customer"}</strong><br/>
                            ${order?.address?.phone || ""}<br/>
                            ${order?.address?.address || ""}<br/>
                            ${order?.address?.city || ""} — ${order?.address?.pincode || ""}
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-title">Payment Info</div>
                        <div style="font-size:13px;line-height:1.8">
                            Method: Card (Stripe)<br/>
                            Status: <span class="status-paid">PAID</span><br/>
                            Date: ${order?.date || new Date().toLocaleDateString("en-IN")}
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Items Ordered</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Size</th>
                                <th>Qty</th>
                                <th style="text-align:right">Price</th>
                                <th style="text-align:right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order?.products || []).map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.size || "—"}</td>
                                    <td>${item.quantity}</td>
                                    <td style="text-align:right">₹${Number(item.price).toLocaleString("en-IN")}</td>
                                    <td style="text-align:right">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
                                </tr>
                            `).join("")}
                            <tr>
                                <td colspan="4" style="text-align:right;color:#6B7280;font-size:12px">Subtotal</td>
                                <td style="text-align:right;font-size:12px">₹${subtotal.toLocaleString("en-IN")}</td>
                            </tr>
                            ${discount > 0 ? `
                            <tr class="discount-row">
                                <td colspan="4" style="text-align:right;font-size:12px">
                                    Coupon Discount ${order?.couponCode ? `<span class="coupon-badge">${order.couponCode}</span>` : ""}
                                </td>
                                <td style="text-align:right;font-size:12px;color:#16A34A">- ₹${discount.toLocaleString("en-IN")}</td>
                            </tr>` : ""}
                            <tr>
                                <td colspan="4" style="text-align:right;color:#6B7280;font-size:12px">Shipping</td>
                                <td style="text-align:right;color:#16A34A;font-weight:700">FREE</td>
                            </tr>
                            <tr>
                                <td colspan="4" style="text-align:right;color:#6B7280;font-size:12px">GST</td>
                                <td style="text-align:right;font-size:12px">Included</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="4" style="text-align:right">Total Paid</td>
                                <td style="text-align:right">₹${finalTotal.toLocaleString("en-IN")}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    Thank you for shopping with Flyying Stone · support@flyyingstone.com · +91 9876543210<br/>
                    This is a computer generated invoice. No signature required.
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#FF3E6C] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const subtotal = Number(order.total || 0);
    const discount = Number(order.discount || 0);
    const finalTotal = Number(order.finalTotal ?? subtotal);

    const steps = [
        { label: "Order Placed", sub: "Confirmed", done: true, icon: "✓" },
        { label: "Payment", sub: "Verified", done: true, icon: "✓" },
        { label: "Processing", sub: "In Progress", active: true, icon: "📦" },
        { label: "Shipped", sub: "Pending", icon: "🚚" },
        { label: "Delivered", sub: "Pending", icon: "🏠" },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA]">

            {/* Top Bar */}
            <div className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-[#0F172A] tracking-wider uppercase">Order Confirmed</span>
                </div>
                <span className="text-xs text-gray-400">Order #{order.id}</span>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

                {/* ── Success Header ── */}
                <div className="bg-white border border-[#E5E7EB] p-6 text-center">
                    <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12l3 3 5-5" />
                        </svg>
                    </div>
                    <p className="text-[10px] text-green-600 font-bold tracking-widest uppercase mb-1">Payment Successful</p>
                    <h1 className="text-xl font-black text-[#0F172A]">Order Placed Successfully!</h1>
                    <p className="text-xs text-gray-400 mt-1">Thank you for shopping with Flyying Stone</p>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                        {[
                            { label: "Order ID", value: `#${order.id}` },
                            { label: "Amount Paid", value: `₹${finalTotal.toLocaleString("en-IN")}` },
                            { label: "Payment", value: "PAID" },
                        ].map(item => (
                            <div key={item.label} className="bg-[#F8F9FA] border border-[#E5E7EB] p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.label}</p>
                                <p className={`text-sm font-black mt-1 ${item.label === "Payment" ? "text-green-600" : "text-[#0F172A]"}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {discount > 0 && (
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                            <span className="text-xs">🎉</span>
                            <span className="text-[11px] font-bold text-green-700">
                                You saved ₹{discount.toLocaleString("en-IN")}{order.couponCode ? ` with ${order.couponCode}` : ""}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Order Timeline ── */}
                <div className="bg-white border border-[#E5E7EB] p-5">
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-5">Order Timeline</p>
                    <div className="flex items-center">
                        {steps.map((step, i) => (
                            <div key={step.label} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step.done ? "bg-green-500 text-white" :
                                        step.active ? "bg-[#FF3E6C] text-white" :
                                            "bg-[#F8F9FA] border border-[#E5E7EB] text-gray-300"
                                        }`}>
                                        {step.done ? "✓" : step.icon}
                                    </div>
                                    <p className={`text-[9px] font-bold mt-1.5 text-center leading-tight ${step.done ? "text-green-600" :
                                        step.active ? "text-[#FF3E6C]" :
                                            "text-gray-300"
                                        }`}>{step.label}</p>
                                    <p className={`text-[8px] text-center ${step.done || step.active ? "text-gray-400" : "text-gray-200"}`}>{step.sub}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${step.done ? "bg-green-400" : step.active ? "bg-[#FFD6E0]" : "bg-[#E5E7EB]"}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 bg-[#F8F9FA] border border-[#E5E7EB] p-3 flex items-center gap-3">
                        <span className="text-lg">🚚</span>
                        <div>
                            <p className="text-xs font-bold text-[#0F172A]">Estimated Delivery: 3–5 Business Days</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Free shipping · 7 Day Return Policy</p>
                        </div>
                    </div>
                </div>

                {/* ── Invoice Summary ── */}
                <div className="bg-white border border-[#E5E7EB]">
                    <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Invoice Summary</p>
                        <button onClick={handlePrintInvoice}
                            className="text-[10px] font-bold text-[#FF3E6C] hover:underline uppercase tracking-wider flex items-center gap-1">
                            🖨 Print / Download
                        </button>
                    </div>

                    {/* Shipping Address */}
                    {order.address && (
                        <div className="px-5 py-3 border-b border-[#E5E7EB]">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Deliver To</p>
                            <p className="text-sm font-bold text-[#0F172A]">{order.address.fullName}</p>
                            <p className="text-xs text-gray-500">{order.address.phone}</p>
                            <p className="text-xs text-gray-500">{order.address.address}, {order.address.city} — {order.address.pincode}</p>
                        </div>
                    )}

                    {/* Products */}
                    {order.products?.length > 0 && (
                        <div className="px-5 py-3 border-b border-[#E5E7EB] space-y-3">
                            {order.products.map((item, i) => (
                                <div key={`${item.id}-${item.size}-${i}`} className="flex items-center gap-3">
                                    <img src={item.image} alt={item.name} className="w-10 h-12 object-cover flex-shrink-0 bg-[#F8F9FA]" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#0F172A] truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-400">Size: {item.size} · Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-xs font-black text-[#0F172A]">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="px-5 py-3 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-sm font-black text-black">Subtotal</span>
                            <span className="font-semibold text-black">
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">
                                    Coupon Discount {order.couponCode && (
                                        <span className="text-[#FF3E6C] font-semibold">({order.couponCode})</span>
                                    )}
                                </span>
                                <span className="text-green-600 font-semibold">- ₹{discount.toLocaleString("en-IN")}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Shipping</span>
                            <span className="text-green-600 font-semibold">FREE</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">GST</span>
                            <span className="text-gray-500">Included</span>
                        </div>
                        <div className="border-t border-[#E5E7EB] pt-2 flex justify-between">
                            <span className="text-sm font-black text-[#0F172A]">Total Paid</span>
                            <span className="text-sm font-black text-[#0F172A]">₹{finalTotal.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>

                {/* ── Coupon ── */}
                <div className="bg-white border border-[#E5E7EB] p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-black text-[#0F172A]">🎁 Special Gift — ₹200 OFF</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Valid for 30 days on your next purchase</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="border border-dashed border-[#FF3E6C] px-4 py-2">
                            <span className="text-sm font-black text-[#FF3E6C] tracking-widest">FLY200</span>
                        </div>
                        <button onClick={handleCopyCoupon}
                            className={`text-xs font-bold px-3 py-2 transition ${copied ? "text-green-600" : "text-gray-400 hover:text-[#FF3E6C]"}`}>
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                {/* ── Support ── */}
                <div className="bg-white border border-[#E5E7EB] p-5">
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-4">Need Help?</p>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: "📞", label: "Call Us", value: "+91 9876543210" },
                            { icon: "✉️", label: "Email", value: "support@flyyingstone.com" },
                            { icon: "💬", label: "Live Chat", value: "Available 24/7" },
                        ].map(s => (
                            <div key={s.label} className="bg-[#F8F9FA] border border-[#E5E7EB] p-3 text-center">
                                <p className="text-lg">{s.icon}</p>
                                <p className="text-[10px] font-bold text-[#0F172A] mt-1">{s.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Action Buttons ── */}
                <div className="grid grid-cols-3 gap-3">
                    <Link href="/profile"
                        className="bg-[#FF3E6C] text-white py-3.5 text-xs font-bold tracking-widest uppercase text-center hover:bg-[#e8325c] transition">
                        TRACK ORDER
                    </Link>
                    <button onClick={handlePrintInvoice}
                        className="border border-[#FF3E6C] text-[#FF3E6C] py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-[#FFF0F4] transition">
                        INVOICE
                    </button>
                    <Link href="/"
                        className="bg-[#0F172A] text-white py-3.5 text-xs font-bold tracking-widest uppercase text-center hover:bg-black transition">
                        SHOP MORE
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default function OrderSuccess() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <OrderSuccessContent />
        </Suspense>
    );
}