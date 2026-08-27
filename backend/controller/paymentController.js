const stripe = require("../config/stripe");
const connection = require("../config/db");

const createCheckoutSession = async (req, res) => {

    try {

        const {
            products = [],
            customer,
            couponCode = null
        } = req.body;

        console.log("========== STRIPE REQUEST ==========");
        console.log("Products:", products);
        console.log("Customer:", customer);

        if (!products.length) {
            return res.status(400).json({
                success: false,
                message: "No products found.",
            });
        }

        // Create Stripe Customer
        const stripeCustomer = await stripe.customers.create({

            name: customer?.fullName,

            phone: customer?.phone,

            address: {

                line1: customer?.address,

                city: customer?.city,

                postal_code: customer?.pincode,

                country: "IN",

            },

            metadata: {

                notes: customer?.notes || "",

            },

        });

        console.log("Customer Created:");
        console.log(stripeCustomer.id);


        // Logged-in User
        const userId = req.user.id;

        // ===============================
        // Calculate Cart Total
        // ===============================

        const originalTotal = products.reduce(

            (total, item) => {

                return total + (Number(item.price) * item.quantity);

            },

            0

        );

        let totalAmount = originalTotal;

        let discountAmount = 0;

        let appliedCoupon = null;

        // ===============================
        // Coupon Validation
        // ===============================

        if (couponCode) {

            const coupon = await new Promise((resolve, reject) => {

                connection.query(

                    `
            SELECT *
            FROM coupons
            WHERE
                code = ?
                AND is_active = 1
            LIMIT 1
            `,

                    [couponCode],

                    (err, results) => {

                        if (err) {

                            return reject(err);

                        }

                        resolve(results[0] || null);

                    }

                );

            });

            if (!coupon) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid Coupon"
                });

            }

            if (
                coupon.usage_limit &&
                coupon.used_count >= coupon.usage_limit
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Coupon usage limit exceeded"
                });

            }

            // Expiry Check
            if (

                coupon.expiry_date &&
                new Date(coupon.expiry_date).setHours(23, 59, 59, 999) < Date.now()
            ) {

                return res.status(400).json({

                    success: false,
                    message: "Coupon Expired"

                });

            }

            // Minimum Order
            if (
                coupon.min_order_amount &&
                originalTotal < Number(coupon.min_order_amount)
            ) {

                return res.status(400).json({

                    success: false,
                    message: `Minimum order ₹${coupon.min_order_amount}`

                });

            }

            // Flat Discount
            if (coupon.discount_type === "flat") {

                discountAmount = Math.min(
                    Number(coupon.discount_value),
                    originalTotal - 1
                );

            } else {

                // Percentage Discount
                discountAmount =
                    originalTotal *
                    (Number(coupon.discount_value) / 100);

                if (
                    coupon.max_discount &&
                    discountAmount > Number(coupon.max_discount)
                ) {
                    discountAmount = Number(coupon.max_discount);
                }

            }

            // Never go below ₹1
            if (discountAmount > originalTotal - 1) {
                discountAmount = originalTotal - 1;
            }

            totalAmount = originalTotal - discountAmount;

            appliedCoupon = coupon;

        }

        // ===============================
        // Create Stripe Line Items
        // ===============================

        const line_items = [];

        const ratio = totalAmount / originalTotal;

        for (const item of products) {

            const discountedPrice = Number(
                (Number(item.price) * ratio).toFixed(2)
            );

            line_items.push({

                price_data: {

                    currency: "inr",

                    product_data: {

                        name: item.name,

                        images: item.image
                            ? [item.image]
                            : [],

                        metadata: {
                            productId: item.id.toString(),
                        },

                    },

                    unit_amount: Math.round(discountedPrice * 100),

                },

                quantity: item.quantity,

            });

        }

        console.log("========== LINE ITEMS ==========");
        console.log(line_items);

        // Save Pending Order
        const orderResult = await new Promise((resolve, reject) => {

            const sql = `
        INSERT INTO orders
        (
            user_id,
            stripe_customer_id,
            total_amount,
            payment_status,
            order_status,
            shipping_name,
            shipping_phone,
            shipping_address,
            shipping_city,
            shipping_pincode,
            notes,
            coupon_code,
            discount_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

            connection.query(
                sql,
                [
                    userId,
                    stripeCustomer.id,
                    totalAmount,
                    "pending",
                    "pending",
                    customer.fullName,
                    customer.phone,
                    customer.address,
                    customer.city,
                    customer.pincode,
                    customer.notes || "",
                    appliedCoupon ? appliedCoupon.code : null,
                    discountAmount
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(result);

                }
            );

        });

        const orderId = orderResult.insertId;

        console.log("Order Saved :", orderId);

        // Save Order Items
        for (const item of products) {

            await new Promise((resolve, reject) => {

                const sql = `
            INSERT INTO order_items
            (
                order_id,
                product_id,
                quantity,
                price,
                size
            )
            VALUES (?, ?, ?, ?, ?)
        `;

                connection.query(
                    sql,
                    [
                        orderId,
                        item.id,
                        item.quantity,
                        Number((Number(item.price) * ratio).toFixed(2)),
                        item.size || null,
                    ],
                    (err, result) => {

                        if (err) {

                            console.log("========== ORDER ITEM ERROR ==========");
                            console.log(err);
                            console.log("======================================");

                            return reject(err);

                        }

                        console.log(`Product Saved : Product ID ${item.id}`);

                        resolve(result);

                    }
                );

            });

        }

        console.log("========== ALL ORDER ITEMS SAVED ==========");

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({

            payment_method_types: ["card"],

            customer: stripeCustomer.id,

            line_items,

            mode: "payment",

            metadata: {

                orderId: orderId.toString(),
                userId: userId.toString(),
                customerName: customer.fullName,
                phone: customer.phone,
                city: customer.city,
                pincode: customer.pincode,
                totalProducts: products.length.toString(),
                couponCode: appliedCoupon ? appliedCoupon.code : "",
                discountAmount: discountAmount.toString(),
                originalTotal: originalTotal.toString(),
                payableAmount: totalAmount.toString(),

            },

            success_url: `${req.get("origin") || "http://localhost:3000"}/order-success?session_id={CHECKOUT_SESSION_ID}&coupon=success`,

            cancel_url: `${req.get("origin") || "http://localhost:3000"}/checkout`,

        });

        // Update Orders Table with Stripe Session
        await new Promise((resolve, reject) => {

            const sql = `
        UPDATE orders
        SET
            stripe_session_id = ?,
            stripe_payment_intent = ?
        WHERE id = ?
    `;

            connection.query(
                sql,
                [
                    session.id,
                    session.payment_intent || null,
                    orderId
                ],
                (err, result) => {

                    if (err) {

                        console.log("========== ORDER UPDATE ERROR ==========");
                        console.error(err);
                        console.log("========================================");

                        return reject(err);

                    }

                    console.log("========== ORDER UPDATED ==========");
                    console.log("Order ID :", orderId);
                    console.log("Stripe Session :", session.id);
                    console.log("Payment Intent :", session.payment_intent);
                    console.log("===================================");

                    resolve(result);

                }
            );

        });

        console.log("========== COUPON ==========");
        console.log("Coupon :", appliedCoupon?.code || "No Coupon");
        console.log("Original :", originalTotal);
        console.log("Discount :", discountAmount);
        console.log("Final :", totalAmount);
        console.log("============================");
        console.log("========== STRIPE SESSION CREATED ==========");
        console.log("Customer ID :", stripeCustomer.id);
        console.log("Session ID  :", session.id);
        console.log("Session URL :", session.url);
        console.log("============================================");

        res.status(200).json({
            success: true,
            id: session.id,
            url: session.url,
        });

    } catch (error) {

        console.log("========== STRIPE ERROR ==========");
        console.error(error);
        console.log("=================================");

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

const verifyPayment = async (req, res) => {

    try {

        const { sessionId } = req.params;

        // Retrieve checkout session and expand the payment_intent
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["payment_intent"]
        });

        if (session.payment_status !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment not completed.",
            });
        }

        // Extract the actual string ID (expansion turns it into an object)
        const paymentIntentId = session.payment_intent?.id || session.payment_intent;

        console.log("Payment Intent ID:", paymentIntentId);

        // Update Order
        await new Promise((resolve, reject) => {

            const sql = `
                UPDATE orders
                SET
                    payment_status = 'paid',
                    order_status = 'processing',
                    stripe_payment_intent = ?
                WHERE stripe_session_id = ?
            `;

            connection.query(
                sql,
                [
                    paymentIntentId, // ✅ string ID
                    session.id
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(result);

                }
            );

        });

        // Increase Coupon Usage Count
        await new Promise((resolve, reject) => {

            const sql = `
                UPDATE coupons
                SET used_count = used_count + 1
                WHERE code = (
                    SELECT coupon_code
                    FROM orders
                    WHERE stripe_session_id = ?
                    LIMIT 1
                )
            `;

            connection.query(
                sql,
                [session.id],
                (err) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve();

                }
            );

        });

        // Fetch Order Details
        const orderData = await new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    id, 
                    created_at, 
                    total_amount, 
                    discount_amount, 
                    coupon_code,
                    shipping_name, 
                    shipping_phone, 
                    shipping_address, 
                    shipping_city, 
                    shipping_pincode
                FROM orders
                WHERE stripe_session_id = ?
                LIMIT 1
            `;
            connection.query(sql, [session.id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0] || null);
            });
        });

        if (!orderData) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Fetch Order Items
        const orderItems = await new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    oi.quantity, 
                    oi.price, 
                    oi.size,
                    p.name,
                    p.image
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `;
            connection.query(sql, [orderData.id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const formattedOrder = {
            id: orderData.id,
            date: new Date(orderData.created_at).toLocaleDateString("en-IN"),
            total: Number(orderData.total_amount) + Number(orderData.discount_amount),
            discount: Number(orderData.discount_amount),
            finalTotal: Number(orderData.total_amount),
            couponCode: orderData.coupon_code,
            address: {
                fullName: orderData.shipping_name,
                phone: orderData.shipping_phone,
                address: orderData.shipping_address,
                city: orderData.shipping_city,
                pincode: orderData.shipping_pincode
            },
            products: orderItems.map(item => ({
                name: item.name,
                price: Number(item.price),
                quantity: item.quantity,
                size: item.size,
                image: item.image
            }))
        };

        return res.status(200).json({
            success: true,
            message: "Payment Verified Successfully.",
            paymentStatus: session.payment_status,
            order: formattedOrder
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

module.exports = {
    createCheckoutSession,
    verifyPayment,
};