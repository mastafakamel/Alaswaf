const express = require("express");
const router = express.Router();

const auth = require("../controllers/admin/auth.controller");
const offers = require("../controllers/admin/offers.controller");
const tags = require("../controllers/admin/tags.controller");
const branches = require("../controllers/admin/branches.controller");
const offerImages = require("../controllers/admin/offerImages.controller");
const itinerary = require("../controllers/admin/itinerary.controller");
const offerLists = require("../controllers/admin/offerLists.controller");
const blog = require("../controllers/admin/blog.controller");
const leads = require("../controllers/admin/leads.controller");
const cities = require("../controllers/admin/cities.controller");
const categories = require("../controllers/admin/categories.controller");

const { requireAdminAuth } = require("../middleware/auth.middleware");
// const { requireRole } = require("../middleware/role.middleware"); // اختياري

// Auth
router.post("/login", auth.login);
router.get("/me", requireAdminAuth, auth.me);

// Offers CRUD
router.get("/offers", requireAdminAuth, offers.list);
router.post("/offers", requireAdminAuth, offers.create);
router.get("/offers/:id", requireAdminAuth, offers.getOne);
router.put("/offers/:id", requireAdminAuth, offers.update);
router.delete("/offers/:id", requireAdminAuth, offers.remove);

// Offers actions
router.post("/offers/:id/duplicate", requireAdminAuth, offers.duplicate);
router.patch("/offers/:id/toggle-active", requireAdminAuth, offers.toggleActive);
router.patch("/offers/:id/feature", requireAdminAuth, offers.feature);


// Offer Images
router.post("/offers/:offerId/images", requireAdminAuth, offerImages.add);
router.delete("/offers/:offerId/images/:imageId", requireAdminAuth, offerImages.remove);
router.patch("/offers/:offerId/images/reorder", requireAdminAuth, offerImages.reorder);

// Itinerary
router.post("/offers/:offerId/itinerary", requireAdminAuth, itinerary.add);
router.put("/offers/:offerId/itinerary/:itemId", requireAdminAuth, itinerary.update);
router.delete("/offers/:offerId/itinerary/:itemId", requireAdminAuth, itinerary.remove);
router.patch("/offers/:offerId/itinerary/reorder", requireAdminAuth, itinerary.reorder);

// Offer Lists (highlights/includes/excludes/what-to-bring)
router.post("/offers/:offerId/lists/:type", requireAdminAuth, offerLists.add);
router.put("/offers/:offerId/lists/:type/:itemId", requireAdminAuth, offerLists.update);
router.delete("/offers/:offerId/lists/:type/:itemId", requireAdminAuth, offerLists.remove);
router.patch("/offers/:offerId/lists/:type/reorder", requireAdminAuth, offerLists.reorder);

// Tags CRUD
router.get("/tags", requireAdminAuth, tags.list);
router.post("/tags", requireAdminAuth, tags.create);
router.put("/tags/:id", requireAdminAuth, tags.update);
router.delete("/tags/:id", requireAdminAuth, tags.remove);

// Cities CRUD
router.get("/cities", requireAdminAuth, cities.list);
router.get("/cities/:id", requireAdminAuth, cities.getOne);
router.post("/cities", requireAdminAuth, cities.create);
router.put("/cities/:id", requireAdminAuth, cities.update);
router.delete("/cities/:id", requireAdminAuth, cities.remove);

// Categories CRUD
router.get("/categories", requireAdminAuth, categories.list);
router.get("/categories/:id", requireAdminAuth, categories.getOne);
router.post("/categories", requireAdminAuth, categories.create);
router.put("/categories/:id", requireAdminAuth, categories.update);
router.delete("/categories/:id", requireAdminAuth, categories.remove);
router.patch("/categories/:id/toggle-active", requireAdminAuth, categories.toggleActive);

// Branches + Phones
router.get("/branches", requireAdminAuth, branches.list);
router.get("/branches/:id", requireAdminAuth, branches.getOne);
router.post("/branches", requireAdminAuth, branches.create);
router.put("/branches/:id", requireAdminAuth, branches.update);
router.delete("/branches/:id", requireAdminAuth, branches.remove);

router.post("/branches/:branchId/phones", requireAdminAuth, branches.addPhone);
router.put("/branches/:branchId/phones/:phoneId", requireAdminAuth, branches.updatePhone);
router.delete("/branches/:branchId/phones/:phoneId", requireAdminAuth, branches.removePhone);
router.patch("/branches/:branchId/phones/reorder", requireAdminAuth, branches.reorderPhones);

// Blog Admin
router.get("/blog", requireAdminAuth, blog.list);
router.get("/blog/:id", requireAdminAuth, blog.getOne);
router.post("/blog", requireAdminAuth, blog.create);
router.put("/blog/:id", requireAdminAuth, blog.update);
router.delete("/blog/:id", requireAdminAuth, blog.remove);

router.patch("/blog/:id/toggle-publish", requireAdminAuth, blog.togglePublish);
router.patch("/blog/:id/schedule", requireAdminAuth, blog.schedulePublish); // optional

// Leads Admin
router.get("/leads", requireAdminAuth, leads.list);
router.put("/leads/:id", requireAdminAuth, leads.update);
router.delete("/leads/:id", requireAdminAuth, leads.remove);

module.exports = router;
