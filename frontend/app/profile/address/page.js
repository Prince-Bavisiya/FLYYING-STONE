"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Addresses() {

    const router = useRouter();

    const [showForm, setShowForm] = useState(false);

    const [addresses, setAddresses] = useState([
        {
            id: 1,
            type: "Home",
            isDefault: true,
            fullName: "Prince Bavisiya",
            phone: "+91 9876543210",
            house: "123",
            street: "Nikol",
            landmark: "Near Ring Road",
            city: "Ahmedabad",
            state: "Gujarat",
            pincode: "382350",
            country: "India",
        },
    ]);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        house: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        type: "Home",
        isDefault: false,
    });

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

    };

    const handleSave = () => {

        const newAddress = {
            id: Date.now(),
            ...formData,
        };

        let updatedAddresses = [...addresses];

        if (formData.isDefault) {

            updatedAddresses = updatedAddresses.map((item) => ({
                ...item,
                isDefault: false,
            }));

        }

        updatedAddresses.push(newAddress);

        setAddresses(updatedAddresses);

        setFormData({
            fullName: "",
            phone: "",
            house: "",
            street: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
            country: "India",
            type: "Home",
            isDefault: false,
        });

        setShowForm(false);

    };

    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-6xl mx-auto px-5">

                {/* Header */}

                <div className="flex justify-between items-center mb-10">

                    <div>

                        <h1 className="text-4xl font-bold">

                            My Addresses

                        </h1>

                        <p className="text-gray-500 mt-2">

                            Manage your delivery addresses

                        </p>

                    </div>

                    <button

                        onClick={() => router.back()}

                        className="border px-6 py-3 rounded-xl hover:bg-gray-100"

                    >

                        ← Back

                    </button>

                </div>

                <button

                    onClick={() => setShowForm(!showForm)}

                    className="bg-black text-white px-8 py-4 rounded-xl mb-8 hover:bg-neutral-800 transition"

                >

                    {showForm ? "Close Form" : "+ Add New Address"}

                </button>

                {showForm && (

                    <div className="bg-white rounded-3xl shadow-lg p-8 mb-10">

                        <h2 className="text-2xl font-bold mb-8">

                            Add New Address

                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">

                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className="border rounded-xl p-4"
                            />

                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className="border rounded-xl p-4"
                            />

                            <input
                                name="house"
                                value={formData.house}
                                onChange={handleChange}
                                placeholder="House / Flat No."
                                className="border rounded-xl p-4"
                            />

                            <input
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="Street / Area"
                                className="border rounded-xl p-4"
                            />

                            <input
                                name="landmark"
                                value={formData.landmark}
                                onChange={handleChange}
                                placeholder="Landmark"
                                className="border rounded-xl p-4"
                            />

                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="border rounded-xl p-4"
                            />

                            <input
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="border rounded-xl p-4"
                            />

                            <input
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="Pincode"
                                className="border rounded-xl p-4"
                            />

                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">

                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="border rounded-xl p-4"
                            >

                                <option>Home</option>

                                <option>Office</option>

                                <option>Other</option>

                            </select>

                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="border rounded-xl p-4"
                            />

                        </div>

                        <label className="flex items-center gap-3 mt-6">

                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />

                            Set as Default Address

                        </label>

                        <div className="flex justify-end gap-4 mt-8">

                            <button
                                onClick={() => setShowForm(false)}
                                className="border px-6 py-3 rounded-xl"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="bg-black text-white px-8 py-3 rounded-xl"
                            >
                                Save Address
                            </button>

                        </div>

                    </div>

                )}

                {/* Address List */}

                {
                    addresses.length === 0 ? (

                        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">

                            <div className="text-6xl mb-4">
                                📍
                            </div>

                            <h2 className="text-2xl font-bold">
                                No Address Found
                            </h2>

                            <p className="text-gray-500 mt-3">
                                Add your first delivery address.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-6">

                            {addresses.map((address) => (

                                <div
                                    key={address.id}
                                    className="bg-white rounded-3xl shadow-lg border p-8"
                                >

                                    <div className="flex flex-col lg:flex-row lg:justify-between gap-8">

                                        <div>

                                            <div className="flex items-center gap-3 mb-5">

                                                <h2 className="text-2xl font-bold">

                                                    🏠 {address.type}

                                                </h2>

                                                {address.isDefault && (

                                                    <span className="bg-black text-white text-xs px-3 py-1 rounded-full">

                                                        Default

                                                    </span>

                                                )}

                                            </div>

                                            <p className="font-semibold text-lg">

                                                {address.fullName}

                                            </p>

                                            <p className="text-gray-600 mt-1">

                                                {address.phone}

                                            </p>

                                            <p className="mt-3">

                                                {address.house}, {address.street}

                                            </p>

                                            {address.landmark && (

                                                <p>

                                                    Landmark : {address.landmark}

                                                </p>

                                            )}

                                            <p>

                                                {address.city}, {address.state}

                                            </p>

                                            <p>

                                                {address.country} - {address.pincode}

                                            </p>

                                        </div>

                                        <div className="flex flex-wrap gap-3 h-fit">

                                            <button
                                                className="border px-5 py-2 rounded-xl hover:bg-gray-100 transition"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="border px-5 py-2 rounded-xl hover:bg-gray-100 transition"
                                            >
                                                Set Default
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setAddresses(
                                                        addresses.filter(
                                                            (item) => item.id !== address.id
                                                        )
                                                    )
                                                }
                                                className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )
                }

            </div>

        </div>

    );

}