const express = require("express");
const router = express.Router();
const { prisma } = require("../db/prisma");

router.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, status: "up", db: "ok", time: new Date().toISOString() });
    } catch (e) {
        res.status(503).json({ ok: false, status: "down", db: "fail", time: new Date().toISOString() });
    }
});

module.exports = router;
