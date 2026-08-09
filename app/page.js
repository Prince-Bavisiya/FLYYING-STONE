"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ChatBot from "../components/ai/ChatBot";


export default function Home() {

    const slides = [
        {
            image: "/images/store10.png",
            objectPosition: "82% 15%",
            title: "ELEVATE\nYOUR\nSTYLE",
            subtitle: "Discover premium fashion crafted for modern men and women. Timeless designs, luxury fabrics and everyday confidence.",
            tag: "NEW SEASON 2026",
        },
        {
            image: "/images/store11.png",
            objectPosition: "80% 15%",
            title: "LUXURY\nREDEFINED",
            subtitle: "Premium outfits designed for those who appreciate timeless elegance and exceptional craftsmanship.",
            tag: "EXCLUSIVE COLLECTION",
        },
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [products, setProducts] = useState([]);

    const router = useRouter();

    const prevSlide = () => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
    const nextSlide = () => setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);

        axios
            .get("/api/products")
            .then((res) => setProducts(res.data.products))
            .catch((err) => console.log(err));

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 7000);

        return () => clearInterval(interval);
    }, []);

    /* ── Reusable Product Card ── */
    const ProductCard = ({ product, dark = false }) => (
        <div
            className={`group relative overflow-hidden cursor-pointer ${dark ? "bg-[#161616]" : "bg-white"}`}
            onClick={() => router.push(`/product/${product.id}`)}
        >
            <div className="overflow-hidden aspect-[3/4] w-full">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100">
                <span className="bg-white text-black text-[11px] font-semibold tracking-[2px] uppercase px-6 py-2.5 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    QUICK VIEW
                </span>
            </div>

            <div className={`pt-3 pb-5 px-1 ${dark ? "text-white" : "text-black"}`}>
                <p className={`text-xs tracking-[1px] mb-1 ${dark ? "text-white/40" : "text-gray-400"}`}>
                    {product.category === "Men" ? "PREMIUM COLLECTION" : "LUXURY COLLECTION"}
                </p>
                <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                <p className={`text-sm font-bold mt-1.5 ${dark ? "text-[#EF2E2E]" : "text-black"}`}>
                    ₹{Math.round(Number(product.price)).toLocaleString("en-IN")}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-black">

            <Navbar />

            {/* ================= HERO ================= */}
            {/* isolate creates a fresh stacking context so this section's internal
                z-20 / z-30 layers can NEVER climb above the sticky navbar above it */}
            <section className="relative overflow-hidden bg-black flex flex-col md:block h-auto md:h-[88vh] min-h-0 md:min-h-[600px] isolate">

                {/* Image Slides Wrapper */}
                <div className="relative w-full h-[56vh] sm:h-[62vh] md:absolute md:inset-0 md:h-full overflow-hidden z-10">
                    <div
                        className="absolute inset-0 flex h-full transition-transform duration-[1800ms] ease-in-out"
                        style={{
                            width: `${slides.length * 100}%`,
                            transform: `translateX(-${currentSlide * (100 / slides.length)}%)`,
                        }}
                    >
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className="relative h-full flex-shrink-0"
                                style={{ width: `${100 / slides.length}%` }}
                            >
                                <img
                                    src={slide.image}
                                    alt="Hero"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        objectPosition: slide.objectPosition || "60% top",
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Gradient overlay — Desktop only */}
                    <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

                    {/* Slide number indicator on mobile: elegant floating chip */}
                    <div className="absolute bottom-4 left-6 z-30 flex md:hidden items-center gap-3 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                        <span className="text-white/60 text-[10px] font-semibold tracking-[2px]">0{currentSlide + 1}</span>
                        <div className="flex gap-1.5">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`transition-all duration-500 rounded-full ${currentSlide === index ? "w-4 h-1 bg-[#EF2E2E]" : "w-1 h-1 bg-white/40"}`}
                                />
                            ))}
                        </div>
                        <span className="text-white/40 text-[10px] font-semibold tracking-[2px]">0{slides.length}</span>
                    </div>
                </div>

                {/* Subtle red glow (Desktop only) */}
                <div className="hidden md:block absolute left-0 bottom-0 w-[400px] h-[400px] bg-red-700/10 blur-[120px] pointer-events-none" />

                {/* Nav arrows (Desktop only) */}
                <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white text-lg backdrop-blur-sm hover:bg-[#EF2E2E] hover:border-[#EF2E2E] transition duration-300 hidden sm:flex md:flex items-center justify-center"
                >❮</button>
                <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white text-lg backdrop-blur-sm hover:bg-[#EF2E2E] hover:border-[#EF2E2E] transition duration-300 hidden sm:flex md:flex items-center justify-center"
                >❯</button>

                {/* Content Block */}
                <div className="relative z-20 bg-black px-6 py-10 md:absolute md:inset-0 md:bg-transparent md:px-12 md:py-0 md:flex md:items-center">
                    <div className="max-w-7xl mx-auto w-full md:px-0">
                        <div className="max-w-xl">

                            {/* Tag */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-5 h-[1.5px] bg-[#EF2E2E]" />
                                <p className="uppercase tracking-[5px] text-[#EF2E2E] font-bold text-[10px]">
                                    {slides[currentSlide].tag}
                                </p>
                            </div>

                            {/* Heading */}
                            <h1 className="text-3xl sm:text-4xl md:text-[clamp(2.8rem,5vw,4.5rem)] font-black leading-[1.1] text-white whitespace-pre-line tracking-tight">
                                {slides[currentSlide].title}
                            </h1>

                            {/* Divider */}
                            <div className="w-12 h-[2.5px] bg-[#EF2E2E] mt-5 mb-4" />

                            {/* Subtitle */}
                            <p className="text-xs sm:text-sm text-gray-400 md:text-white/75 leading-6 md:leading-7 max-w-sm">
                                {slides[currentSlide].subtitle}
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6 sm:mt-8">
                                <button
                                    onClick={() => document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" })}
                                    className="bg-[#EF2E2E] hover:bg-red-700 transition-all duration-300 px-6 sm:px-8 py-3 text-white text-[10px] sm:text-xs font-bold uppercase tracking-[2px] flex-1 sm:flex-initial text-center"
                                >
                                    SHOP NOW
                                </button>
                                <button
                                    onClick={() => document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" })}
                                    className="border border-white/40 text-white px-6 sm:px-8 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-[2px] hover:bg-white hover:text-black transition-all duration-300 flex-1 sm:flex-initial text-center"
                                >
                                    EXPLORE
                                </button>
                            </div>

                            {/* Stats (Desktop only) */}
                            <div className="hidden md:flex flex-wrap gap-x-8 gap-y-4 mt-8 pt-6 border-t border-white/10">
                                {[
                                    { val: "50K+", label: "Customers" },
                                    { val: "500+", label: "Products" },
                                    { val: "★ 4.9", label: "Rating" },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <p className="text-white text-lg font-black">{s.val}</p>
                                        <p className="text-white/45 text-[10px] mt-0.5 tracking-[1px] uppercase">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Desktop indicator */}
                <div className="hidden md:flex absolute bottom-8 left-12 z-30 items-center gap-4">
                    <span className="text-white/40 text-xs font-semibold tracking-[2px]">0{currentSlide + 1}</span>
                    <div className="flex gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all duration-500 rounded-full ${currentSlide === index ? "w-8 h-1.5 bg-[#EF2E2E]" : "w-1.5 h-1.5 bg-white/30"}`}
                            />
                        ))}
                    </div>
                    <span className="text-white/25 text-xs font-semibold tracking-[2px]">0{slides.length}</span>
                </div>

                {/* Scroll hint (Desktop only) */}
                <div className="absolute bottom-8 right-10 z-30 hidden md:flex flex-col items-center gap-2">
                    <div className="w-[1px] h-10 bg-gradient-to-b from-white/0 to-white/40" />
                    <p className="text-white/40 text-[10px] tracking-[3px] uppercase rotate-90 origin-center mt-4">Scroll</p>
                </div>

            </section>

            {/* ================= MEN COLLECTION ================= */}
            <section id="collections" className="bg-[#F8F8F8] py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-10 gap-4">
                        <div>
                            <p className="uppercase tracking-[6px] text-[#EF2E2E] font-semibold text-xs">MEN</p>
                            <h2 className="text-3xl md:text-4xl font-black mt-2">Premium Street Collection</h2>
                            <p className="text-gray-500 mt-2 max-w-xl text-sm hidden sm:block">Luxury essentials designed for confidence and everyday style.</p>
                        </div>
                        <button onClick={() => router.push("/men")}
                            className="group flex items-center gap-3 text-sm font-bold tracking-[3px] uppercase">
                            <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-[#EF2E2E] after:transition-all after:duration-300 group-hover:after:w-full">VIEW ALL</span>
                            <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-xs group-hover:bg-[#EF2E2E] group-hover:border-[#EF2E2E] group-hover:text-white transition duration-300">→</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.filter((p) => p.category === "Men").slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} dark={false} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= WOMEN COLLECTION ================= */}
            <section className="py-12 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-10 gap-4">
                        <div>
                            <p className="uppercase tracking-[6px] text-[#EF2E2E] font-semibold text-xs">WOMEN</p>
                            <h2 className="text-3xl md:text-4xl font-black mt-2">Elegant Fashion Collection</h2>
                            <p className="text-gray-500 mt-2 max-w-xl text-sm hidden sm:block">Modern silhouettes crafted with premium fabrics and timeless elegance.</p>
                        </div>
                        <button onClick={() => router.push("/women")}
                            className="group flex items-center gap-3 text-sm font-bold tracking-[3px] uppercase">
                            <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-[#EF2E2E] after:transition-all after:duration-300 group-hover:after:w-full">VIEW ALL</span>
                            <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-xs group-hover:bg-[#EF2E2E] group-hover:border-[#EF2E2E] group-hover:text-white transition duration-300">→</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.filter((p) => p.category === "Women").slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} dark={false} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= NEW ARRIVALS ================= */}
            <section id="new-arrivals" className="bg-black py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <p className="uppercase tracking-[8px] text-[#EF2E2E] font-semibold text-center text-xs">NEW ARRIVALS</p>
                    <h2 className="text-4xl md:text-6xl font-black text-center text-white mt-4">JUST DROPPED</h2>
                    <p className="text-white/60 text-center mt-3 max-w-2xl mx-auto text-sm">
                        Discover our newest premium collection designed for everyday luxury.
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-10 md:mt-14">
                        {products.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} dark={true} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section className="py-12 md:py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center">
                        {[
                            { icon: "🚚", title: "Free Shipping", sub: "Across India" },
                            { icon: "💎", title: "Premium Quality", sub: "Finest Materials" },
                            { icon: "🔒", title: "Secure Payment", sub: "100% Safe Checkout" },
                            { icon: "↩️", title: "Easy Returns", sub: "7 Day Return Policy" },
                        ].map((f) => (
                            <div key={f.title}>
                                <div className="text-3xl mb-3">{f.icon}</div>
                                <h3 className="font-bold text-base">{f.title}</h3>
                                <p className="text-gray-500 mt-1 text-xs">{f.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-black text-white">
                <div className="max-w-7xl mx-auto px-6 py-16">

                    <div className="text-center">

                        <img
                            src="/images/logo.png"
                            alt="Flyying Stone"
                            className="w-20 h-20 mx-auto object-contain"
                        />

                        <h2 className="mt-6 text-4xl font-light tracking-[10px]">
                            FLYYING STONE
                        </h2>

                        <div className="w-16 h-1 bg-[#FF3F6C] mx-auto mt-6 rounded-full"></div>

                        <p className="mt-8 text-lg text-white/70 max-w-xl mx-auto leading-8">
                            Premium fashion brand delivering timeless style
                            with modern confidence.
                        </p>

                        <p className="mt-4 text-white/60">
                            support@flyyingstone.com
                        </p>

                        <div className="mt-10 border-t border-white/10 pt-6">
                            <p className="text-white/50 text-sm">
                                © 2026 Flyying Stone. All Rights Reserved.
                            </p>
                        </div>

                    </div>

                </div>
            </footer>
            <ChatBot />
        </div>
    );
}