"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [status, setStatus] = useState("checking"); // checking | allowed | denied

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "admin") {
            setStatus("denied");
            router.replace("/");
            return;
        }

        setStatus("allowed");
    }, [router]);

    if (status === "checking") {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F3F4F6]">
                <span className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#D4AF37] animate-spin" />
            </div>
        );
    }

    if (status === "denied") {
        return null;
    }

    return <>{children}</>;
}