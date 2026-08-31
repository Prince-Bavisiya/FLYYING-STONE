"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [status, setStatus] = useState("checking"); // checking | allowed | denied

    useEffect(() => {
        let isMounted = true;

        const verifyAdminStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await axios.get("/api/auth/verify-admin", {
                    headers,
                    withCredentials: true
                });

                if (isMounted) {
                    if (res.data.success && res.data.isAdmin) {
                        setStatus("allowed");
                    } else {
                        setStatus("denied");
                        router.replace("/");
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setStatus("denied");
                    if (error.response?.status === 403) {
                        // Authenticated user but not admin -> redirect to home customer site
                        router.replace("/");
                    } else {
                        // Unauthenticated or invalid token -> redirect to profile login
                        router.replace("/profile");
                    }
                }
            }
        };

        verifyAdminStatus();

        return () => {
            isMounted = false;
        };
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