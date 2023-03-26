const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { get, post, clear } = require("../controllers/addaController");

const router = express.Router();

router.route("/:addaId").get(protect, get);
router.route("/:addaId").post(protect, post);
router.route("/:addaId").delete(protect, clear);

module.exports = router;