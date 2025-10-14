const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");

exports.userAuth = async (req, res, next) => {
    try {
        // ✅ 1. Check if authorization header exists
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Authorization token missing or invalid" });
        }

        // ✅ 2. Extract token
        const token = authHeader.replace("Bearer ", "").trim();

        // ✅ 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded._id) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        // ✅ 4. Find user in DB
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ 5. Attach user to request and continue
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ success: false, message: "Authentication failed", error: error.message });
    }
};
