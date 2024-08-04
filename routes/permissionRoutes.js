const express = require("express");
const {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  bulkCreatePermissions,
} = require("../controllers/permissionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("superadmin"), createPermission)
  .get(protect, authorize("superadmin", "admin"), getPermissions);

router
  .route("/bulk")
  .post(protect, authorize("superadmin"), bulkCreatePermissions);

router
  .route("/:id")
  .get(protect, authorize("superadmin", "admin"), getPermissionById)
  .put(protect, authorize("superadmin"), updatePermission)
  .delete(protect, authorize("superadmin"), deletePermission);

module.exports = router;
