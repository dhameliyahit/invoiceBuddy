const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DB_URL = process.env.DB_URL;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(DB_URL);

        console.log(
            `✅ Database connected successfully: ${conn.connection.host}:${conn.connection.port} / ${conn.connection.name}`
        );
    } catch (error) {
        console.error("❌ Error in Database connection:", error.message);
        process.exit(1); // exit process if DB not connected
    }
};

module.exports = connectDB;
