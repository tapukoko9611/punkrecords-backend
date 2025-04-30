const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { exists, search, join, get, post, update, clear } = require("../controllers/editorController");

const router = express.Router();

// Specific routes (that handle :editorName)
router.route("/exists/:editorName").get(protect, exists);
router.route("/search/:editorName").get(protect, search);
router.route("/join/:editorName").get(protect, join);

// General route that handles both :editorName and :count (comes after specific routes)
router.route("/:editorName").get(protect, get);

// Routes for creating, updating, and deleting resources (no conflicts)
router.route("/").post(protect, post);
router.route("/").put(protect, update);
router.route("/:editorName").delete(protect, clear);

module.exports = router;