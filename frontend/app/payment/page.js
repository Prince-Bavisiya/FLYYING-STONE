"use client";

import Navbar from "../../components/Navbar";

export default function Payment() {

    return (

        <div className="min-h-screen bg-[#f7f5f2]">

            <Navbar />

            {/* Header */}

            <div className="bg-black text-white py-8">

                <div className="max-w-7xl mx-auto px-8">

                    <h1 className="text-4xl font-bold">
                        Checkout
                    </h1>

                </div>

            </div>

            {/* Checkout Steps */}

            <div className="bg-white border-b">

                <div className="max-w-5xl mx-auto flex justify-center items-center py-8">

                    <div className="flex items-center gap-4">

                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                            ✓
                        </div>

                        <span className="font-semibold text-green-600">
                            Shipping
                        </span>

                        <div className="w-20 h-[2px] bg-gray-300"></div>

                        <div className="w-10 h-10 rounded-full bg-[#EF2E2E] text-white flex items-center justify-center font-bold">
                            2
                        </div>

                        <span className="font-semibold text-[#EF2E2E]">
                            Payment
                        </span>

                        <div className="w-20 h-[2px] bg-gray-300"></div>

                        <div className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center font-bold">
                            3
                        </div>

                        <span className="text-gray-500">
                            Review
                        </span>

                    </div>

                </div>

            </div>

        </div>

    );

}