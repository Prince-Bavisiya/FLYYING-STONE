"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomersPage() {

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {

        try {

            const token = localStorage.getItem("token");

            // DEBUG: token check
            console.log("Token being sent:", token);

            if (!token) {
                setError("No token found in localStorage. Please login again.");
                setLoading(false);
                return;
            }

            const res = await axios.get(
                "/api/customers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        authorization: `Bearer ${token}`, // both cases, just in case
                    },
                }
            );

            // DEBUG: full response
            console.log("API Response:", res.data);

            // Handle different possible response shapes
            const list =
                res.data.customers ||
                res.data.data ||
                (Array.isArray(res.data) ? res.data : []);

            setCustomers(list);

        } catch (err) {

            // DEBUG: full error detail
            console.error("Fetch customers failed:");
            console.error("Status:", err.response?.status);
            console.error("Message:", err.response?.data?.message || err.message);
            console.error("Full error response:", err.response?.data);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load customers."
            );

        } finally {

            setLoading(false);

        }

    };

    if (loading) {
        return <h2 className="p-10">Loading...</h2>;
    }

    if (error) {
        return (
            <div className="p-10">
                <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Customers</h2>
                <p className="text-gray-600">{error}</p>
                <button
                    onClick={fetchCustomers}
                    className="mt-4 bg-black text-white px-4 py-2 rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">

            <h1 className="text-3xl font-bold mb-6">
                Customers ({customers.length})
            </h1>

            {customers.length === 0 ? (
                <p className="text-gray-500">No customers found.</p>
            ) : (
                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border">ID</th>
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">Email</th>
                            <th className="p-3 border">Phone</th>
                            <th className="p-3 border">Orders</th>
                            <th className="p-3 border">Spent</th>
                            <th className="p-3 border">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td className="border p-3">{customer.id}</td>
                                <td className="border p-3">{customer.name}</td>
                                <td className="border p-3">{customer.email}</td>
                                <td className="border p-3">{customer.phone || "-"}</td>
                                <td className="border p-3">{customer.total_orders}</td>
                                <td className="border p-3">₹{customer.total_spent}</td>
                                <td className="border p-3">{customer.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
}