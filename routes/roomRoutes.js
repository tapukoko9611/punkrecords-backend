const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { get, post, clear } = require("../controllers/roomController");

const router = express.Router();

router.route("/:roomId").get(protect, get);
router.route("/:roomId").post(protect, post);
router.route("/:roomId").delete(protect, clear);

module.exports = router;