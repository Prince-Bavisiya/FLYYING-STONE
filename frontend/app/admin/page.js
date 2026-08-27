"use client";

import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#D4AF37", "#0F172A", "#EF4444", "#3B82F6"];

function downloadCSV(filename, headers, rows) {
    const csvContent = [headers, ...rows]
        .map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function CsvButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#C9A227] text-black text-xs font-bold px-4 py-2 rounded-xl transition"
        >
            ⬇ Download CSV
        </button>
    );
}

function Pagination({ total, page, perPage, onPageChange }) {
    const totalPages = Math.ceil(total / perPage);
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white">
            <p className="text-xs text-gray-400">
                Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center text-xs border border-gray-200 rounded-lg hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition">
                    ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === "..." ? (
                            <span key={`dot-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">…</span>
                        ) : (
                            <button key={p} onClick={() => onPageChange(p)}
                                className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg border transition font-bold ${page === p
                                    ? "bg-[#D4AF37] border-[#D4AF37] text-black"
                                    : "border-gray-200 hover:border-[#D4AF37] text-gray-600"}`}>
                                {p}
                            </button>
                        )
                    )}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center text-xs border border-gray-200 rounded-lg hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition">
                    ›
                </button>
            </div>
        </div>
    );
}

export default function Admin() {

    const [activeSection, setActiveSection] = useState("dashboard");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
    const [orderChart, setOrderChart] = useState([]);
    const [revenueChart, setRevenueChart] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const [productPage, setProductPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [customerPage, setCustomerPage] = useState(1);
    const [inventoryPage, setInventoryPage] = useState(1);
    const [couponPage, setCouponPage] = useState(1);
    const PER_PAGE = 10;

    const [editId, setEditId] = useState(null);
    const [productForm, setProductForm] = useState({ name: "", description: "", price: "", image: "", category: "", stock: "" });
    const [productSearch, setProductSearch] = useState("");
    const [productCategory, setProductCategory] = useState("All");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingForm, setTrackingForm] = useState({ courier: "", tracking: "" });
    const [orderSearch, setOrderSearch] = useState("");

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState("");

    const [inventorySearch, setInventorySearch] = useState("");

    const [editCouponId, setEditCouponId] = useState(null);
    const [couponForm, setCouponForm] = useState({
        code: "", discount_type: "flat", discount_value: "",
        min_order_amount: "", max_discount: "", usage_limit: "", expiry_date: "",
    });
    const [couponSearch, setCouponSearch] = useState("");

    const [settings, setSettings] = useState({ storeName: "ZAYRO", email: "", phone: "", address: "" });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const headers = { authorization: token };

    const getStats = async () => {
        try { const res = await axios.get("/api/admin/stats", { headers }); setStats(res.data.stats); } catch (e) { console.log(e); }
    };
    const getProducts = async () => {
        try { const res = await axios.get("/api/products", { headers }); setProducts(res.data.products); } catch (e) { console.log(e); }
    };
    const getOrders = async () => {
        try { const res = await axios.get("/api/admin/orders", { headers }); setOrders(res.data.orders); } catch (e) { console.log(e); }
    };

    // ── FIXED: removed /admin prefix to match actual backend route ──
    const getCustomers = async () => {
        try { const res = await axios.get("/api/customers", { headers }); setCustomers(res.data.customers || []); } catch (e) { console.log(e); }
    };

    const getCoupons = async () => {
        try { const res = await axios.get("/api/coupons/admin/coupons", { headers }); setCoupons(res.data.coupons || []); } catch (e) { console.log(e); }
    };

    const getOrderChart = async () => {
        try {
            const res = await axios.get("/api/admin/charts/orders", { headers });
            setOrderChart(res.data.chart);
        } catch (err) { console.log(err); }
    };

    const getRevenueChart = async () => {
        try {
            const res = await axios.get("/api/admin/charts/revenue", { headers });
            setRevenueChart(res.data.chart);
        } catch (err) { console.log(err); }
    };

    const getCategoryChart = async () => {
        try {
            const res = await axios.get("/api/admin/charts/categories", { headers });
            setCategoryData(res.data.chart);
        } catch (err) { console.log(err); }
    };

    const getTopProducts = async () => {
        try {
            const res = await axios.get("/api/admin/charts/top-products", { headers });
            setTopProducts(res.data.products);
        } catch (err) { console.log(err); }
    };

    useEffect(() => {
        getStats();
        getProducts();
        getOrders();
        getCustomers();
        getCoupons();
        getOrderChart();
        getRevenueChart();
        getCategoryChart();
        getTopProducts();
    }, []);

    const handleAddProduct = async () => {

        const loadingToast = toast.loading("Adding product...");

        try {

            const res = await axios.post(
                "/api/products/add",
                productForm,
                { headers }
            );

            toast.success(res.data.message || "Product added successfully 🎉", {
                id: loadingToast,
            });

            setProductForm({
                name: "",
                description: "",
                price: "",
                image: "",
                category: "",
                stock: "",
            });

            getProducts();

        } catch (e) {

            toast.error(
                e.response?.data?.message || "Failed to add product",
                {
                    id: loadingToast,
                }
            );

        }

    };
    const handleUpdateProduct = async () => {

        const loadingToast = toast.loading("Updating product...");

        try {

            const res = await axios.put(
                `/api/products/${editId}`,
                productForm,
                { headers }
            );

            toast.success(
                res.data.message || "Product updated successfully 🎉",
                {
                    id: loadingToast,
                }
            );

            setEditId(null);

            setProductForm({
                name: "",
                description: "",
                price: "",
                image: "",
                category: "",
                stock: "",
            });

            getProducts();

        } catch (e) {

            toast.error(
                e.response?.data?.message || "Failed to update product",
                {
                    id: loadingToast,
                }
            );

        }

    };
    const handleDeleteProduct = async (id) => {

        if (!window.confirm("Delete this product?")) return;

        const loadingToast = toast.loading("Deleting product...");

        try {

            const res = await axios.delete(
                `/api/products/${id}`,
                { headers }
            );

            toast.success(res.data.message || "Product deleted successfully", {
                id: loadingToast,
            });

            getProducts();

        } catch (e) {

            toast.error(
                e.response?.data?.message || "Failed to delete product",
                {
                    id: loadingToast,
                }
            );

        }

    };
    const router = useRouter(); // top mein "next/navigation" se import karo

    const handleEditClick = (p) => {
        router.push(`/admin/products/edit/${p.id}`);
    };
    const handleStatusChange = async (orderId, status) => {
        try { await axios.put(`/api/admin/orders/${orderId}/status`, { status }, { headers }); getOrders(); } catch (e) { alert(e.response?.data?.message || e.message); }
    };
    const handleTrackingUpdate = async (orderId) => {
        try { await axios.put(`/api/admin/orders/${orderId}/tracking`, trackingForm, { headers }); alert("Tracking updated!"); setSelectedOrder(null); getOrders(); } catch (e) { alert(e.response?.data?.message || e.message); }
    };

    const emptyCouponForm = { code: "", discount_type: "flat", discount_value: "", min_order_amount: "", max_discount: "", usage_limit: "", expiry_date: "" };

    const handleAddCoupon = async () => {
        if (!couponForm.code || !couponForm.discount_value) { alert("Coupon code and discount value are required."); return; }
        try {
            const res = await axios.post("/api/coupons/admin/coupons", couponForm, { headers });
            alert(res.data.message);
            setCouponForm(emptyCouponForm);
            getCoupons();
        } catch (e) { alert(e.response?.data?.message || e.message); }
    };
    const handleUpdateCoupon = async () => {
        try {
            const res = await axios.put(`/api/coupons/admin/coupons/${editCouponId}`, couponForm, { headers });
            alert(res.data.message);
            setEditCouponId(null);
            setCouponForm(emptyCouponForm);
            getCoupons();
        } catch (e) { alert(e.response?.data?.message || e.message); }
    };
    const handleToggleCoupon = async (id) => {
        try { await axios.put(`/api/coupons/admin/coupons/${id}/toggle`, {}, { headers }); getCoupons(); }
        catch (e) { alert(e.response?.data?.message || e.message); }
    };
    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try { const res = await axios.delete(`/api/coupons/admin/coupons/${id}`, { headers }); alert(res.data.message); getCoupons(); }
        catch (e) { alert(e.response?.data?.message || e.message); }
    };
    const handleEditCouponClick = (c) => {
        setEditCouponId(c.id);
        setCouponForm({
            code: c.code,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            min_order_amount: c.min_order_amount || "",
            max_discount: c.max_discount || "",
            usage_limit: c.usage_limit || "",
            expiry_date: c.expiry_date ? String(c.expiry_date).split("T")[0] : "",
        });
        setActiveSection("coupons");
    };
    const handleCancelCouponEdit = () => {
        setEditCouponId(null);
        setCouponForm(emptyCouponForm);
    };

    const getNextStatuses = (status) => {
        switch (status) {
            case "pending": return ["processing", "cancelled"];
            case "processing": return ["shipped", "cancelled"];
            case "shipped": return ["delivered"];
            default: return [];
        }
    };

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
        const matchCat = productCategory === "All" || p.category === productCategory;
        return matchSearch && matchCat;
    });

    const [prodSortCfg, setProdSortCfg] = useState({ key: "name", dir: "asc" });
    const [ordSortCfg, setOrdSortCfg] = useState({ key: "id", dir: "desc" });
    const [custSortCfg, setCustSortCfg] = useState({ key: "name", dir: "asc" });
    const [invSortCfg, setInvSortCfg] = useState({ key: "stock", dir: "asc" });
    const [couponSortCfg, setCouponSortCfg] = useState({ key: "created_at", dir: "desc" });

    const makeSort = (cfg, setCfg) => ({
        requestSort: (key) => {
            setCfg(prev => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
        },
        icon: (key) => cfg.key !== key
            ? <span className="text-white/30 ml-1 text-[10px]">▲▼</span>
            : <span className="text-[#D4AF37] ml-1 text-[10px]">{cfg.dir === "asc" ? "▲" : "▼"}</span>,
        sortFn: (arr) => [...arr].sort((a, b) => {
            const av = a[cfg.key] ?? "";
            const bv = b[cfg.key] ?? "";
            const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
            return cfg.dir === "asc" ? cmp : -cmp;
        }),
    });

    const pS = makeSort(prodSortCfg, setProdSortCfg);
    const oS = makeSort(ordSortCfg, setOrdSortCfg);
    const cS = makeSort(custSortCfg, setCustSortCfg);
    const iS = makeSort(invSortCfg, setInvSortCfg);
    const cpS = makeSort(couponSortCfg, setCouponSortCfg);

    const filteredOrders = orders.filter(o => {
        const q = orderSearch.toLowerCase();
        return !q || String(o.id).includes(q) || (o.shipping_name || "").toLowerCase().includes(q) || (o.shipping_phone || "").includes(q) || (o.order_status || "").toLowerCase().includes(q);
    });

    const filteredCustomers = customers.filter(c => {
        const q = customerSearch.toLowerCase();
        return !q || (c.name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.phone || "").includes(q);
    });

    const filteredInventory = products.filter(p => {
        const q = inventorySearch.toLowerCase();
        return !q || (p.name || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
    });

    const filteredCoupons = coupons.filter(c => {
        const q = couponSearch.toLowerCase();
        return !q || (c.code || "").toLowerCase().includes(q);
    });

    const sortedProducts = pS.sortFn(filteredProducts);
    const sortedOrders = oS.sortFn(filteredOrders);
    const sortedCustomers = cS.sortFn(filteredCustomers);
    const sortedInventory = iS.sortFn(filteredInventory);
    const sortedCoupons = cpS.sortFn(filteredCoupons);

    const paginatedProducts = sortedProducts.slice((productPage - 1) * PER_PAGE, productPage * PER_PAGE);
    const paginatedOrders = sortedOrders.slice((orderPage - 1) * PER_PAGE, orderPage * PER_PAGE);
    const paginatedCustomers = sortedCustomers.slice((customerPage - 1) * PER_PAGE, customerPage * PER_PAGE);
    const paginatedInventory = sortedInventory.slice((inventoryPage - 1) * PER_PAGE, inventoryPage * PER_PAGE);
    const paginatedCoupons = sortedCoupons.slice((couponPage - 1) * PER_PAGE, couponPage * PER_PAGE);

    const pendingOrders = orders.filter(o => o.order_status === "pending").length;
    const processingOrders = orders.filter(o => o.order_status === "processing").length;
    const shippedOrders = orders.filter(o => o.order_status === "shipped").length;
    const deliveredOrders = orders.filter(o => o.order_status === "delivered" || o.order_status === "completed").length;

    const downloadProducts = () => downloadCSV(
        "products.csv",
        ["ID", "Name", "Category", "Price", "Stock", "Status"],
        sortedProducts.map(p => [
            p.id, p.name, p.category, p.price, p.stock ?? 0,
            !p.stock || p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"
        ])
    );

    const downloadOrders = () => downloadCSV(
        "orders.csv",
        ["Order ID", "Customer", "Phone", "Amount", "Payment", "Status", "Date"],
        sortedOrders.map(o => [
            o.id, o.shipping_name, o.shipping_phone,
            Number(o.total_amount), o.payment_status || "pending",
            o.order_status,
            o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : ""
        ])
    );

    const downloadCustomers = () => downloadCSV(
        "customers.csv",
        ["Name", "Email", "Phone", "Total Orders", "Total Spend", "Joined"],
        sortedCustomers.map(c => [
            c.name, c.email, c.phone || "",
            c.total_orders || 0, c.total_spend || 0,
            c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : ""
        ])
    );

    const downloadInventory = () => downloadCSV(
        "inventory.csv",
        ["Product", "Category", "Stock", "Status"],
        sortedInventory.map(p => [
            p.name, p.category, p.stock ?? 0,
            !p.stock || p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"
        ])
    );

    const downloadCoupons = () => downloadCSV(
        "coupons.csv",
        ["Code", "Type", "Value", "Min Order", "Max Discount", "Usage Limit", "Used", "Expiry", "Status"],
        sortedCoupons.map(c => [
            c.code,
            c.discount_type,
            c.discount_value,
            c.min_order_amount || 0,
            c.max_discount || "—",
            c.usage_limit || "Unlimited",
            c.used_count || 0,
            c.expiry_date ? new Date(c.expiry_date).toLocaleDateString("en-IN") : "No expiry",
            c.is_active ? "Active" : "Inactive"
        ])
    );

    const inputCls = "w-full border border-gray-200 px-4 py-3 rounded-xl outline-none text-sm focus:border-[#D4AF37] transition";
    const thCls = "text-left px-5 py-4 cursor-pointer select-none hover:text-white transition text-xs uppercase tracking-wider text-gray-400";

    const menu = [
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "products", label: "Products", icon: "👕" },
        { id: "orders", label: "Orders", icon: "📦" },
        { id: "customers", label: "Customers", icon: "👥" },
        { id: "coupons", label: "Coupons", icon: "🎟️" },
        { id: "analytics", label: "Analytics", icon: "📈" },
        { id: "inventory", label: "Inventory", icon: "🏪" },
        { id: "settings", label: "Settings", icon: "⚙️" },
    ];

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex text-black">

            <div className="w-72 bg-[#0F172A] text-white min-h-screen flex flex-col shadow-2xl fixed left-0 top-0 bottom-0 z-40">
                <div className="px-6 py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <img src="/images/zayro-logo.png" alt="ZAYRO Logo" className="h-10 w-auto object-contain" style={{ filter: "invert(1)" }} />
                        <div>
                            <h1 className="text-sm font-light tracking-[5px]">ZAYRO</h1>
                            <p className="text-[#D4AF37] text-[10px] tracking-[3px] mt-1">ADMIN PANEL</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menu.map((item) => (
                        <button key={item.id} onClick={() => setActiveSection(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm transition-all duration-200 ${activeSection === item.id ? "bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-black font-bold" : "hover:bg-white/10 text-white/80"}`}>
                            <span>{item.icon}</span>
                            <span className="tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A227] flex items-center justify-center text-black font-bold text-sm">A</div>
                        <div><p className="text-sm font-semibold">Admin</p><p className="text-xs text-gray-400">Super Admin</p></div>
                    </div>
                    <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("role"); window.location.href = "/"; }}
                        className="w-full bg-red-500 hover:bg-red-600 py-3 rounded-xl font-semibold text-sm transition">Logout</button>
                </div>
            </div>

            <div className="flex-1 ml-72">
                <div className="h-16 bg-white px-8 flex items-center justify-between border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                    <h2 className="text-lg font-bold tracking-[3px] text-black uppercase">{menu.find(m => m.id === activeSection)?.label}</h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Revenue</p>
                            <p className="font-bold text-sm text-black">₹{Number(stats.revenue).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A227] flex items-center justify-center text-black font-bold text-sm">A</div>
                    </div>
                </div>

                <div className="p-6">

                    {activeSection === "dashboard" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                                {[
                                    { label: "Total Revenue", value: `₹${Number(stats.revenue).toLocaleString("en-IN")}`, sub: "+12.5% this month", color: "text-green-600" },
                                    { label: "Total Orders", value: stats.totalOrders, sub: `+${pendingOrders} pending`, color: "text-blue-600" },
                                    { label: "Total Products", value: stats.totalProducts, sub: "Active inventory", color: "text-yellow-600" },
                                    { label: "Customers", value: stats.totalCustomers, sub: "Registered users", color: "text-purple-600" },
                                ].map((s) => (
                                    <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                                        <h2 className="text-2xl font-black mt-2 text-black">{s.value}</h2>
                                        <p className={`text-xs mt-1 font-medium ${s.color}`}>{s.sub}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid xl:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-base mb-4">Monthly Revenue</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={revenueChart}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} dot={{ fill: "#D4AF37" }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-base mb-4">Monthly Orders</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={orderChart}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Bar dataKey="orders" fill="#0F172A" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                                {[
                                    { label: "Pending", count: pendingOrders, color: "bg-yellow-500" },
                                    { label: "Processing", count: processingOrders, color: "bg-blue-500" },
                                    { label: "Shipped", count: shippedOrders, color: "bg-purple-500" },
                                    { label: "Delivered", count: deliveredOrders, color: "bg-green-500" },
                                ].map((s) => (
                                    <div key={s.label} className={`${s.color} text-white rounded-2xl p-5 shadow-sm`}>
                                        <p className="text-xs uppercase tracking-wider opacity-80">{s.label}</p>
                                        <h2 className="text-3xl font-black mt-2">{s.count}</h2>
                                    </div>
                                ))}
                            </div>
                            <div className="grid xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-base mb-4">Recent Orders</h3>
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b text-gray-500 text-xs uppercase tracking-wider"><th className="text-left py-3">Order ID</th><th className="text-left">Customer</th><th className="text-left">Amount</th><th className="text-left">Status</th></tr></thead>
                                        <tbody>
                                            {orders.slice(0, 8).map((order) => (
                                                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                                                    <td className="py-3 font-semibold text-xs">#{order.id}</td>
                                                    <td className="text-xs"><p className="font-semibold">{order.shipping_name}</p><p className="text-gray-400">{order.shipping_phone}</p></td>
                                                    <td className="font-bold text-xs">₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                                                    <td><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.order_status === "delivered" || order.order_status === "completed" ? "bg-green-100 text-green-700" : order.order_status === "shipped" ? "bg-blue-100 text-blue-700" : order.order_status === "processing" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"}`}>{order.order_status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-sm mb-3">🏆 Best Seller</h3>
                                        {products.slice(0, 3).map((p, i) => (
                                            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                                <span className="text-xs font-black text-[#D4AF37] w-4">#{i + 1}</span>
                                                <img src={p.image} className="w-8 h-8 object-cover rounded" />
                                                <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{p.name}</p><p className="text-[10px] text-gray-400">₹{p.price}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                                        <h3 className="font-bold text-sm text-red-600 mb-3">⚠️ Low Stock Alert</h3>
                                        {products.filter(p => p.stock <= 5).slice(0, 4).map(p => (
                                            <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-red-100 last:border-0">
                                                <p className="text-xs font-semibold truncate flex-1">{p.name}</p>
                                                <span className="text-xs font-black text-red-500 ml-2">{p.stock || 0} left</span>
                                            </div>
                                        ))}
                                        {products.filter(p => p.stock <= 5).length === 0 && <p className="text-xs text-gray-400">All products well stocked</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "products" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center justify-between">
                                <div className="flex gap-3 flex-wrap">
                                    <input type="text" placeholder="Search products..." value={productSearch}
                                        onChange={e => { setProductSearch(e.target.value); setProductPage(1); }}
                                        className="border border-gray-200 px-4 py-2 rounded-xl text-sm outline-none w-56 focus:border-[#D4AF37]" />
                                    <select value={productCategory} onChange={e => { setProductCategory(e.target.value); setProductPage(1); }}
                                        className="border border-gray-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-[#D4AF37]">
                                        <option>All</option><option>Men</option><option>Women</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-[#D4AF37] text-black text-xs font-bold px-4 py-2 rounded-xl">{filteredProducts.length} Products</span>
                                    <CsvButton onClick={downloadProducts} />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#0F172A]">
                                            <tr>
                                                <th className={thCls}>Image</th>
                                                <th className={thCls} onClick={() => { pS.requestSort("name"); setProductPage(1); }}>Name {pS.icon("name")}</th>
                                                <th className={thCls} onClick={() => { pS.requestSort("category"); setProductPage(1); }}>Category {pS.icon("category")}</th>
                                                <th className={thCls} onClick={() => { pS.requestSort("price"); setProductPage(1); }}>Price {pS.icon("price")}</th>
                                                <th className={thCls} onClick={() => { pS.requestSort("stock"); setProductPage(1); }}>Stock {pS.icon("stock")}</th>
                                                <th className={thCls}>Status</th>
                                                <th className={thCls}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedProducts.map(p => (
                                                <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                                                    <td className="px-5 py-3"><img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg" /></td>
                                                    <td className="px-5 font-semibold">{p.name}</td>
                                                    <td className="px-5"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">{p.category}</span></td>
                                                    <td className="px-5 font-bold">₹{p.price}</td>
                                                    <td className="px-5">{p.stock ?? "—"}</td>
                                                    <td className="px-5"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${!p.stock || p.stock === 0 ? "bg-red-100 text-red-600" : p.stock <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{!p.stock || p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"}</span></td>
                                                    <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => handleEditClick(p)} className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#C9A227] transition">Edit</button><button onClick={() => handleDeleteProduct(p.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition">Delete</button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination total={filteredProducts.length} page={productPage} perPage={PER_PAGE} onPageChange={setProductPage} />
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                {editId && (
                                    <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
                                        <span>Editing Product ID: <strong>{editId}</strong></span>
                                        <button onClick={() => { setEditId(null); setProductForm({ name: "", description: "", price: "", image: "", category: "", stock: "" }); }} className="text-xs text-red-500 font-bold">✕ Cancel Edit</button>
                                    </div>
                                )}
                                <h3 className="font-bold text-base mb-5">{editId ? "Edit Product" : "Add New Product"}</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className={inputCls} />
                                    <input type="number" placeholder="Price (₹)" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className={inputCls} />
                                    <input placeholder="Image URL" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} className={inputCls} />
                                    <input type="number" placeholder="Stock Quantity" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} className={inputCls} />
                                    <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className={inputCls}>
                                        <option value="">Select Category</option><option>Men</option><option>Women</option>
                                    </select>
                                </div>
                                <textarea rows={3} placeholder="Product Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className={inputCls + " mt-4 resize-none"} />
                                <button onClick={editId ? handleUpdateProduct : handleAddProduct}
                                    className="mt-4 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-black font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition text-sm">
                                    {editId ? "Update Product" : "Add Product"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === "orders" && (
                        <div className="space-y-6">
                            {selectedOrder ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <button onClick={() => setSelectedOrder(null)} className="text-sm text-gray-500 hover:text-black mb-5 flex items-center gap-2">← Back to Orders</button>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">Customer Details</h3>
                                            <p className="font-bold text-base">{selectedOrder.shipping_name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{selectedOrder.shipping_phone}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">Shipping Address</h3>
                                            <p className="text-sm text-gray-700">{selectedOrder.shipping_address}</p>
                                            <p className="text-sm text-gray-700">{selectedOrder.shipping_city} — {selectedOrder.shipping_pincode}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">Payment</h3>
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${selectedOrder.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{selectedOrder.payment_status || "Pending"}</span>
                                            <p className="text-base font-black mt-2">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">Order Status</h3>
                                            <select value={selectedOrder.order_status}
                                                onChange={e => { handleStatusChange(selectedOrder.id, e.target.value); setSelectedOrder({ ...selectedOrder, order_status: e.target.value }); }}
                                                className="border border-gray-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-[#D4AF37] w-full">
                                                <option value={selectedOrder.order_status}>{selectedOrder.order_status}</option>
                                                {getNextStatuses(selectedOrder.order_status).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <h3 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">Tracking</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input placeholder="Courier Name" value={trackingForm.courier} onChange={e => setTrackingForm({ ...trackingForm, courier: e.target.value })} className={inputCls} />
                                            <input placeholder="Tracking Number" value={trackingForm.tracking} onChange={e => setTrackingForm({ ...trackingForm, tracking: e.target.value })} className={inputCls} />
                                        </div>
                                        <button onClick={() => handleTrackingUpdate(selectedOrder.id)} className="mt-3 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition">Save Tracking</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-base">All Orders</h3>
                                            <span className="text-xs text-gray-500">{sortedOrders.length} of {orders.length} orders</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <input
                                                type="text"
                                                placeholder="Search by ID, name, status…"
                                                value={orderSearch}
                                                onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
                                                className="border border-gray-200 px-4 py-2 rounded-xl text-sm outline-none w-56 focus:border-[#D4AF37]"
                                            />
                                            <CsvButton onClick={downloadOrders} />
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-[#0F172A]">
                                                <tr>
                                                    <th className={thCls} onClick={() => { oS.requestSort("id"); setOrderPage(1); }}>Order ID {oS.icon("id")}</th>
                                                    <th className={thCls} onClick={() => { oS.requestSort("shipping_name"); setOrderPage(1); }}>Customer {oS.icon("shipping_name")}</th>
                                                    <th className={thCls}>Phone</th>
                                                    <th className={thCls} onClick={() => { oS.requestSort("total_amount"); setOrderPage(1); }}>Amount {oS.icon("total_amount")}</th>
                                                    <th className={thCls} onClick={() => { oS.requestSort("payment_status"); setOrderPage(1); }}>Payment {oS.icon("payment_status")}</th>
                                                    <th className={thCls} onClick={() => { oS.requestSort("order_status"); setOrderPage(1); }}>Status {oS.icon("order_status")}</th>
                                                    <th className={thCls} onClick={() => { oS.requestSort("created_at"); setOrderPage(1); }}>Date {oS.icon("created_at")}</th>
                                                    <th className={thCls}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedOrders.map(order => (
                                                    <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                                                        <td className="px-5 py-4 font-bold text-xs">#{order.id}</td>
                                                        <td className="px-5 font-semibold text-xs">{order.shipping_name}</td>
                                                        <td className="px-5 text-xs text-gray-500">{order.shipping_phone}</td>
                                                        <td className="px-5 font-bold text-xs">₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                                                        <td className="px-5"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{order.payment_status || "pending"}</span></td>
                                                        <td className="px-5">
                                                            <select value={order.order_status} onChange={e => handleStatusChange(order.id, e.target.value)} className="border border-gray-200 px-2 py-1 rounded-lg text-xs outline-none">
                                                                <option value={order.order_status}>{order.order_status}</option>
                                                                {getNextStatuses(order.order_status).map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="px-5 text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "—"}</td>
                                                        <td className="px-5"><button onClick={() => { setSelectedOrder(order); setTrackingForm({ courier: order.courier || "", tracking: order.tracking_number || "" }); }} className="bg-[#0F172A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition">View</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination total={sortedOrders.length} page={orderPage} perPage={PER_PAGE} onPageChange={setOrderPage} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === "customers" && (
                        <div className="space-y-6">
                            {selectedCustomer ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <button onClick={() => setSelectedCustomer(null)} className="text-sm text-gray-500 hover:text-black mb-5">← Back to Customers</button>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xl font-black">{selectedCustomer.name?.charAt(0).toUpperCase()}</div>
                                        <div><h3 className="font-black text-lg">{selectedCustomer.name}</h3><p className="text-gray-500 text-sm">{selectedCustomer.email}</p></div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider">Total Orders</p><p className="text-2xl font-black mt-1">{selectedCustomer.total_orders || 0}</p></div>
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider">Total Spend</p><p className="text-2xl font-black mt-1">₹{Number(selectedCustomer.total_spend || 0).toLocaleString("en-IN")}</p></div>
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p><p className="text-base font-black mt-1">{selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString("en-IN") : "—"}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-base">All Customers</h3>
                                            <span className="text-xs text-gray-500">{sortedCustomers.length} of {customers.length} customers</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, phone…"
                                                value={customerSearch}
                                                onChange={e => { setCustomerSearch(e.target.value); setCustomerPage(1); }}
                                                className="border border-gray-200 px-4 py-2 rounded-xl text-sm outline-none w-56 focus:border-[#D4AF37]"
                                            />
                                            <CsvButton onClick={downloadCustomers} />
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-[#0F172A]">
                                                <tr>
                                                    <th className={thCls} onClick={() => { cS.requestSort("name"); setCustomerPage(1); }}>Name {cS.icon("name")}</th>
                                                    <th className={thCls} onClick={() => { cS.requestSort("email"); setCustomerPage(1); }}>Email {cS.icon("email")}</th>
                                                    <th className={thCls}>Phone</th>
                                                    <th className={thCls} onClick={() => { cS.requestSort("total_orders"); setCustomerPage(1); }}>Orders {cS.icon("total_orders")}</th>
                                                    <th className={thCls} onClick={() => { cS.requestSort("total_spend"); setCustomerPage(1); }}>Total Spend {cS.icon("total_spend")}</th>
                                                    <th className={thCls} onClick={() => { cS.requestSort("created_at"); setCustomerPage(1); }}>Joined {cS.icon("created_at")}</th>
                                                    <th className={thCls}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedCustomers.length === 0 && (
                                                    <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">No customers found.</td></tr>
                                                )}
                                                {paginatedCustomers.map(c => (
                                                    <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                                                        <td className="px-5 py-4 font-semibold">{c.name}</td>
                                                        <td className="px-5 text-gray-500 text-xs">{c.email}</td>
                                                        <td className="px-5 text-xs">{c.phone || "—"}</td>
                                                        <td className="px-5 font-bold">{c.total_orders || 0}</td>
                                                        <td className="px-5 font-bold">₹{Number(c.total_spend || 0).toLocaleString("en-IN")}</td>
                                                        <td className="px-5 text-xs text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "—"}</td>
                                                        <td className="px-5"><button onClick={() => setSelectedCustomer(c)} className="bg-[#0F172A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition">View</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination total={sortedCustomers.length} page={customerPage} perPage={PER_PAGE} onPageChange={setCustomerPage} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === "coupons" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-base">All Coupons</h3>
                                        <span className="text-xs text-gray-500">{sortedCoupons.length} of {coupons.length} coupons</span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <input
                                            type="text"
                                            placeholder="Search by code…"
                                            value={couponSearch}
                                            onChange={e => { setCouponSearch(e.target.value); setCouponPage(1); }}
                                            className="border border-gray-200 px-4 py-2 rounded-xl text-sm outline-none w-56 focus:border-[#D4AF37]"
                                        />
                                        <CsvButton onClick={downloadCoupons} />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#0F172A]">
                                            <tr>
                                                <th className={thCls} onClick={() => { cpS.requestSort("code"); setCouponPage(1); }}>Code {cpS.icon("code")}</th>
                                                <th className={thCls}>Discount</th>
                                                <th className={thCls} onClick={() => { cpS.requestSort("min_order_amount"); setCouponPage(1); }}>Min Order {cpS.icon("min_order_amount")}</th>
                                                <th className={thCls}>Usage</th>
                                                <th className={thCls} onClick={() => { cpS.requestSort("expiry_date"); setCouponPage(1); }}>Expiry {cpS.icon("expiry_date")}</th>
                                                <th className={thCls}>Status</th>
                                                <th className={thCls}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedCoupons.map(c => {
                                                const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                                                return (
                                                    <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                                                        <td className="px-5 py-4 font-black tracking-wide">{c.code}</td>
                                                        <td className="px-5 font-semibold">
                                                            {c.discount_type === "flat"
                                                                ? `₹${c.discount_value} off`
                                                                : `${c.discount_value}% off${c.max_discount ? ` (max ₹${c.max_discount})` : ""}`}
                                                        </td>
                                                        <td className="px-5">₹{c.min_order_amount || 0}</td>
                                                        <td className="px-5">{c.used_count || 0}{c.usage_limit ? ` / ${c.usage_limit}` : " / ∞"}</td>
                                                        <td className="px-5 text-xs">
                                                            {c.expiry_date
                                                                ? <span className={isExpired ? "text-red-500 font-bold" : "text-gray-500"}>{new Date(c.expiry_date).toLocaleDateString("en-IN")}</span>
                                                                : <span className="text-gray-400">No expiry</span>}
                                                        </td>
                                                        <td className="px-5">
                                                            <button onClick={() => handleToggleCoupon(c.id)} className={`px-2 py-1 rounded-full text-[10px] font-bold transition ${c.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                                                {c.is_active ? "Active" : "Inactive"}
                                                            </button>
                                                        </td>
                                                        <td className="px-5 py-3"><div className="flex gap-2">
                                                            <button onClick={() => handleEditCouponClick(c)} className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#C9A227] transition">Edit</button>
                                                            <button onClick={() => handleDeleteCoupon(c.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition">Delete</button>
                                                        </div></td>
                                                    </tr>
                                                );
                                            })}
                                            {coupons.length === 0 && (
                                                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">No coupons created yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination total={sortedCoupons.length} page={couponPage} perPage={PER_PAGE} onPageChange={setCouponPage} />
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                {editCouponId && (
                                    <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
                                        <span>Editing Coupon ID: <strong>{editCouponId}</strong></span>
                                        <button onClick={handleCancelCouponEdit} className="text-xs text-red-500 font-bold">✕ Cancel Edit</button>
                                    </div>
                                )}
                                <h3 className="font-bold text-base mb-5">{editCouponId ? "Edit Coupon" : "Create New Coupon"}</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input
                                        placeholder="Coupon Code (e.g. SAVE100)"
                                        value={couponForm.code}
                                        onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                        className={inputCls}
                                    />
                                    <select
                                        value={couponForm.discount_type}
                                        onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                                        className={inputCls}
                                    >
                                        <option value="flat">Flat (₹ off)</option>
                                        <option value="percent">Percentage (% off)</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder={couponForm.discount_type === "flat" ? "Discount Amount (₹)" : "Discount Percent (%)"}
                                        value={couponForm.discount_value}
                                        onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                                        className={inputCls}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Minimum Order Amount (₹)"
                                        value={couponForm.min_order_amount}
                                        onChange={e => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                                        className={inputCls}
                                    />
                                    {couponForm.discount_type === "percent" && (
                                        <input
                                            type="number"
                                            placeholder="Max Discount Cap (₹) — optional"
                                            value={couponForm.max_discount}
                                            onChange={e => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                                            className={inputCls}
                                        />
                                    )}
                                    <input
                                        type="number"
                                        placeholder="Usage Limit (optional)"
                                        value={couponForm.usage_limit}
                                        onChange={e => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                                        className={inputCls}
                                    />
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Expiry Date (optional)</label>
                                        <input
                                            type="date"
                                            value={couponForm.expiry_date}
                                            onChange={e => setCouponForm({ ...couponForm, expiry_date: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                                <button onClick={editCouponId ? handleUpdateCoupon : handleAddCoupon}
                                    className="mt-4 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-black font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition text-sm">
                                    {editCouponId ? "Update Coupon" : "Create Coupon"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === "analytics" && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-4 gap-4">
                                {[
                                    { label: "Total Orders", value: stats.totalOrders, color: "text-blue-600" },
                                    { label: "Delivered", value: deliveredOrders, color: "text-green-600" },
                                    { label: "Cancelled", value: orders.filter(o => o.order_status === "cancelled").length, color: "text-red-500" },
                                    { label: "Return Rate", value: "2.4%", color: "text-yellow-600" },
                                ].map(s => (
                                    <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                                        <p className={`text-2xl font-black mt-2 ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid xl:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-base mb-4">Sales by Category</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={70}
                                                paddingAngle={3}
                                                dataKey="total"
                                                nameKey="category"
                                                labelLine={false}
                                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                            >
                                                {categoryData.map((entry, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 15 }} />
                                            <Tooltip formatter={(value) => [`${value} Products`, "Category"]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-base mb-4">Top Products</h3>
                                    <div className="space-y-3">
                                        {topProducts.map((p, i) => (
                                            <div key={p.id} className="flex items-center gap-4">
                                                <span className="text-xs font-black text-[#D4AF37] w-6">#{i + 1}</span>
                                                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold">{p.name}</p>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                                        <div className="bg-[#D4AF37] h-1.5 rounded-full" style={{ width: `${Math.max(20, 100 - i * 18)}%` }} />
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">{p.sold} Sold</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "inventory" && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <h3 className="font-bold text-base">Stock Management</h3>
                                    <div className="flex gap-2 text-xs mt-2">
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">{products.filter(p => !p.stock || p.stock === 0).length} Out of Stock</span>
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">{products.filter(p => p.stock > 0 && p.stock <= 5).length} Low Stock</span>
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">{products.filter(p => p.stock > 5).length} In Stock</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <input
                                        type="text"
                                        placeholder="Search product or category…"
                                        value={inventorySearch}
                                        onChange={e => { setInventorySearch(e.target.value); setInventoryPage(1); }}
                                        className="border border-gray-200 px-4 py-2 rounded-xl text-sm outline-none w-56 focus:border-[#D4AF37]"
                                    />
                                    <CsvButton onClick={downloadInventory} />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#0F172A]">
                                        <tr>
                                            <th className={thCls} onClick={() => { iS.requestSort("name"); setInventoryPage(1); }}>Product {iS.icon("name")}</th>
                                            <th className={thCls} onClick={() => { iS.requestSort("category"); setInventoryPage(1); }}>Category {iS.icon("category")}</th>
                                            <th className={thCls} onClick={() => { iS.requestSort("stock"); setInventoryPage(1); }}>Current Stock {iS.icon("stock")}</th>
                                            <th className={thCls}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedInventory.map(p => (
                                            <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                                                <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 object-cover rounded-lg" /><span className="font-semibold">{p.name}</span></div></td>
                                                <td className="px-5"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs">{p.category}</span></td>
                                                <td className="px-5 font-black text-lg">{p.stock ?? "—"}</td>
                                                <td className="px-5"><span className={`px-3 py-1.5 rounded-full text-xs font-bold ${!p.stock || p.stock === 0 ? "bg-red-100 text-red-600" : p.stock <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{!p.stock || p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination total={sortedInventory.length} page={inventoryPage} perPage={PER_PAGE} onPageChange={setInventoryPage} />
                        </div>
                    )}

                    {activeSection === "settings" && (
                        <div className="space-y-6 max-w-2xl">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-bold text-base mb-5">Store Information</h3>
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Store Name</label><input value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} className={inputCls} /></div>
                                    <div><label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Store Email</label><input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} placeholder="store@email.com" className={inputCls} /></div>
                                    <div><label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Phone</label><input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className={inputCls} /></div>
                                    <div><label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Address</label><textarea rows={2} value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className={inputCls + " resize-none"} /></div>
                                    <button onClick={() => alert("Settings saved!")} className="bg-[#0F172A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition">Save Changes</button>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-bold text-base mb-5">Payment Settings</h3>
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Stripe Publishable Key</label><input type="password" placeholder="pk_live_..." defaultValue={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} className={inputCls} /></div>
                                    <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500" /><p className="text-xs text-green-600 font-semibold">Stripe Connected & Active</p></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-bold text-base mb-5">Admin Account</h3>
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">New Password</label><input type="password" placeholder="••••••••" className={inputCls} /></div>
                                    <div><label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Confirm Password</label><input type="password" placeholder="••••••••" className={inputCls} /></div>
                                    <div className="flex gap-3">
                                        <button className="bg-[#0F172A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition">Change Password</button>
                                        <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("role"); window.location.href = "/"; }} className="bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-600 transition">Logout</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}