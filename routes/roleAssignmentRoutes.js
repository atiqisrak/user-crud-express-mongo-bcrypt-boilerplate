const express = require("express");
const {
  assignRole,
  removeRole,
} = require("../controllers/roleAssignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/assign", protect, authorize("superadmin", "admin"), assignRole);
router.post("/remove", protect, authorize("admin"), removeRole);

module.exports = router;
