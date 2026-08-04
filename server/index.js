const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const indexRoutes = require("./routes/index.routes.js");
const connectDB = require("./DB/connectDB.js"); connectDB();
const morgan = require("morgan");
//middlewares
app.use(
  cors()
);
app.use(express.json());
app.use(morgan("common"))
app.use(express.urlencoded({ extended: true }));


//home route
app.get("/", async (req, res) => {
    res.send("Welcome to Invoivebuddy Billing System API");
})

//routes
app.use("/api", indexRoutes)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})