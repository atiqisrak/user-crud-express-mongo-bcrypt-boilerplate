const express = require("express");
const {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("admin", "superadmin"), createAdmin)
  .get(protect, authorize("admin", "superadmin"), getAdmins);

router
  .route("/:id")
  .get(protect, authorize("admin", "superadmin"), getAdminById)
  .put(protect, authorize("admin", "superadmin"), updateAdmin)
  .delete(protect, authorize("admin", "superadmin"), deleteAdmin);

module.exports = router;
