"use client";

import { Suspense, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/auth/login`,
                {
                    email,
                    password
                }
            );

            // localStorage.setItem(
            //     "token",
            //     res.data.token
            // );

            // localStorage.setItem(
            //     "role",
            //     res.data.role
            // );

            login(res.data.token, res.data.role || "user", res.data.user);

            const redirect = searchParams.get("redirect");

            if ((res.data.role || "user") === "admin") {
                router.push("/admin");
            } else {
                router.push(redirect || "/");
            }

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Login Failed"
            );

        }
    };

    return (

        <div className="relative min-h-screen">

            <Image
                src="/images/store2.png"
                alt="Flyying Stone"
                fill
                priority
                className="object-cover"
            />

            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-5">

                <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl">

                    <div className="text-center mb-8">

                        <h1 className="text-white text-5xl font-light tracking-[10px]">
                            FLYYING STONE
                        </h1>

                        <p className="text-gray-300 mt-4">
                            Premium Fashion For Men & Women
                        </p>

                    </div>

                    <h2 className="text-white text-3xl font-semibold mb-2">
                        Welcome Back
                    </h2>

                    <p className="text-gray-300 mb-8">
                        Login to continue
                    </p>

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        className="w-full p-4 mb-4 rounded-lg bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className="w-full p-4 mb-6 rounded-lg bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none"
                    />

                    <button
                        onClick={handleLogin}
                        className="w-full bg-white text-black py-4 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                        LOGIN
                    </button>

                    <div className="mt-8 text-center">

                        <p className="text-gray-300">
                            New Customer?
                        </p>

                        <a
                            href="/register"
                            className="text-white font-semibold underline mt-2 inline-block"
                        >
                            Create Account
                        </a>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default function Login() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}



