const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { exists, search, join, get, post, update, clear } = require("../controllers/fileController");

const router = express.Router();

router.route("/exists/:fileName").get(exists);
router.route("/search/:fileName").get(protect, search);
router.route("/join/:fileName").get(protect, join);

router.route("/:fileName").get(protect, get);

router.route("/").post(protect, post);
router.route("/").put(protect, update);
router.route("/:fileName").delete(protect, clear);

module.exports = router;