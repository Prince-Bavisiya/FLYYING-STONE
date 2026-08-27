// controllers/couponController.js
const db = require("../config/db").promise;

// ─────────────────────────────────────────────
// 1. CREATE COUPON (Admin)
// POST /api/admin/coupons
// ─────────────────────────────────────────────
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discount_type,      // "flat" | "percent"
            discount_value,     // number
            min_order_amount,   // number (optional, default 0)
            max_discount,       // number (optional, only relevant for percent)
            usage_limit,        // number (optional, null = unlimited)
            expiry_date,        // "YYYY-MM-DD" (optional)
        } = req.body;

        if (!code || !discount_type || !discount_value) {
            return res.status(400).json({ message: "Code, discount_type and discount_value are required." });
        }

        if (!["flat", "percent"].includes(discount_type)) {
            return res.status(400).json({ message: "discount_type must be 'flat' or 'percent'." });
        }

        const cleanCode = code.trim().toUpperCase();

        const [existing] = await db.query("SELECT id FROM coupons WHERE code = ?", [cleanCode]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Coupon code already exists." });
        }

        const [result] = await db.query(
            `INSERT INTO coupons 
             (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, expiry_date, is_active)
             VALUES (?, ?, ?, ?, ?, ?, 0, ?, 1)`,
            [
                cleanCode,
                discount_type,
                discount_value,
                min_order_amount || 0,
                max_discount || null,
                usage_limit || null,
                expiry_date || null,
            ]
        );

        return res.status(201).json({ message: "Coupon created successfully!", id: result.insertId });
    } catch (err) {
        console.error("createCoupon error:", err);
        return res.status(500).json({ message: "Server error while creating coupon." });
    }
};

// ─────────────────────────────────────────────
// 2. GET ALL COUPONS (Admin)
// GET /api/admin/coupons
// ─────────────────────────────────────────────
const getCoupons = async (req, res) => {
    try {
        const [coupons] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
        return res.json({ coupons });
    } catch (err) {
        console.error("getCoupons error:", err);
        return res.status(500).json({ message: "Server error while fetching coupons." });
    }
};

// ─────────────────────────────────────────────
// 3. UPDATE COUPON (Admin)
// PUT /api/admin/coupons/:id
// ─────────────────────────────────────────────
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount,
            usage_limit,
            expiry_date,
            is_active,
        } = req.body;

        const [existing] = await db.query("SELECT id FROM coupons WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Coupon not found." });
        }

        await db.query(
            `UPDATE coupons SET 
                code = ?, discount_type = ?, discount_value = ?, 
                min_order_amount = ?, max_discount = ?, usage_limit = ?, 
                expiry_date = ?, is_active = ?
             WHERE id = ?`,
            [
                code.trim().toUpperCase(),
                discount_type,
                discount_value,
                min_order_amount || 0,
                max_discount || null,
                usage_limit || null,
                expiry_date || null,
                is_active === undefined ? 1 : is_active,
                id,
            ]
        );

        return res.json({ message: "Coupon updated successfully!" });
    } catch (err) {
        console.error("updateCoupon error:", err);
        return res.status(500).json({ message: "Server error while updating coupon." });
    }
};

// ─────────────────────────────────────────────
// 4. TOGGLE ACTIVE/INACTIVE (Admin) — quick enable/disable
// PUT /api/admin/coupons/:id/toggle
// ─────────────────────────────────────────────
const toggleCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT is_active FROM coupons WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        const newStatus = rows[0].is_active ? 0 : 1;
        await db.query("UPDATE coupons SET is_active = ? WHERE id = ?", [newStatus, id]);
        return res.json({ message: `Coupon ${newStatus ? "activated" : "deactivated"}.`, is_active: newStatus });
    } catch (err) {
        console.error("toggleCoupon error:", err);
        return res.status(500).json({ message: "Server error while toggling coupon." });
    }
};

// ─────────────────────────────────────────────
// 5. DELETE COUPON (Admin)
// DELETE /api/admin/coupons/:id
// ─────────────────────────────────────────────
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM coupons WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        return res.json({ message: "Coupon deleted successfully!" });
    } catch (err) {
        console.error("deleteCoupon error:", err);
        return res.status(500).json({ message: "Server error while deleting coupon." });
    }
};

// ─────────────────────────────────────────────
// 6. APPLY / VALIDATE COUPON (Public — used in Checkout page)
// POST /api/coupons/apply
// body: { code: "SAVE100", cartTotal: 1499 }
// ─────────────────────────────────────────────
const applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code || cartTotal === undefined) {
            return res.status(400).json({ message: "Coupon code and cart total are required." });
        }

        const cleanCode = code.trim().toUpperCase();

        const [rows] = await db.query("SELECT * FROM coupons WHERE code = ?", [cleanCode]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Invalid coupon code." });
        }

        const coupon = rows[0];

        // 1. Active check
        if (!coupon.is_active) {
            return res.status(400).json({ message: "This coupon is no longer active." });
        }

        // 2. Expiry check
        if (coupon.expiry_date) {
            const today = new Date();
            const expiry = new Date(coupon.expiry_date);
            // set to end of day so coupon works till the last day of expiry_date
            expiry.setHours(23, 59, 59, 999);
            if (today > expiry) {
                return res.status(400).json({ message: "This coupon has expired." });
            }
        }

        // 3. Usage limit check
        if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ message: "This coupon has reached its usage limit." });
        }

        // 4. Minimum order amount check
        if (cartTotal < Number(coupon.min_order_amount)) {
            return res.status(400).json({
                message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.`,
            });
        }

        // 5. Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === "flat") {
            discountAmount = Number(coupon.discount_value);
        } else if (coupon.discount_type === "percent") {
            discountAmount = (cartTotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
                discountAmount = Number(coupon.max_discount);
            }
        }

        // discount can't exceed cart total
        if (discountAmount > cartTotal) discountAmount = cartTotal;
        discountAmount = Math.round(discountAmount * 100) / 100;

        const finalAmount = Math.round((cartTotal - discountAmount) * 100) / 100;

        return res.json({
            message: "Coupon applied successfully!",
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
            },
            discountAmount,
            finalAmount,
        });
    } catch (err) {
        console.error("applyCoupon error:", err);
        return res.status(500).json({ message: "Server error while applying coupon." });
    }
};

// ─────────────────────────────────────────────
// 7. INCREMENT USED COUNT (call this internally after payment success)
// Use inside your payment success / webhook controller:
//   const { incrementCouponUsage } = require("../controllers/couponController");
//   await incrementCouponUsage(couponCode);
// ─────────────────────────────────────────────
const incrementCouponUsage = async (code) => {
    if (!code) return;
    try {
        await db.query(
            "UPDATE coupons SET used_count = used_count + 1 WHERE code = ?",
            [code.trim().toUpperCase()]
        );
    } catch (err) {
        console.error("incrementCouponUsage error:", err);
    }
};

module.exports = {
    createCoupon,
    getCoupons,
    updateCoupon,
    toggleCoupon,
    deleteCoupon,
    applyCoupon,
    incrementCouponUsage
};