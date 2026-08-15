"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
    const { login } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {

        try {

            const res = await axios.post(
                "/api/auth/register",
                {
                    name,
                    email,
                    password,
                }
            );

            alert("Register Successful");

            console.log(res.data);

            if (res.data.success && res.data.token) {
                login(res.data.token, res.data.role || "user", res.data.user);
                window.location.href = "/";
            } else {
                window.location.href = "/login";
            }

        } catch (error) {

            console.log(error.response);

            alert(
                error.response?.data?.message ||
                error.message
            );

        }

    };

    return (

        <div className="relative min-h-screen">

            <Image
                src="/images/store2.png"
                alt="ZAYRO"
                fill
                priority
                className="object-cover"
            />

            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-5">

                <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl">

                    <div className="text-center mb-8">

                        <h1 className="text-white text-5xl font-light tracking-[10px]">
                            ZAYRO
                        </h1>

                        <p className="text-gray-300 mt-4">
                            Premium Fashion For Men & Women
                        </p>

                    </div>

                    <h2 className="text-white text-3xl font-semibold mb-2">
                        Create Account
                    </h2>

                    <p className="text-gray-300 mb-8">
                        Join the ZAYRO family
                    </p>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 mb-4 rounded-lg bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 mb-4 rounded-lg bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 mb-6 rounded-lg bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"
                    />

                    <button
                        onClick={handleRegister}
                        className="w-full bg-white text-black py-4 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                        CREATE ACCOUNT
                    </button>

                    <div className="mt-8 text-center">

                        <p className="text-gray-300">
                            Already have an account?
                        </p>

                        <a
                            href="/login"
                            className="text-white font-semibold underline mt-2 inline-block"
                        >
                            Login
                        </a>

                    </div>

                </div>

            </div>

        </div>

    );
}