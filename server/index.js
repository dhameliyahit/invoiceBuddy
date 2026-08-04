const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const indexRoutes = require("./routes/index.routes.js");
const connectDB = require("./DB/connectDB.js");
const morgan = require("morgan");

//middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("common"));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

//home route
app.get("/", (req, res) => {
    res.send("Welcome to InvoiceBuddy Billing System API");
})

//health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
})

//routes
app.use("/api", indexRoutes)

// Connect to MongoDB at module load (works for both local & Vercel serverless).
// Mongoose buffers queries until the connection is established.
connectDB();

// Export the app for Vercel serverless functions.
module.exports = app;

// Only listen when running directly (local development), not on Vercel.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}