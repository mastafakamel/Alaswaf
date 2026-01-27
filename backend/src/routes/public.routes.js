const express = require("express");
const router = express.Router();

const offers = require("../controllers/public/offers.controller");
const blog = require("../controllers/public/blog.controller");
const branches = require("../controllers/public/branches.controller");
const leads = require("../controllers/public/leads.controller");
const cities = require("../controllers/public/cities.controller");
const categories = require("../controllers/public/categories.controller");

const { cacheMiddleware } = require("../middleware/cache.middleware");

// Offers
router.get("/offers", cacheMiddleware(300), offers.list);
router.get("/offers/:slug", cacheMiddleware(600), offers.bySlug);

// Blog
router.get("/blog", cacheMiddleware(300), blog.list);
router.get("/blog/latest", cacheMiddleware(300), blog.latest);
router.get("/blog/:slug", cacheMiddleware(600), blog.bySlug);

// Branches
router.get("/branches", cacheMiddleware(300), branches.list);

// Leads
router.post("/leads", leads.create);

// Cities
router.get("/cities", cacheMiddleware(300), cities.list);

// Categories
router.get("/categories", cacheMiddleware(300), categories.list);

module.exports = router;
