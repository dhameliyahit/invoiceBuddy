const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model.js");
const botToken = require("../utils/botToken.js").botToken;
const TelegramBot = require("node-telegram-bot-api");
const { generateInvoicePdf } = require("../utils/pdfGenerator.js")

const token = botToken;
const bot = new TelegramBot(token, { polling: true });
const chat_id = "5829945529";

exports.loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and Password are required" });
        }

        // 2. Find user
        let user = await userModel.findOne({ email });

        if (!user) {
            // 2a. Create new user (hash password)
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await userModel.create({
                email,
                password: hashedPassword,
            });

            // 2b. Generate JWT for new user
            const payload = {
                _id: newUser._id,
                email: newUser.email,
                isRegistered: newUser.isRegistered,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            // 2c. Config check
            if (newUser.isRegistered === false) {
                return res.status(201).json({
                    success: true,
                    message: "New user created successfully",
                    redirect: "/config",
                    token,
                    user: newUser,
                });
            }
        } else {
            // 3. Check password for existing user
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid credentials" });
            }

            // 4. Generate token
            const payload = {
                _id: user._id,
                email: user.email,
                businessName: user.businessName,
                isRegistered: user.isRegistered,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            // 5. Redirect based on config
            if (user.isRegistered === true) {
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    redirect: "/invoice",
                    token,
                    user,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "User found but not registered fully",
                    redirect: "/config",
                    token,
                    user,
                });
            }
        }
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.configBusinessController = async (req, res) => {
    try {
        console.log("start");

        const { businessName, businessAddress, businessPhone, businessEmail, waterMark, endMessage } = req.body;

        // Fail fast if required fields missing
        if (!businessName || !businessAddress || !businessPhone || !businessEmail) {
            return res.status(400).json({ success: false, message: "All business details are required" });
        }

        const logoFile = req.file; // single file upload
        if (!logoFile) {
            return res.status(400).json({ success: false, message: "Logo file is required" });
        }

        console.log("Logo file received:", logoFile.originalname);

        const userId = req.user._id;

        // Prepare DB update object first
        const updateData = {
            businessName,
            businessAddress,
            businessPhone,
            businessEmail,
            waterMark: waterMark || null,
            endMessage: endMessage || null,
            isRegistered: true,
        };

        // Upload logo to Telegram asynchronously but don't block DB update
        const uploadLogo = async () => {
            try {
                const sentMessage = await bot.sendPhoto(chat_id, logoFile.buffer, {
                    filename: logoFile.originalname,
                    contentType: logoFile.mimetype,
                    caption: `Uploaded via API - ${businessName} - ${businessEmail} - ${new Date().toLocaleString()}`,
                });
                const fileId = sentMessage.photo.at(-1).file_id;
                const file = await bot.getFile(fileId);
                return `https://api.telegram.org/file/bot${token}/${file.file_path}`;
            } catch (err) {
                console.error("Telegram upload failed:", err.message);
                return null; // Don't block DB update
            }
        };

        const logoUrl = await uploadLogo();
        if (logoUrl) updateData.logo = logoUrl;

        // Update user config in DB
        const updatedUserConfig = await userModel.findByIdAndUpdate(userId, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Business configured successfully",
            redirect: "/invoice",
            user: updatedUserConfig,
        });
    } catch (error) {
        console.error("Config Business Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};



exports.generateInvoiceController = async (req, res) => {
    try {
        const { _id } = req.user;

        // 1. Fetch business info from DB
        const user = await userModel.findById(_id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const businessInfo = {
            name: user.businessName,
            email: user.businessEmail,
            phone: user.businessPhone,
            address: user.businessAddress,
            logo: user.logo, // assuming you store logo URL in DB
        };

        // 2. Merge business info with request body to generate PDF
        const pdfBuffer = await generateInvoicePdf({
            pdfBusinessData: businessInfo,
            customer: req.body.customer,
            rows: req.body.rows,
            grandDetails: req.body.grandDetails,
            watermarkText: req.body.watermarkText || "SUCCESS",
        });

        // 3. Send PDF as response
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline; filename=invoice.pdf",
            "Content-Length": pdfBuffer.length,
        });

        return res.send(pdfBuffer);
    } catch (err) {
        console.error("Error generating invoice:", err);
        res.status(500).json({ success: false, message: "Failed to generate invoice" });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const { _id } = req.user; // _id comes from authenticated user (middleware should set req.user)

        // Find the user by _id and exclude sensitive fields like password
        const user = await userModel.findById(_id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};