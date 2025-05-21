const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { exists, search, join, get, post, update, clear } = require("../controllers/roomController");

const router = express.Router();

// Specific routes (that handle :roomName)
router.route("/exists/:roomName").get(exists);
router.route("/search/:roomName").get(protect, search);
router.route("/join/:roomName").get(protect, join);

// General route that handles both :roomName and :count (comes after specific routes)
router.route("/:roomName/:count").get(protect, get);

// Routes for creating, updating, and deleting resources (no conflicts)
router.route("/").post(protect, post);
router.route("/").put(protect, update);
router.route("/:roomName").delete(protect, clear);

module.exports = router;