"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";


export default function Home() {

    const slides = [
        {
            image: "/images/store10.png",
            objectPosition: "center center",
            title: "ELEVATE\nYOUR\nSTYLE",
            subtitle: "Discover premium fashion crafted for modern men and women. Timeless designs, luxury fabrics and everyday confidence.",
            tag: "NEW SEASON 2026",
        },
        {
            image: "/images/store11.png",
            objectPosition: "center center",
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
            .get("http://localhost:5000/api/products")
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
            <section className="relative overflow-hidden bg-black" style={{ height: "88vh" }}>

                {/* Slides */}
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
                                    top: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    height: "100%",
                                    width: "auto",
                                    maxWidth: "none",
                                    objectFit: "unset",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Gradient overlay — lighter, only left side dark for text readability */}
                <div className="absolute inset-0"
                    style={{
                        background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.05) 100%)"
                    }}
                />

                {/* Subtle red glow — much softer */}
                <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-red-700/10 blur-[120px] pointer-events-none" />

                {/* Nav arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white text-lg backdrop-blur-sm hover:bg-[#EF2E2E] hover:border-[#EF2E2E] transition duration-300 flex items-center justify-center"
                >❮</button>
                <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white text-lg backdrop-blur-sm hover:bg-[#EF2E2E] hover:border-[#EF2E2E] transition duration-300 flex items-center justify-center"
                >❯</button>

                {/* Content */}
                <div className="absolute inset-0 z-20 flex items-center">
                    <div className="max-w-7xl mx-auto px-12 w-full">
                        <div className="max-w-xl">

                            {/* Tag */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-6 h-[2px] bg-[#EF2E2E]" />
                                <p className="uppercase tracking-[6px] text-[#EF2E2E] font-semibold text-xs">
                                    {slides[currentSlide].tag}
                                </p>
                            </div>

                            {/* Heading */}
                            <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-black leading-[1] text-white whitespace-pre-line tracking-tight">
                                {slides[currentSlide].title}
                            </h1>

                            {/* Divider */}
                            <div className="w-14 h-[3px] bg-[#EF2E2E] mt-6 mb-5" />

                            {/* Subtitle */}
                            <p className="text-sm text-white/75 leading-7 max-w-sm">
                                {slides[currentSlide].subtitle}
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" })}
                                    className="bg-[#EF2E2E] hover:bg-red-700 transition-all duration-300 px-8 py-3.5 text-white text-xs font-bold uppercase tracking-[2px]"
                                >
                                    SHOP NOW
                                </button>
                                <button
                                    onClick={() => document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" })}
                                    className="border border-white/60 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[2px] hover:bg-white hover:text-black transition-all duration-300"
                                >
                                    EXPLORE
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 mt-10 pt-8 border-t border-white/15">
                                {[
                                    { val: "50K+", label: "Customers" },
                                    { val: "500+", label: "Products" },
                                    { val: "★ 4.9", label: "Rating" },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <p className="text-white text-xl font-black">{s.val}</p>
                                        <p className="text-white/50 text-xs mt-0.5 tracking-[1px] uppercase">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Slide number indicator — premium style */}
                <div className="absolute bottom-8 left-12 z-30 flex items-center gap-4">
                    <span className="text-white/40 text-xs font-semibold tracking-[2px]">
                        0{currentSlide + 1}
                    </span>
                    <div className="flex gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all duration-500 rounded-full ${currentSlide === index ? "w-8 h-1.5 bg-[#EF2E2E]" : "w-1.5 h-1.5 bg-white/30"}`}
                            />
                        ))}
                    </div>
                    <span className="text-white/25 text-xs font-semibold tracking-[2px]">
                        0{slides.length}
                    </span>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 right-10 z-30 flex flex-col items-center gap-2">
                    <div className="w-[1px] h-10 bg-gradient-to-b from-white/0 to-white/40" />
                    <p className="text-white/40 text-[10px] tracking-[3px] uppercase rotate-90 origin-center mt-4">Scroll</p>
                </div>

            </section>

            {/* ================= MEN COLLECTION ================= */}
            <section id="collections" className="bg-[#F8F8F8] py-20">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <p className="uppercase tracking-[6px] text-[#EF2E2E] font-semibold text-xs">MEN</p>
                            <h2 className="text-4xl font-black mt-2">Premium Street Collection</h2>
                            <p className="text-gray-500 mt-3 max-w-xl text-sm">Luxury essentials designed for confidence and everyday style.</p>
                        </div>
                        <button onClick={() => router.push("/men")}
                            className="group flex items-center gap-3 text-sm font-bold tracking-[3px] uppercase">
                            <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-[#EF2E2E] after:transition-all after:duration-300 group-hover:after:w-full">VIEW ALL</span>
                            <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-xs group-hover:bg-[#EF2E2E] group-hover:border-[#EF2E2E] group-hover:text-white transition duration-300">→</span>
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.filter((p) => p.category === "Men").slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} dark={false} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= WOMEN COLLECTION ================= */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <p className="uppercase tracking-[6px] text-[#EF2E2E] font-semibold text-xs">WOMEN</p>
                            <h2 className="text-4xl font-black mt-2">Elegant Fashion Collection</h2>
                            <p className="text-gray-500 mt-3 max-w-xl text-sm">Modern silhouettes crafted with premium fabrics and timeless elegance.</p>
                        </div>
                        <button onClick={() => router.push("/women")}
                            className="group flex items-center gap-3 text-sm font-bold tracking-[3px] uppercase">
                            <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-[#EF2E2E] after:transition-all after:duration-300 group-hover:after:w-full">VIEW ALL</span>
                            <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-xs group-hover:bg-[#EF2E2E] group-hover:border-[#EF2E2E] group-hover:text-white transition duration-300">→</span>
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.filter((p) => p.category === "Women").slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} dark={false} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= NEW ARRIVALS ================= */}
            <section id="new-arrivals" className="bg-black py-20">
                <div className="max-w-7xl mx-auto px-8">
                    <p className="uppercase tracking-[8px] text-[#EF2E2E] font-semibold text-center text-xs">NEW ARRIVALS</p>
                    <h2 className="text-5xl md:text-6xl font-black text-center text-white mt-4">JUST DROPPED</h2>
                    <p className="text-white/60 text-center mt-4 max-w-2xl mx-auto text-sm">
                        Discover our newest premium collection designed for everyday luxury.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
                        {products.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} dark={true} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid md:grid-cols-4 gap-10 text-center">
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
            <footer className="bg-[#050505] text-white">
                <div className="border-t border-white/10"></div>
                <div className="max-w-7xl mx-auto px-8 py-20">
                    <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-14">

                        <div>
                            <h2 className="uppercase tracking-[8px] text-4xl font-light" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                FLYYING STONE
                            </h2>
                            <div className="w-14 h-[2px] bg-red-500 mt-6 mb-8"></div>
                            <p className="text-white/60 leading-8 text-[16px]">
                                Premium fashion brand delivering timeless style with modern confidence. Crafted for people who lead, not follow.
                            </p>
                            <div className="flex gap-4 mt-10">
                                {["fa-instagram", "fa-facebook-f", "fa-x-twitter", "fa-youtube"].map((icon) => (
                                    <div key={icon} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-red-500 hover:border-red-500 duration-300 cursor-pointer">
                                        <i className={`fa-brands ${icon}`}></i>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="uppercase tracking-[4px] text-lg font-semibold mb-8">Shop</h3>
                            <div className="space-y-4 text-white/60">
                                {["Men", "Women", "New Arrivals", "Best Sellers", "Collections", "Sale"].map((item) => (
                                    <p key={item} className="hover:text-white cursor-pointer transition">{item}</p>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="uppercase tracking-[4px] text-lg font-semibold mb-8">Support</h3>
                            <div className="space-y-4 text-white/60">
                                {["Contact Us", "Shipping & Delivery", "Returns & Exchanges", "Size Guide", "FAQ", "Track Order"].map((item) => (
                                    <p key={item} className="hover:text-white cursor-pointer transition">{item}</p>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="uppercase tracking-[4px] text-lg font-semibold mb-8">Company</h3>
                            <div className="space-y-4 text-white/60">
                                {["About Us", "Our Story", "Careers", "Privacy Policy", "Terms & Conditions"].map((item) => (
                                    <p key={item} className="hover:text-white cursor-pointer transition">{item}</p>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="uppercase tracking-[4px] text-lg font-semibold mb-8">Newsletter</h3>
                            <p className="text-white/60 leading-8 mb-6">Subscribe and get 10% OFF your first order.</p>
                            <div className="relative">
                                <input type="email" placeholder="Enter your email"
                                    className="w-full h-14 rounded-xl bg-[#101010] border border-white/10 pl-5 pr-14 outline-none placeholder:text-gray-500 focus:border-red-500 transition" />
                                <i className="fa-regular fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>
                            <button className="w-full h-14 mt-5 rounded-xl bg-red-500 hover:bg-red-600 duration-300 uppercase tracking-[2px] font-semibold">
                                Subscribe
                            </button>
                            <p className="text-white/40 text-sm mt-5">✓ No spam, unsubscribe anytime.</p>
                        </div>
                    </div>

                    <div className="border-t border-white/10 mt-20 pt-8 flex flex-col lg:flex-row justify-between items-center gap-8">
                        <p className="text-white/40 text-sm">© 2026 <span className="text-white">FLYYING STONE</span>. All Rights Reserved.</p>
                        <div className="flex flex-wrap gap-3">
                            {["VISA", "MasterCard", "AMEX", "UPI", "Apple Pay"].map((card) => (
                                <div key={card} className="bg-[#111] px-5 py-3 rounded-lg text-sm">{card}</div>
                            ))}
                        </div>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="flex items-center gap-3 text-white/60 hover:text-white transition">
                            Back to top
                            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">↑</div>
                        </button>
                    </div>
                </div>
            </footer>

        </div>
    );
}
