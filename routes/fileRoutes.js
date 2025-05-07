const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { exists, search, join, get, post, update, clear } = require("../controllers/fileController");

const router = express.Router();

// Specific routes (that handle :fileName)
router.route("/exists/:fileName").get(protect, exists);
router.route("/search/:fileName").get(protect, search);
router.route("/join/:fileName").get(protect, join);

// General route that handles both :fileName and :count (comes after specific routes)
router.route("/:fileName").get(protect, get);

// Routes for creating, updating, and deleting resources (no conflicts)
router.route("/").post(protect, post);
router.route("/").put(protect, update);
router.route("/:fileName").delete(protect, clear);

module.exports = router;