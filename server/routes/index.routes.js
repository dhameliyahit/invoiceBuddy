const express = require("express");
const { loginController, configBusinessController, generateInvoiceController, getProfile } = require("../controller/user.controller.js");
const upload = require("../utils/fileUpload.js")
const { userAuth } = require("../middleware/auth.js")

const router = express.Router();

router.post("/login", loginController);
router.post("/config", userAuth, upload.single("logo"), configBusinessController);
router.post("/invoice", userAuth, generateInvoiceController);

router.get("/profile", userAuth, getProfile)
module.exports = router;
