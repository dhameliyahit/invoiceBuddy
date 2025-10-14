const multer = require("multer");

// Multer memory storage (no fs)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit (adjust if needed)
});

module.exports = upload;
