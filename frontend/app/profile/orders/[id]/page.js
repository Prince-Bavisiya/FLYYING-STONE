"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function OrderDetails() {

    const { id } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`/api/orders/${id}`, {
                    headers: { authorization: token },
                });
                setOrder(res.data.order);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <p className="text-sm text-gray-400 tracking-widest uppercase">Loading...</p>
            </div>
        );
    }

    if (order.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <p className="text-sm text-gray-400">Order Not Found</p>
            </div>
        );
    }

    const orderInfo = order[0];

    // total_amount in DB is already the discounted (final) amount — paymentController saves it that way.
    // Add the discount back to get the original subtotal for display.
    const discountAmount = Number(orderInfo.discount_amount || 0);
    const finalTotal = Number(orderInfo.total_amount || 0);
    const subtotal = finalTotal + discountAmount;
    const couponCode = orderInfo.coupon_code || null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-8 text-black">
            <div className="max-w-4xl mx-auto px-5">

                {/* Back */}
                <button onClick={() => router.back()}
                    className="mb-5 text-xs font-bold text-gray-400 hover:text-[#FF3E6C] transition uppercase tracking-wider flex items-center gap-1">
                    ← Back to Orders
                </button>

                {/* Header */}
                <div className="bg-white border border-[#E5E7EB] p-5 mb-4 flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Order ID</p>
                        <h1 className="text-lg font-black text-[#0F172A] mt-0.5">#{orderInfo.id ?? id}</h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Placed on {new Date(orderInfo.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {/* Payment Status */}
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${orderInfo.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                                }`}>
                                {orderInfo.payment_status?.toUpperCase()}
                            </span>
                        </div>
                        {/* Order Status */}
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Order Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${orderInfo.order_status === "delivered" || orderInfo.order_status === "completed"
                                ? "bg-green-100 text-green-700"
                                : orderInfo.order_status === "shipped"
                                    ? "bg-blue-100 text-blue-700"
                                    : orderInfo.order_status === "processing"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}>
                                {orderInfo.order_status?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Coupon Applied Banner */}
                {couponCode && (
                    <div className="bg-green-50 border border-green-100 px-5 py-3 mb-4 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-base">🎟️</span>
                            <p className="text-xs font-bold text-green-700">
                                Coupon Applied: <span className="tracking-wide">{couponCode}</span>
                            </p>
                        </div>
                        <p className="text-xs font-bold text-green-700">
                            You saved ₹{discountAmount.toLocaleString("en-IN")}
                        </p>
                    </div>
                )}

                {/* Products */}
                <div className="bg-white border border-[#E5E7EB] mb-4">
                    <div className="px-5 py-3 border-b border-[#E5E7EB]">
                        <h2 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Items Ordered</h2>
                    </div>
                    <div className="divide-y divide-[#E5E7EB]">
                        {order.map((item, index) => (
                            // KEY FIX: use product_id + size + index for uniqueness
                            <div key={`${item.product_id}-${item.size}-${index}`}
                                className="p-4 flex items-center gap-4">
                                <img src={item.image} alt={item.name}
                                    className="w-16 h-20 object-cover flex-shrink-0 bg-[#F8F9FA]" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                                        {item.category === "Men" ? "Premium Collection" : "Luxury Collection"}
                                    </p>
                                    <h3 className="text-sm font-black text-[#0F172A] truncate">{item.name}</h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-gray-500 border border-[#E5E7EB] px-2 py-0.5 font-semibold">
                                            Size: {item.size}
                                        </span>
                                        <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-[#0F172A] flex-shrink-0">
                                    ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping + Summary */}
                <div className="grid md:grid-cols-2 gap-4">

                    <div className="bg-white border border-[#E5E7EB] p-5">
                        <h2 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4">Shipping Address</h2>
                        <p className="text-sm font-bold text-[#0F172A]">{orderInfo.shipping_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{orderInfo.shipping_phone}</p>
                        <p className="text-xs text-gray-500 mt-1">{orderInfo.shipping_address}</p>
                        <p className="text-xs text-gray-500">{orderInfo.shipping_city} — {orderInfo.shipping_pincode}</p>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] p-5">
                        <h2 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4">Order Summary</h2>
                        <div className="space-y-2.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Coupon Discount {couponCode && <span className="text-[#FF3E6C] font-semibold">({couponCode})</span>}
                                    </span>
                                    <span className="text-green-600 font-semibold">- ₹{discountAmount.toLocaleString("en-IN")}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="text-green-600 font-semibold">FREE</span>
                            </div>
                            <div className="border-t border-[#E5E7EB] pt-2.5 flex justify-between">
                                <span className="text-sm font-black text-[#0F172A]">Total Paid</span>
                                <span className="text-sm font-black text-[#0F172A]">₹{finalTotal.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}