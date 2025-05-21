const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { get, signup, update, login, exists } = require("../controllers/userController");

const router = express.Router();

router.route("/login").get(protect, login);
router.route("/signup").post(protect, signup);
router.route("/update").put(protect, update);
router.route("/exists/:userName").put(protect, exists);
router.route("/").get(protect, get);

module.exports = router;