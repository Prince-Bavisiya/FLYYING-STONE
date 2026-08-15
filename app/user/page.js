"use client";

import Link from "next/link";

export default function UserPage() {

    return (

        <div className="min-h-screen bg-black">

            <div className="grid lg:grid-cols-2 min-h-screen">

                {/* ================= LEFT SIDE ================= */}

                <div
                    className="relative hidden lg:flex items-end"
                    style={{
                        backgroundImage: "url('/images/auth-bg.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >

                    {/* Overlay */}

                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/70"></div>

                    {/* Brand Content */}

                    <div className="relative z-10 px-14 pb-16 max-w-xl">

                        <p className="uppercase tracking-[5px] text-xs text-white/70 mb-6">

                            Luxury Fashion

                        </p>

                        <h1 className="text-5xl xl:text-6xl font-extralight tracking-[12px] text-white leading-none">

                            ZAYRO

                        </h1>

                        <div className="w-28 h-[2px] bg-white/40 mt-8 mb-8"></div>

                        <p className="text-white/80 text-base leading-8 max-w-[430px]">

                            TIMELESS STYLE.

                            <br />

                            PREMIUM QUALITY.

                            <br />

                            MADE FOR THE MODERN YOU.

                        </p>

                    </div>

                </div>

                {/* ================= RIGHT SIDE ================= */}

                <div className="flex items-center justify-center bg-black px-6 py-10">

                    <div
                        className="
                        w-full
                        max-w-md
                        rounded-[28px]
                        border
                        border-white/10
                        bg-[#0d0d0d]
                        shadow-[0_20px_60px_rgba(0,0,0,0.7)]
                        p-10
                        "
                    >

                        <p className="text-center text-white tracking-[6px] text-base font-light">

                            ZAYRO

                        </p>

                        <h2 className="text-center text-white text-3xl font-light tracking-wide mt-8">

                            Welcome Back

                        </h2>

                        <p className="text-center text-gray-400 text-base leading-7 mt-5">

                            Sign in to continue your premium shopping experience.

                        </p>

                        <div className="mt-10 space-y-4">

                            {/* LOGIN */}

                            <Link
                                href="/login"
                                className="
                            block
                            w-full
                            bg-white
                            text-black
                            text-center
                            py-3.5
                            rounded-xl
                            text-base
                            font-semibold
                            tracking-[2px]
                            hover:bg-neutral-200
                            transition
                            duration-300
                            "
                            >
                                LOGIN
                            </Link>

                            {/* REGISTER */}

                            <Link
                                href="/register"
                                className="
                            block
                            w-full
                            border
                            border-white
                            text-white
                            text-center
                            py-3.5
                            rounded-xl
                            text-base
                            font-semibold
                            tracking-[2px]
                            hover:bg-white
                            hover:text-black
                            transition
                            duration-300
                            "
                            >
                                CREATE ACCOUNT
                            </Link>

                        </div>

                        {/* Divider */}

                        <div className="flex items-center gap-5 my-8">

                            <div className="flex-1 h-px bg-white/20"></div>

                            <span className="text-xs tracking-[4px] text-gray-500">

                                OR

                            </span>

                            <div className="flex-1 h-px bg-white/20"></div>

                        </div>

                        {/* Google */}

                        <button
                            className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-3
                        border
                        border-white/20
                        rounded-xl
                        py-3
                        text-white
                        hover:bg-white/10
                        transition
                        "
                        >

                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                className="w-5 h-5"
                                alt="Google"
                            />

                            Continue with Google

                        </button>

                        {/* Apple */}

                        <button
                            className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-3
                        border
                        border-white/20
                        rounded-xl
                        py-3
                        mt-4
                        text-white
                        hover:bg-white/10
                        transition
                        "
                        >

                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="white"
                            >
                                <path d="M16.365 1.43c0 1.14-.41 2.01-1.06 2.79-.77.91-2.02 1.61-3.18 1.52-.15-1.1.45-2.24 1.08-2.95.7-.82 1.92-1.4 3.16-1.36zM20.54 17.1c-.55 1.24-.82 1.79-1.53 2.89-.99 1.53-2.38 3.43-4.1 3.44-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.08.99-1.72-.01-3.03-1.72-4.02-3.25C.95 17.3-.39 12.2 1.92 8.6c1.16-1.8 2.99-2.85 4.71-2.85 1.76 0 2.87 1.02 4.33 1.02 1.42 0 2.29-1.02 4.31-1.02 1.53 0 3.15.83 4.31 2.26-3.8 2.08-3.18 7.49.96 9.09z" />
                            </svg>

                            Continue with Apple

                        </button>

                        <p className="text-center text-gray-500 text-xs leading-6 mt-8">

                            By continuing, you agree to our

                            <span className="text-white font-medium">

                                {" "}Terms & Conditions

                            </span>

                            {" "}and{" "}

                            <span className="text-white font-medium">

                                Privacy Policy

                            </span>

                        </p>

                    </div>

                </div>

            </div>

        </div>

     );

}