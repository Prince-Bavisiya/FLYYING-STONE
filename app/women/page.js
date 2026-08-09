"use client";

import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
    { value: "default", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A–Z" },
    { value: "name-desc", label: "Name: Z–A" },
];

const PRICE_RANGES = [
    { label: "All Prices", min: 0, max: Infinity },
    { label: "Under ₹1,000", min: 0, max: 1000 },
    { label: "₹1,000 – ₹3,000", min: 1000, max: 3000 },
    { label: "₹3,000 – ₹6,000", min: 3000, max: 6000 },
    { label: "Above ₹6,000", min: 6000, max: Infinity },
];

export default function Women() {
    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("default");
    const [priceRange, setPriceRange] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("/api/products", {
                    headers: { authorization: token },
                });
                setProducts(res.data.products);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getProducts();
    }, []);

    const womenProducts = useMemo(() => {
        const range = PRICE_RANGES[priceRange];
        let filtered = products
            .filter((p) => p.category === "Women")
            .filter((p) => {
                const price = Number(p.price);
                return price >= range.min && price < range.max;
            });

        switch (sort) {
            case "price-asc":
                filtered.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case "price-desc":
                filtered.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case "name-asc":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }
        return filtered;
    }, [products, sort, priceRange]);

    const activeFilters = [];
    if (priceRange !== 0) activeFilters.push({ label: PRICE_RANGES[priceRange].label, clear: () => setPriceRange(0) });

    return (
        <div className="min-h-screen bg-[#F9F9F7]">

            {/* ── Editorial Header ── */}
            <div className="border-b border-gray-200 bg-[#F9F9F7]">
                <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-16 pb-10">
                    <p className="text-[10px] tracking-[4px] text-[#D4AF37] uppercase mb-3 font-medium">
                        Flyying Stone
                    </p>
                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-none tracking-tight text-[#0F172A]">
                                Women
                            </h1>
                            <div className="h-[2px] w-16 bg-[#D4AF37] mt-3" />
                        </div>
                        <p className="text-sm text-gray-500 pb-1 self-end">
                            {loading ? "Loading…" : `${womenProducts.length} styles`}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="max-w-screen-xl mx-auto px-6 md:px-10">
                <div className="flex items-center justify-between py-5 border-b border-gray-100 gap-4 flex-wrap">

                    {/* Filter toggle + active chips */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={`flex items-center gap-2 text-xs font-semibold tracking-[2px] uppercase px-4 py-2.5 border transition-all duration-200 ${filterOpen
                                ? "bg-[#0F172A] text-white border-[#0F172A]"
                                : "bg-white text-[#0F172A] border-gray-300 hover:border-[#0F172A]"
                                }`}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Filter
                        </button>

                        {activeFilters.map((f, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-1.5 text-[10px] tracking-[1px] uppercase font-semibold bg-[#0F172A] text-white px-3 py-1.5"
                            >
                                {f.label}
                                <button onClick={f.clear} className="hover:text-[#D4AF37] transition">✕</button>
                            </span>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] tracking-[2px] uppercase text-gray-400 font-medium hidden sm:block">Sort by</span>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="border border-gray-300 text-xs font-semibold tracking-wide text-[#0F172A] px-4 py-2.5 bg-white outline-none cursor-pointer hover:border-[#0F172A] transition appearance-none pr-8"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%230F172A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Filter Panel ── */}
                <div className={`overflow-hidden transition-all duration-300 ${filterOpen ? "max-h-96 py-6" : "max-h-0"}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-6 border-b border-gray-100">
                        <div>
                            <p className="text-[10px] tracking-[3px] uppercase font-bold text-[#0F172A] mb-4">Price</p>
                            <div className="space-y-2">
                                {PRICE_RANGES.map((r, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <span className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center transition ${priceRange === i ? "border-[#D4AF37] bg-[#D4AF37]" : "border-gray-300 group-hover:border-[#0F172A]"}`}>
                                            {priceRange === i && (
                                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                    <path d="M1 3l2 2 4-4" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </span>
                                        <input type="radio" name="price-w" className="sr-only" checked={priceRange === i} onChange={() => setPriceRange(i)} />
                                        <span className={`text-xs transition ${priceRange === i ? "font-semibold text-[#0F172A]" : "text-gray-500 group-hover:text-[#0F172A]"}`}>
                                            {r.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Placeholder for future Size filter */}
                        <div>
                            <p className="text-[10px] tracking-[3px] uppercase font-bold text-[#0F172A] mb-4">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                                    <button key={s} className="w-9 h-9 border border-gray-200 text-xs font-semibold text-gray-500 hover:border-[#0F172A] hover:text-[#0F172A] transition">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Product Grid ── */}
            <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-10">

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-80 w-full mb-3" />
                                <div className="h-2.5 bg-gray-200 rounded w-2/3 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1.5" />
                                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : womenProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-16 h-[2px] bg-[#D4AF37] mb-8 mx-auto" />
                        <p className="text-[10px] tracking-[4px] uppercase text-[#D4AF37] mb-3">No results</p>
                        <p className="text-2xl font-black text-[#0F172A] mb-2">Nothing found</p>
                        <p className="text-sm text-gray-400 mb-8">Try adjusting your filters</p>
                        <button
                            onClick={() => { setPriceRange(0); setSort("default"); }}
                            className="text-[10px] tracking-[3px] uppercase font-semibold border border-[#0F172A] px-6 py-3 hover:bg-[#0F172A] hover:text-white transition"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-14">
                        {womenProducts.map((item, idx) => (
                            <ProductCard key={item.id} item={item} router={router} idx={idx} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Bottom editorial strip ── */}
            {!loading && womenProducts.length > 0 && (
                <div className="border-t border-gray-200 mt-10">
                    <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-10 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-[10px] tracking-[4px] uppercase text-gray-400">
                            Showing {womenProducts.length} styles
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-[1px] bg-[#D4AF37]" />
                            <p className="text-[10px] tracking-[3px] uppercase text-[#D4AF37] font-medium">Women's Collection</p>
                            <div className="w-8 h-[1px] bg-[#D4AF37]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductCard({ item, router, idx }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="group cursor-pointer"
            style={{ animationDelay: `${idx * 40}ms` }}
            onClick={() => router.push(`/product/${item.id}`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image container */}
            <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: "3/4" }}>
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Stock badge */}
                {item.stock !== undefined && item.stock <= 5 && item.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-[#0F172A] text-white text-[9px] tracking-[2px] uppercase font-semibold px-2.5 py-1">
                        Only {item.stock} left
                    </span>
                )}
                {item.stock === 0 && (
                    <span className="absolute top-3 left-3 bg-gray-400 text-white text-[9px] tracking-[2px] uppercase font-semibold px-2.5 py-1">
                        Sold out
                    </span>
                )}

                {/* Quick view overlay */}
                <div
                    className={`absolute inset-x-0 bottom-0 flex items-center justify-center py-4 bg-white/95 transition-all duration-300 ${hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                >
                    <span className="text-[10px] font-bold tracking-[3px] uppercase text-[#0F172A]">
                        Quick View
                    </span>
                </div>
            </div>

            {/* Product info */}
            <div className="pt-4">
                <p className="text-[9px] tracking-[2.5px] uppercase text-[#D4AF37] font-semibold mb-1">
                    Luxury Collection
                </p>
                <h3 className="text-sm font-semibold text-[#0F172A] leading-snug truncate pr-2">
                    {item.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-black text-[#0F172A]">
                        ₹{Math.round(Number(item.price)).toLocaleString("en-IN")}
                    </p>
                    <div
                        className={`w-4 h-[1.5px] bg-[#D4AF37] transition-all duration-300 ${hovered ? "w-8" : "w-4"}`}
                    />
                </div>
            </div>
        </div>
    );
}