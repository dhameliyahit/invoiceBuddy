const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model.js");
const invoiceModel = require("../model/invoice.model.js");
const sharp = require("sharp");
const { generateInvoicePdf } = require("../utils/pdfGenerator.js");

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
                    redirect: "/dashboard/settings",
                    token,
                    user: { _id: newUser._id, email: newUser.email, isRegistered: newUser.isRegistered },
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
            const safeUser = { _id: user._id, email: user.email, businessName: user.businessName, isRegistered: user.isRegistered };
            if (user.isRegistered === true) {
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    redirect: "/dashboard",
                    token,
                    user: safeUser,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "User found but not registered fully",
                    redirect: "/dashboard/settings",
                    token,
                    user: safeUser,
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
        const { businessName, businessAddress, businessPhone, businessEmail, waterMark, endMessage } = req.body;

        // Fail fast if required fields missing
        if (!businessName || !businessAddress || !businessPhone || !businessEmail) {
            return res.status(400).json({ success: false, message: "All business details are required" });
        }

        const logoFile = req.file; // single file upload
        const userId = req.user._id;

        // Prepare DB update object
        const updateData = {
            businessName,
            businessAddress,
            businessPhone,
            businessEmail,
            waterMark: waterMark || null,
            endMessage: endMessage || null,
            isRegistered: true,
        };

        // Process image with sharp: resize and convert to webp for fast loading if provided
        if (logoFile) {
            try {
                const optimizedLogoBuffer = await sharp(logoFile.buffer)
                    .resize({ width: 500, height: 500, fit: "inside", withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

                updateData.logo = `data:image/webp;base64,${optimizedLogoBuffer.toString("base64")}`;
            } catch (err) {
                console.error("Sharp processing failed:", err.message);
                return res.status(500).json({ success: false, message: "Error processing logo image" });
            }
        }

        // Update user config in DB
        const updatedUserConfig = await userModel.findByIdAndUpdate(userId, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Business configured successfully",
            redirect: "/dashboard",
            logo: updateData.logo || null,
            user: updatedUserConfig,
        });
    } catch (error) {
        console.error("Config Business Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};




exports.dashboardController = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch user business config
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Aggregate Invoice Stats
        // Total Invoices count
        const totalInvoices = await invoiceModel.countDocuments({ userId });

        // Total Revenue sum
        const stats = await invoiceModel.aggregate([
            { $match: { userId: userId } }, // Use dynamic userId
            { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" } } }
        ]);
        const totalRevenue = stats.length > 0 ? stats[0].totalRevenue : 0;

        // 3. Recent 5 Invoices
        const recentInvoices = await invoiceModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            user,
            stats: {
                totalInvoices,
                totalRevenue
            },
            recentInvoices
        });
    } catch (error) {
        console.error("Dashboard Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard" });
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
        const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const pdfBuffer = await generateInvoicePdf({
            pdfBusinessData: businessInfo,
            customer: req.body.customer,
            rows: req.body.rows,
            grandDetails: req.body.grandDetails,
            watermarkText: user.waterMark || "Invoice Buddy",
            endMessage: user.endMessage || "Thank You",
            invoiceNo
        });

        // 3. Save invoice to database for dashboard/history
        try {
            await invoiceModel.create({
                invoiceNo,
                userId: _id,
                customer: {
                    name: req.body.customer.name,
                    email: req.body.customer.email,
                    contactNo: req.body.customer.contact,
                    companyName: req.body.customer.company,
                    address: req.body.customer.address,
                },
                items: req.body.rows.map(row => ({
                    description: row.product,
                    quantity: row.quantity,
                    unitPrice: row.unitPrice,
                    total: row.total,
                    tax: row.tax,
                    creditAmount: row.creditAmount,
                    debitAmount: row.debitAmount,
                })),
                grandSubtotal: req.body.grandDetails.grandSubtotal,
                grandTaxAmount: req.body.grandDetails.grandTaxAmount,
                grandCreditAmount: req.body.grandDetails.grandCreditAmount,
                grandDebitAmount: req.body.grandDetails.grandDebitAmount,
                grandTotal: req.body.grandDetails.grandTotal,
                status: "sent"
            });
        } catch (saveErr) {
            console.error("Failed to save invoice metadata:", saveErr.message);
            // We don't block the PDF generation response but log it
        }

        // 4. Send PDF as response
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