"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const token = localStorage.getItem("token");

                const res = await axios.get(
                    "/api/orders",
                    {
                        headers: {
                            authorization: token,
                        },
                    }
                );

                setOrders(res.data.orders);

            } catch (error) {

                console.log(error);

            }

        };

        fetchOrders();

    }, []);


    if (orders.length === 0) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <h1 className="text-5xl font-bold">

                    No Orders Yet

                </h1>

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-[#F8F8F8] py-12">

            <div className="max-w-6xl mx-auto">

                <h1 className="text-5xl font-bold mb-10">

                    My Orders

                </h1>

                {

                    orders.map((order) => (

                        <div
                            key={order.id}
                            className="
                            bg-white
                            rounded-3xl
                            p-8
                            shadow
                            mb-8
                            "
                        >

                            <div className="flex justify-between items-start mb-6">

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        Order #{order.id}
                                    </h2>

                                    <p className="text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>

                                    {order.courier_name && (
                                        <p className="text-gray-600 mt-2">
                                            Courier : {order.courier_name}
                                        </p>
                                    )}

                                    {order.tracking_number && (
                                        <a
                                            href={`https://www.delhivery.com/track/package/${order.tracking_number}`}
                                            target="_blank"
                                            className="text-green-600 font-medium underline"
                                        >
                                            Track Package
                                        </a>
                                    )}
                                    
                                </div>
                                <div className="text-right">

                                    <span
                                        className={`px-5 py-2 rounded-full font-semibold
        ${order.order_status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                            : order.order_status === "processing"
                                                ? "bg-blue-100 text-blue-700"
                                                : order.order_status === "packed"
                                                    ? "bg-indigo-100 text-indigo-700"
                                                    : order.order_status === "shipped"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : order.order_status === "delivered"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {order.order_status.toUpperCase()}
                                    </span>

                                    <div className="mt-3">

                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold
        ${order.payment_status === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            Payment : {order.payment_status.toUpperCase()}
                                        </span>

                                    </div>

                                    <div className="flex gap-2 mt-4 text-xs font-medium">

                                        <span
                                            className={
                                                ["processing", "packed", "shipped", "delivered"]
                                                    .includes(order.order_status)
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }
                                        >
                                            Processing
                                        </span>

                                        →

                                        <span
                                            className={
                                                ["packed", "shipped", "delivered"]
                                                    .includes(order.order_status)
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }
                                        >
                                            Packed
                                        </span>

                                        →

                                        <span
                                            className={
                                                ["shipped", "delivered"]
                                                    .includes(order.order_status)
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }
                                        >
                                            Shipped
                                        </span>

                                        →

                                        <span
                                            className={
                                                order.order_status === "delivered"
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }
                                        >
                                            Delivered
                                        </span>

                                    </div>

                                </div>

                            </div>
                            {

                                order.products.map((item) => (

                                    <div
                                        key={item.id}
                                        className="
                                        flex
                                        justify-between
                                        border-b
                                        py-4
                                        "
                                    >

                                        <div>

                                            <h3 className="font-semibold">

                                                {item.name}

                                            </h3>

                                            <p>

                                                Qty : {item.quantity}

                                            </p>

                                        </div>

                                        <h3>

                                            ₹{item.price * item.quantity}

                                        </h3>

                                    </div>

                                ))

                            }

                            <div className="mt-6">

                                <div className="flex items-center justify-between">

                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${["pending", "processing", "shipped", "delivered"].includes(order.order_status)
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-300"
                                            }`}>
                                            ✓
                                        </div>

                                        <p className="text-xs mt-2">
                                            Ordered
                                        </p>
                                    </div>

                                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${["processing", "shipped", "delivered"].includes(order.order_status)
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-300"
                                            }`}>
                                            ✓
                                        </div>

                                        <p className="text-xs mt-2">
                                            Processing
                                        </p>
                                    </div>

                                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${["shipped", "delivered"].includes(order.order_status)
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-300"
                                            }`}>
                                            ✓
                                        </div>

                                        <p className="text-xs mt-2">
                                            Shipped
                                        </p>
                                    </div>

                                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${order.order_status === "delivered"
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-300"
                                            }`}>
                                            ✓
                                        </div>

                                        <p className="text-xs mt-2">
                                            Delivered
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <div className="flex justify-between mt-6">

                                <h2 className="text-2xl font-bold">

                                    Total

                                </h2>

                                <h2 className="text-2xl font-bold">

                                    ₹{order.total_amount}

                                </h2>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}