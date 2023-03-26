const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");
const { get, post, clear, update, incognito } = require("../controllers/storageController");

const router = express.Router();

router.route("/ign/:query").get(incognito);
router.route("/:storageId").get(protect, get);
router.route("/:storageId").post(protect, post);
router.route("/:storageId").put(protect, update);
router.route("/:storageId").delete(protect, clear);

module.exports = router;