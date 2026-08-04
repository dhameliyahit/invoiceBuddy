const mongoose = require("mongoose");
const dotenv = require("dotenv");
// Only load a local .env file in development. On Vercel (production),
// environment variables come from the dashboard. dotenv never overrides
// variables that are already set in the environment.
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const DB_URL = process.env.DB_URL;

const connectDB = async () => {
    if (!DB_URL) {
        console.error("❌ DB_URL environment variable is not set.");
        return;
    }

    try {
        // Reuse the existing connection on warm serverless invocations.
        if (mongoose.connection.readyState !== 0) {
            return;
        }

        const conn = await mongoose.connect(DB_URL, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(
            `✅ Database connected successfully: ${conn.connection.host}:${conn.connection.port} / ${conn.connection.name}`
        );
    } catch (error) {
        // Do NOT call process.exit(1) — it would crash Vercel serverless functions.
        console.error("❌ Error in Database connection:", error.message);
    }
};

module.exports = connectDB;
