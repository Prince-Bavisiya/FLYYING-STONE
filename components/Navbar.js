"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useBag } from "../context/BagContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {

    const { role, logout } = useAuth();
    const {
        products,
        increaseQuantity,
        decreaseQuantity,
        removeFromBag,
        isBagOpen,
        openBag,
        closeBag,
    } = useBag();
    const router = useRouter();

    const bagCount = products.reduce((sum, item) => sum + item.quantity, 0);
    const bagTotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    const userName = typeof window !== "undefined" ? localStorage.getItem("name") || "" : "";
    const displayName = userName ? userName.split(" ")[0] : "";

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchFocused(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === "Escape") {
                setDropdownOpen(false);
                setSearchFocused(false);
                closeBag();
            }
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [closeBag]);

    const runSearch = async (value) => {
        try {
            setSearchLoading(true);

            const response = await fetch(
                `http://localhost:5000/api/products/search?q=${encodeURIComponent(value)}`
            );

            const data = await response.json();

            setSearchResults(Array.isArray(data) ? data : data.products || []);

        } catch (error) {

            console.log(error);
            setSearchResults([]);

        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearch = (value) => {

        setSearch(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        debounceRef.current = setTimeout(() => runSearch(value), 300);
    };

    const clearSearch = () => {
        setSearch("");
        setSearchResults([]);
        setSearchLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("phone");
        logout();
        setDropdownOpen(false);
        router.push("/");
    };

    const showResultsPanel = searchFocused && search.trim().length > 0;

    return (
        <>
            <nav className="sticky top-0 z-[100] isolate bg-white border-b border-[#E5E7EB]">
                <div className="max-w-[1600px] mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-10 px-10 py-5">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-4 flex-shrink-0 whitespace-nowrap">
                        <Image src="/images/logo.png" alt="Flyying Stone" width={50} height={50} />
                        <span className="text-2xl tracking-[10px] font-light">FLYYING STONE</span>
                    </Link>

                    {/* SEARCH */}

                    <div className="relative w-full max-w-[420px] mx-auto z-[60]" ref={searchRef}>

                        <div
                            className={`
                                relative flex items-center
                                rounded-full
                                border
                                transition-all duration-200
                                ${searchFocused
                                    ? "border-[#FF3E6C] shadow-[0_0_0_4px_rgba(255,62,108,0.08)]"
                                    : "border-[#E5E7EB] hover:border-[#D1D5DB]"}
                            `}
                        >
                            {/* Search icon */}
                            <svg
                                width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke={searchFocused ? "#FF3E6C" : "#9CA3AF"}
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="absolute left-5 transition-colors duration-200 pointer-events-none"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" />
                            </svg>

                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                className="
                                    w-full
                                    pl-12
                                    pr-10
                                    py-3
                                    rounded-full
                                    text-sm
                                    bg-transparent
                                    focus:outline-none
                                    placeholder:text-gray-400
                                "
                            />

                            {/* Clear button */}
                            {search && (
                                <button
                                    onClick={clearSearch}
                                    aria-label="Clear search"
                                    className="
                                        absolute right-4
                                        w-5 h-5
                                        flex items-center justify-center
                                        rounded-full
                                        text-gray-400
                                        hover:bg-gray-100 hover:text-gray-600
                                        transition
                                    "
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* RESULTS PANEL */}
                        {showResultsPanel && (

                            <div className="
                                absolute
                                top-full
                                mt-3
                                left-0
                                w-full
                                max-w-[420px]
                                bg-white
                                shadow-2xl
                                rounded-2xl
                                border
                                border-[#E5E7EB]
                                overflow-hidden
                                z-[70]
                            ">

                                {/* Loading state */}
                                {searchLoading && (
                                    <div className="flex items-center gap-3 px-5 py-5">
                                        <span className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#FF3E6C] animate-spin" />
                                        <span className="text-xs tracking-wide text-gray-400 font-medium uppercase">Searching...</span>
                                    </div>
                                )}

                                {/* Empty state */}
                                {!searchLoading && searchResults.length === 0 && (
                                    <div className="px-5 py-6 text-center">
                                        <p className="text-sm font-semibold text-gray-700">No products found</p>
                                        <p className="text-xs text-gray-400 mt-1">Try a different keyword</p>
                                    </div>
                                )}

                                {/* Results */}
                                {!searchLoading && searchResults.length > 0 && (
                                    <div className="max-h-[420px] overflow-y-auto divide-y divide-[#F1F2F4]">
                                        {searchResults.slice(0, 6).map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={() => {
                                                    setSearchFocused(false);
                                                }}
                                                className="
                                                    flex items-center gap-4
                                                    px-4 py-3
                                                    hover:bg-[#FFF4F7]
                                                    transition
                                                    group
                                                "
                                            >
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                                                    {product.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#FF3E6C] transition">
                                                        {product.name}
                                                    </p>
                                                    {product.category && (
                                                        <p className="text-[10px] tracking-wider uppercase text-gray-400 mt-0.5">
                                                            {product.category}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                            </div>

                        )}

                    </div>

                    {/* Nav Links */}
                    <div className="flex items-center justify-end gap-12 uppercase tracking-[3px] text-sm font-medium flex-shrink-0 whitespace-nowrap">

                        <Link href="/" className="hover:text-gray-500 transition">Home</Link>
                        <Link href="/men" className="hover:text-gray-500 transition">Men</Link>
                        <Link href="/women" className="hover:text-gray-500 transition">Women</Link>

                        {/* BAG — ab Link nahi, button hai jo drawer kholta hai */}
                        <button
                            onClick={openBag}
                            className="hover:text-gray-500 transition relative"
                        >
                            Bag
                            {bagCount > 0 && (
                                <span className="absolute -top-3 -right-5 bg-red-500 text-white text-xs rounded-full px-2 py-[2px]">
                                    {bagCount}
                                </span>
                            )}
                        </button>

                        {/* ADMIN */}
                        {role === "admin" && (
                            <Link href="/admin" className="hover:text-gray-500 transition">Dashboard</Link>
                        )}

                        {/* PROFILE DROPDOWN */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 hover:text-gray-500 transition"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                                <span>{role && displayName ? displayName : "Profile"}</span>
                                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"
                                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                                    <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-3 w-76 bg-white border border-[#E5E7EB] shadow-xl rounded-xl z-50 overflow-hidden">

                                    {!role && (
                                        <>
                                            <div className="px-4 py-4 border-b border-[#E5E7EB] bg-[#F8F9FA]">
                                                <p className="text-[10px] tracking-widest text-gray-400 font-bold uppercase">Welcome</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Sign in for best experience</p>
                                            </div>
                                            <div className="p-3 space-y-2">
                                                <Link href="/profile" onClick={() => setDropdownOpen(false)}
                                                    className="block w-full text-center bg-[#FF3E6C] text-white text-xs font-bold tracking-widest uppercase py-3 rounded-lg hover:bg-[#e8325c] transition">
                                                    LOGIN
                                                </Link>
                                                <Link href="/profile" onClick={() => setDropdownOpen(false)}
                                                    className="block w-full text-center border border-black text-black text-xs font-bold tracking-widest uppercase py-3 rounded-lg hover:bg-black hover:text-white transition">
                                                    REGISTER
                                                </Link>
                                            </div>
                                        </>
                                    )}

                                    {role && (
                                        <>
                                            <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
                                                <p className="text-xs font-black text-[#0F172A]">{userName}</p>
                                                <p className="text-[10px] text-[#FF3E6C] font-bold mt-0.5">Premium Member</p>
                                            </div>
                                            <div className="py-1">
                                                {[
                                                    { href: "/profile", label: "My Profile" },
                                                    { href: "/profile", label: "My Orders" },
                                                    { href: "/profile", label: "Wishlist" },
                                                ].map((item, i) => (
                                                    <Link key={i} href={item.href}
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF3E6C] transition">
                                                        {item.label}
                                                    </Link>
                                                ))}
                                                <button
                                                    onClick={() => { setDropdownOpen(false); openBag(); }}
                                                    className="w-full flex items-center px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-[#F8F9FA] hover:text-[#FF3E6C] transition">
                                                    Shopping Bag
                                                </button>
                                            </div>
                                            <div className="border-t border-[#E5E7EB] p-2">
                                                <button onClick={handleLogout}
                                                    className="w-full text-center text-xs font-bold text-red-500 py-2.5 rounded-lg hover:bg-red-50 transition">
                                                    LOGOUT
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </nav>

            {/* BAG DRAWER — OVERLAY */}
            {isBagOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[150] transition-opacity"
                    onClick={closeBag}
                />
            )}

            {/* BAG DRAWER — RIGHT SIDE PANEL */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-full sm:w-[420px]
                    bg-white z-[200] shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    ${isBagOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
                    <h2 className="text-sm font-bold tracking-[3px] uppercase">
                        My Bag ({bagCount})
                    </h2>
                    <button
                        onClick={closeBag}
                        aria-label="Close bag"
                        className="text-gray-400 hover:text-black transition"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div className="overflow-y-auto px-6 py-4 space-y-5" style={{ height: "calc(100% - 220px)" }}>
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-sm font-semibold text-gray-700">Your bag is empty</p>
                            <p className="text-xs text-gray-400 mt-1">Add items to get started</p>
                            <button
                                onClick={closeBag}
                                className="mt-4 px-6 py-2.5 border border-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        products.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-[#F1F2F4] pb-5">
                                <div className="w-20 h-24 rounded-lg overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                                    {item.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : null}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#0F172A] truncate">{item.name}</p>
                                    {item.size && (
                                        <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>
                                    )}
                                    <p className="text-sm font-bold mt-1">₹{item.price * item.quantity}</p>

                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center border border-[#E5E7EB] rounded-md">
                                            <button
                                                onClick={() => decreaseQuantity(item.id, item.size)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                            >
                                                −
                                            </button>
                                            <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                                            <button
                                                onClick={() => increaseQuantity(item.id, item.size)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromBag(item.id, item.size)}
                                            className="ml-auto text-xs font-semibold text-gray-400 hover:text-red-500 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {products.length > 0 && (
                    <div className="absolute bottom-0 w-full px-6 py-5 border-t border-[#E5E7EB] bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">Subtotal</span>
                            <span className="text-base font-bold">₹{bagTotal}</span>
                        </div>
                        <Link
                            href="/bag"
                            onClick={closeBag}
                            className="block w-full text-center bg-[#FF3E6C] text-white text-xs font-bold tracking-widest uppercase py-3.5 rounded-lg hover:bg-[#e8325c] transition"
                        >
                            View Bag / Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}