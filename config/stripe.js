require("dotenv").config();

const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("❌ STRIPE_SECRET_KEY not found in .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log("✅ Stripe Initialized");

module.exports = stripe;