"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {

    const { role } = useAuth();
    const [wishlist, setWishlist] = useState([]); // array of product_ids (numbers)
    const [wishlistItems, setWishlistItems] = useState([]); // full product objects
    const [loading, setLoading] = useState(false);

    // ── Fetch full wishlist from backend ──
    const fetchWishlist = useCallback(async () => {
        if (!role) {
            setWishlist([]);
            setWishlistItems([]);
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/wishlist", {
                headers: { authorization: token }
            });
            const items = res.data.wishlist || [];
            setWishlistItems(items);
            setWishlist(items.map(item => item.product_id));
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    // ── Check if product is in wishlist ──
    const isWishlisted = (productId) => {
        return wishlist.includes(Number(productId));
    };

    // ── Toggle wishlist (add / remove) ──
    const toggleWishlist = async (product) => {
        if (!role) {
            // Not logged in — redirect hint
            alert("Please login to add items to wishlist");
            return;
        }

        const productId = Number(product.id);
        const token = localStorage.getItem("token");

        if (isWishlisted(productId)) {
            // Optimistic remove
            setWishlist(prev => prev.filter(id => id !== productId));
            setWishlistItems(prev => prev.filter(item => item.product_id !== productId));

            try {
                await axios.delete(`/api/wishlist/${productId}`, {
                    headers: { authorization: token }
                });
            } catch (e) {
                // Rollback on error
                fetchWishlist();
            }
        } else {
            // Optimistic add
            setWishlist(prev => [...prev, productId]);
            setWishlistItems(prev => [...prev, {
                product_id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
            }]);

            try {
                await axios.post(
                    "/api/wishlist",
                    { product_id: productId },
                    { headers: { authorization: token } }
                );
            } catch (e) {
                // Rollback on error
                fetchWishlist();
            }
        }
    };

    // ── Move from wishlist to bag ──
    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem("token");
        setWishlist(prev => prev.filter(id => id !== Number(productId)));
        setWishlistItems(prev => prev.filter(item => item.product_id !== Number(productId)));

        try {
            await axios.delete(`/api/wishlist/${productId}`, {
                headers: { authorization: token }
            });
        } catch (e) {
            fetchWishlist();
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            wishlistItems,
            loading,
            isWishlisted,
            toggleWishlist,
            removeFromWishlist,
            fetchWishlist,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}