const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload.middleware");
const { requireAdminAuth } = require("../middleware/auth.middleware");

/**
 * POST /api/v1/admin/upload
 * Returns the URL of the uploaded file
 */
router.post("/upload", requireAdminAuth, upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate public URL
    // Note: BASE_URL should be configured in .env
    const baseUrl = process.env.BASE_URL || "http://localhost:9000";
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
    });
});

module.exports = router;
