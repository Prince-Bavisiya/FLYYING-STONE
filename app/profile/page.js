"use client";

import axios from "axios";
import { Suspense, useEffect, useState } from "react"; 
import { useRouter, useSearchParams } from "next/navigation"; // ✅ useSearchParams added
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useBag } from "../../context/BagContext";

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams(); // ✅ hook called at top level
    const { role, login, logout } = useAuth();
    const { wishlistItems, loading: wishlistLoading, removeFromWishlist } = useWishlist();
    const { addToBag } = useBag();

    // Auth form
    const [tab, setTab] = useState("login");
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" });

    // Profile
    const [user, setUser] = useState({ name: "", email: "", phone: "" });
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Addresses
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: "", phone: "", address: "", city: "", pincode: "", isPrimary: false,
    });
    const [addressSaving, setAddressSaving] = useState(false);
    const [addressError, setAddressError] = useState("");

    // Wishlist move-to-bag animation
    const [movingToBag, setMovingToBag] = useState(null);

    useEffect(() => {
        if (role) {
            setUser({
                name: localStorage.getItem("name") || "User",
                email: localStorage.getItem("email") || "",
                phone: localStorage.getItem("phone") || "",
            });
            fetchOrders();
            fetchAddresses();
        }
    }, [role]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/orders", {
                headers: { authorization: token }
            });
            setOrders(res.data.orders || []);
        } catch (e) {
            console.log(e);
        } finally {
            setOrdersLoading(false);
        }
    };

    // ───────────────────────────
    // Address handlers
    // ───────────────────────────

    const fetchAddresses = async () => {
        setAddressesLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/addresses", {
                headers: { authorization: token }
            });
            setAddresses(res.data.addresses || []);
        } catch (e) {
            console.log(e);
        } finally {
            setAddressesLoading(false);
        }
    };

    const resetAddressForm = () => {
        setAddressForm({ fullName: "", phone: "", address: "", city: "", pincode: "", isPrimary: false });
        setEditingAddressId(null);
        setAddressError("");
    };

    const openAddForm = () => { resetAddressForm(); setShowAddressForm(true); };
    const openEditForm = (addr) => {
        setAddressForm({
            fullName: addr.full_name || "",
            phone: addr.phone || "",
            address: addr.address || "",
            city: addr.city || "",
            pincode: addr.pincode || "",
            isPrimary: !!addr.is_primary,
        });
        setEditingAddressId(addr.id);
        setAddressError("");
        setShowAddressForm(true);
    };
    const closeAddressForm = () => { setShowAddressForm(false); resetAddressForm(); };

    const validateAddressForm = () => {
        const { fullName, phone, address, city, pincode } = addressForm;
        if (!fullName || !phone || !address || !city || !pincode) {
            setAddressError("Please fill all address details."); return false;
        }
        if (phone.length !== 10) { setAddressError("Enter a valid 10-digit phone number."); return false; }
        if (pincode.length !== 6) { setAddressError("Enter a valid 6-digit pincode."); return false; }
        return true;
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setAddressError("");
        if (!validateAddressForm()) return;
        setAddressSaving(true);
        try {
            const token = localStorage.getItem("token");
            if (editingAddressId) {
                await axios.put(`http://localhost:5000/api/addresses/${editingAddressId}`, addressForm, { headers: { authorization: token } });
            } else {
                await axios.post("http://localhost:5000/api/addresses", addressForm, { headers: { authorization: token } });
            }
            await fetchAddresses();
            closeAddressForm();
        } catch (err) {
            setAddressError(err.response?.data?.message || "Failed to save address.");
        } finally {
            setAddressSaving(false);
        }
    };

    const handleSetPrimary = async (addressId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/addresses/${addressId}/set-primary`, {}, { headers: { authorization: token } });
            await fetchAddresses();
        } catch (e) { alert("Failed to set primary address."); }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm("Delete this address?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/addresses/${addressId}`, { headers: { authorization: token } });
            await fetchAddresses();
        } catch (e) { alert("Failed to delete address."); }
    };

    // ───────────────────────────
    // Wishlist handlers
    // ───────────────────────────

    const handleMoveToBag = (item) => {
        setMovingToBag(item.product_id);
        addToBag({
            id: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            size: "M",
        });
        setTimeout(() => {
            removeFromWishlist(item.product_id);
            setMovingToBag(null);
        }, 800);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setAuthLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", loginData);
            localStorage.setItem("name", res.data.name || loginData.email.split("@")[0]);
            localStorage.setItem("email", loginData.email);
            login(res.data.token, res.data.role || "user");

            const redirect = searchParams.get("redirect"); // ✅ now works correctly

            if ((res.data.role || "user") === "admin") {
                router.push("/admin");
            } else if (redirect) {
                router.push(redirect); // ✅ e.g. /checkout when coming from bag
            } else {
                router.push("/"); // ✅ normal profile login → home
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        if (registerData.password !== registerData.confirm) { setError("Passwords do not match."); return; }
        setAuthLoading(true);
        try {
            await axios.post("http://localhost:5000/api/auth/register", {
                name: registerData.name, email: registerData.email, password: registerData.password,
            });
            setSuccess("Account created! Please login.");
            setTab("login");
            setLoginData({ email: registerData.email, password: "" });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("phone");
        logout();
    };

    const initial = user.name?.charAt(0).toUpperCase() || "U";
    const inputCls = "w-full border border-[#E5E7EB] px-4 py-3 text-sm text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:border-[#FF3E6C] transition bg-white rounded-lg";

    // ══════════════════════════════════
    // NOT LOGGED IN
    // ══════════════════════════════════
    if (!role) {
        return (
            <div className="min-h-screen bg-[#F8F9FA]">
                <div className="max-w-lg mx-auto px-4 py-16">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Welcome to Flyying Stone</h1>
                        <p className="text-gray-500 text-sm mt-2">Sign in to access your account</p>
                    </div>

                    <div className="flex border-b border-[#E5E7EB] mb-6">
                        <button onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
                            className={`flex-1 py-3 text-sm font-bold transition-all ${tab === "login" ? "text-[#FF3E6C] border-b-2 border-[#FF3E6C]" : "text-gray-400 hover:text-[#0F172A]"}`}>
                            LOGIN
                        </button>
                        <button onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
                            className={`flex-1 py-3 text-sm font-bold transition-all ${tab === "register" ? "text-[#FF3E6C] border-b-2 border-[#FF3E6C]" : "text-gray-400 hover:text-[#0F172A]"}`}>
                            REGISTER
                        </button>
                    </div>

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg mb-4">{error}</div>}
                    {success && <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-4 py-3 rounded-lg mb-4">{success}</div>}

                    {tab === "login" && (
                        <form onSubmit={handleLogin} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Email Address</label>
                                <input type="email" required placeholder="your@email.com" value={loginData.email}
                                    onChange={e => setLoginData({ ...loginData, email: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Password</label>
                                <input type="password" required placeholder="••••••••" value={loginData.password}
                                    onChange={e => setLoginData({ ...loginData, password: e.target.value })} className={inputCls} />
                            </div>
                            <button type="submit" disabled={authLoading}
                                className="w-full bg-[#FF3E6C] text-white py-3.5 text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[#e8325c] transition disabled:opacity-50">
                                {authLoading ? "Signing In..." : "SIGN IN"}
                            </button>
                            <p className="text-center text-xs text-gray-500">
                                Don't have an account?{" "}
                                <button type="button" onClick={() => setTab("register")} className="text-[#FF3E6C] font-bold">Create one</button>
                            </p>
                        </form>
                    )}

                    {tab === "register" && (
                        <form onSubmit={handleRegister} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Full Name</label>
                                <input type="text" required placeholder="Your full name" value={registerData.name}
                                    onChange={e => setRegisterData({ ...registerData, name: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Email Address</label>
                                <input type="email" required placeholder="your@email.com" value={registerData.email}
                                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Password</label>
                                <input type="password" required placeholder="••••••••" value={registerData.password}
                                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Confirm Password</label>
                                <input type="password" required placeholder="••••••••" value={registerData.confirm}
                                    onChange={e => setRegisterData({ ...registerData, confirm: e.target.value })} className={inputCls} />
                            </div>
                            <button type="submit" disabled={authLoading}
                                className="w-full bg-[#FF3E6C] text-white py-3.5 text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[#e8325c] transition disabled:opacity-50">
                                {authLoading ? "Creating Account..." : "CREATE ACCOUNT"}
                            </button>
                            <p className="text-center text-xs text-gray-500">
                                Already have an account?{" "}
                                <button type="button" onClick={() => setTab("login")} className="text-[#FF3E6C] font-bold">Sign in</button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // ══════════════════════════════════
    // LOGGED IN — PROFILE DASHBOARD
    // ══════════════════════════════════
    return (
        <div className="min-h-screen bg-[#F8F9FA]">

            {/* ── Profile Header ── */}
            <div className="bg-white border-b border-[#E5E7EB]">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-[#FF3E6C] text-white flex items-center justify-center text-2xl font-black flex-shrink-0">
                                {initial}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#0F172A]">{user.name}</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                                {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#FF3E6C] inline-block" />
                                    <span className="text-[10px] text-[#FF3E6C] font-bold tracking-widest uppercase">Premium Member</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActiveTab("settings")}
                                className="border border-[#E5E7EB] text-[#0F172A] text-xs font-bold px-5 py-2.5 rounded-lg hover:border-[#0F172A] transition">
                                Edit Profile
                            </button>
                            <button onClick={handleLogout}
                                className="bg-[#0F172A] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-black transition">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex gap-0 overflow-x-auto">
                        {[
                            { key: "orders", label: "My Orders" },
                            { key: "wishlist", label: `Wishlist${wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ""}` },
                            { key: "address", label: "Saved Addresses" },
                            { key: "settings", label: "Account Settings" },
                        ].map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className={`px-5 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === t.key
                                    ? "border-[#FF3E6C] text-[#FF3E6C]"
                                    : "border-transparent text-gray-400 hover:text-[#0F172A]"
                                    }`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="max-w-5xl mx-auto px-6 py-8">

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                    <div>
                        <h3 className="text-base font-black text-[#0F172A] mb-5">My Orders</h3>
                        {ordersLoading ? (
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-gray-400 text-sm">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
                                <div className="text-5xl mb-4">📦</div>
                                <h3 className="font-bold text-[#0F172A]">No Orders Yet</h3>
                                <p className="text-gray-400 text-sm mt-2">Your orders will appear here</p>
                                <button onClick={() => router.push("/")}
                                    className="mt-5 bg-[#FF3E6C] text-white text-xs font-bold px-6 py-3 rounded-lg hover:bg-[#e8325c] transition">
                                    SHOP NOW
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                                        <div className="flex items-start justify-between flex-wrap gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Order #{order.id}</p>
                                                <p className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                                                <p className="text-base font-black text-[#0F172A] mt-2">₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                        {order.payment_status?.toUpperCase() || "PENDING"}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Order Status</p>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.order_status === "delivered" || order.order_status === "completed" ? "bg-green-100 text-green-700" : order.order_status === "shipped" ? "bg-blue-100 text-blue-700" : order.order_status === "processing" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                                        {order.order_status?.toUpperCase() || "PENDING"}
                                                    </span>
                                                </div>
                                                <button onClick={() => router.push(`/profile/orders/${order.id}`)}
                                                    className="mt-1 border border-[#E5E7EB] text-[#0F172A] text-xs font-bold px-4 py-2 rounded-lg hover:border-[#0F172A] transition">
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── WISHLIST TAB ── */}
                {activeTab === "wishlist" && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-black text-[#0F172A]">
                                My Wishlist
                                {wishlistItems.length > 0 && (
                                    <span className="ml-2 text-sm font-semibold text-gray-400">({wishlistItems.length} items)</span>
                                )}
                            </h3>
                            {wishlistItems.length > 0 && (
                                <button onClick={() => router.push("/")}
                                    className="text-xs font-bold text-[#FF3E6C] hover:underline underline-offset-2 tracking-wider uppercase">
                                    + Add More
                                </button>
                            )}
                        </div>

                        {wishlistLoading ? (
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-gray-400 text-sm">
                                Loading wishlist...
                            </div>
                        ) : wishlistItems.length === 0 ? (
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
                                <div className="text-5xl mb-4">❤️</div>
                                <h3 className="font-bold text-[#0F172A]">Your Wishlist is Empty</h3>
                                <p className="text-gray-400 text-sm mt-2">Save your favourite products here</p>
                                <button onClick={() => router.push("/")}
                                    className="mt-5 bg-[#FF3E6C] text-white text-xs font-bold px-6 py-3 rounded-lg hover:bg-[#e8325c] transition">
                                    EXPLORE PRODUCTS
                                </button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {wishlistItems.map(item => (
                                    <div key={item.product_id}
                                        className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden group hover:border-[#FF3E6C] transition-all duration-200">

                                        {/* Image */}
                                        <div className="relative overflow-hidden bg-[#F8F9FA] h-52 cursor-pointer"
                                            onClick={() => router.push(`/product/${item.product_id}`)}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.product_id); }}
                                                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition"
                                                title="Remove from Wishlist"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF3E6C" className="w-4 h-4">
                                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mb-1">
                                                {item.category === "Men" ? "Premium Collection" : "Luxury Collection"}
                                            </p>
                                            <h4 className="text-sm font-black text-[#0F172A] leading-tight line-clamp-1 mb-2">
                                                {item.name}
                                            </h4>
                                            <p className="text-base font-black text-[#0F172A]">
                                                ₹{Math.round(Number(item.price)).toLocaleString("en-IN")}
                                            </p>
                                            <p className="text-xs line-through text-gray-400">
                                                ₹{Math.round(Number(item.price) * 1.3).toLocaleString("en-IN")}
                                            </p>

                                            <button
                                                onClick={() => handleMoveToBag(item)}
                                                disabled={movingToBag === item.product_id}
                                                className={`mt-3 w-full py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg transition
                                                    ${movingToBag === item.product_id
                                                        ? "bg-green-600 text-white"
                                                        : "bg-[#0F172A] text-white hover:bg-[#FF3E6C]"
                                                    }`}
                                            >
                                                {movingToBag === item.product_id ? "✓ Added to Bag!" : "Move to Bag"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ADDRESS TAB */}
                {activeTab === "address" && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-black text-[#0F172A]">Saved Addresses</h3>
                            {!showAddressForm && (
                                <button onClick={openAddForm}
                                    className="bg-[#FF3E6C] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#e8325c] transition">
                                    + Add Address
                                </button>
                            )}
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleSaveAddress} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-[#0F172A]">{editingAddressId ? "Edit Address" : "Add New Address"}</h4>
                                    <button type="button" onClick={closeAddressForm} className="text-gray-400 hover:text-[#0F172A] text-sm">✕</button>
                                </div>
                                {addressError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg">{addressError}</div>}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Full Name *</label>
                                        <input type="text" placeholder="e.g. Arjun Sharma" value={addressForm.fullName}
                                            onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Phone Number *</label>
                                        <input type="tel" placeholder="10-digit mobile number" value={addressForm.phone} maxLength={10}
                                            onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className={inputCls} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Street Address *</label>
                                    <textarea rows={2} placeholder="House / Flat no., Street, Locality..." value={addressForm.address}
                                        onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} className={inputCls + " resize-none"} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">City *</label>
                                        <input type="text" placeholder="e.g. Mumbai" value={addressForm.city}
                                            onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Pincode *</label>
                                        <input type="text" placeholder="6-digit pincode" value={addressForm.pincode} maxLength={6}
                                            onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} className={inputCls} />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                                    <input type="checkbox" checked={addressForm.isPrimary}
                                        onChange={e => setAddressForm({ ...addressForm, isPrimary: e.target.checked })} className="w-4 h-4 accent-[#FF3E6C]" />
                                    <span className="text-xs font-semibold text-gray-600">Set as primary address</span>
                                </label>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" disabled={addressSaving}
                                        className="flex-1 bg-[#FF3E6C] text-white py-3 text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[#e8325c] transition disabled:opacity-50">
                                        {addressSaving ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                                    </button>
                                    <button type="button" onClick={closeAddressForm}
                                        className="px-6 border border-[#E5E7EB] text-[#0F172A] text-sm font-bold rounded-lg hover:border-[#0F172A] transition">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {addressesLoading ? (
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-gray-400 text-sm">Loading addresses...</div>
                        ) : addresses.length === 0 && !showAddressForm ? (
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">
                                <div className="text-4xl mb-3">📍</div>
                                <h3 className="font-bold text-[#0F172A] text-sm">No Saved Addresses</h3>
                                <p className="text-gray-400 text-xs mt-1">Add a delivery address for faster checkout</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map(addr => (
                                    <div key={addr.id} className={`bg-white border rounded-2xl p-5 transition ${addr.is_primary ? "border-[#FF3E6C]" : "border-[#E5E7EB]"}`}>
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="flex-1 min-w-[200px]">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <p className="text-sm font-bold text-[#0F172A]">{addr.full_name}</p>
                                                    {!!addr.is_primary && (
                                                        <span className="bg-[#FF3E6C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">Primary</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-6">{addr.address}</p>
                                                <p className="text-sm text-gray-600">{addr.city} – {addr.pincode}</p>
                                                <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {!addr.is_primary && (
                                                    <button onClick={() => handleSetPrimary(addr.id)} className="text-[#FF3E6C] text-xs font-bold hover:underline">Set as Primary</button>
                                                )}
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditForm(addr)} className="border border-[#E5E7EB] text-[#0F172A] text-xs font-bold px-3 py-1.5 rounded-lg hover:border-[#0F172A] transition">Edit</button>
                                                    <button onClick={() => handleDeleteAddress(addr.id)} className="border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && (
                    <div className="max-w-xl">
                        <h3 className="text-base font-black text-[#0F172A] mb-5">Account Settings</h3>
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5">
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Full Name</label>
                                <input type="text" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Email Address</label>
                                <input type="email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Phone Number</label>
                                <input type="tel" value={user.phone} placeholder="+91 XXXXX XXXXX" onChange={e => setUser({ ...user, phone: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1.5">Membership</label>
                                <input type="text" value="Premium Member" readOnly className="w-full border border-[#E5E7EB] px-4 py-3 text-sm text-gray-400 bg-gray-50 rounded-lg" />
                            </div>
                            <button onClick={() => {
                                localStorage.setItem("name", user.name);
                                localStorage.setItem("email", user.email);
                                localStorage.setItem("phone", user.phone);
                                alert("Profile updated!");
                            }} className="w-full bg-[#FF3E6C] text-white py-3.5 text-sm font-bold tracking-widest uppercase rounded-lg hover:bg-[#e8325c] transition">
                                SAVE CHANGES
                            </button>
                            <div className="border-t border-[#E5E7EB] pt-5">
                                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest mb-4">Danger Zone</h4>
                                <button onClick={handleLogout} className="w-full border border-red-200 text-red-500 py-3 text-sm font-bold rounded-lg hover:bg-red-50 transition">
                                    LOGOUT FROM ALL DEVICES
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default function Profile() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <ProfileContent />
        </Suspense>
    );
}