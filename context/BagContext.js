"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

const BagContext = createContext();

export const BagProvider = ({ children }) => {

    const [products, setProducts] = useState([]);
    const [loading] = useState(false);
    const [isBagOpen, setIsBagOpen] = useState(false);

    useEffect(() => {

        const storedBag = sessionStorage.getItem("bag");

        if (storedBag) {
            setProducts(JSON.parse(storedBag));
        }

    }, []);

    const addToBag = useCallback((product) => {

        setProducts((prevProducts) => {

            const existingProduct = prevProducts.find(
                (item) =>
                    item.id === product.id &&
                    item.size === product.size
            );

            let updatedProducts;

            if (existingProduct) {

                updatedProducts = prevProducts.map((item) =>
                    item.id === product.id &&
                        item.size === product.size
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                        }
                        : item
                );

            } else {

                updatedProducts = [
                    ...prevProducts,
                    {
                        ...product,
                        quantity: 1,
                    },
                ];

            }

            sessionStorage.setItem(
                "bag",
                JSON.stringify(updatedProducts)
            );

            return updatedProducts;

        });

        // Product add hote hi drawer auto open ho jayega
        setIsBagOpen(true);

    }, []);

    const increaseQuantity = useCallback((id, size) => {

        setProducts((prevProducts) => {

            const updatedProducts = prevProducts.map((item) =>
                item.id === id &&
                    item.size === size
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item
            );

            sessionStorage.setItem(
                "bag",
                JSON.stringify(updatedProducts)
            );

            return updatedProducts;

        });

    }, []);

    const decreaseQuantity = useCallback((id, size) => {

        setProducts((prevProducts) => {

            const updatedProducts = prevProducts
                .map((item) =>
                    item.id === id &&
                        item.size === size
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item
                )
                .filter((item) => item.quantity > 0);

            sessionStorage.setItem(
                "bag",
                JSON.stringify(updatedProducts)
            );

            return updatedProducts;

        });

    }, []);

    const removeFromBag = useCallback((id, size) => {

        setProducts((prevProducts) => {

            const updatedProducts = prevProducts.filter(
                (item) => !(item.id === id && item.size === size)
            );

            sessionStorage.setItem(
                "bag",
                JSON.stringify(updatedProducts)
            );

            return updatedProducts;

        });

    }, []);

    const clearBag = useCallback(() => {

        sessionStorage.removeItem("bag");

        setProducts([]);

    }, []);

    const openBag = useCallback(() => setIsBagOpen(true), []);
    const closeBag = useCallback(() => setIsBagOpen(false), []);

    const value = useMemo(() => ({

        products,
        loading,
        addToBag,
        increaseQuantity,
        decreaseQuantity,
        removeFromBag,
        clearBag,
        isBagOpen,
        openBag,
        closeBag,

    }), [
        products,
        loading,
        addToBag,
        increaseQuantity,
        decreaseQuantity,
        removeFromBag,
        clearBag,
        isBagOpen,
        openBag,
        closeBag,
    ]);

    return (

        <BagContext.Provider value={value}>
            {children}
        </BagContext.Provider>

    );

};

export const useBag = () => useContext(BagContext);