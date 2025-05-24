const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { exists, search, join, get, post, update, clear } = require("../controllers/editorController");

const router = express.Router();

router.route("/exists/:editorName").get(exists);
router.route("/search/:editorName").get(protect, search);
router.route("/join/:editorName").get(protect, join);

router.route("/:editorName").get(protect, get);

router.route("/").post(protect, post);
router.route("/").put(protect, update);
router.route("/:editorName").delete(protect, clear);

module.exports = router;