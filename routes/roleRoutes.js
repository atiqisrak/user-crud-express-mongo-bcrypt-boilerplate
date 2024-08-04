const express = require("express");
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  bulkCreateRoles,
} = require("../controllers/roleController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("superadmin"), createRole)
  .get(protect, authorize("superadmin", "admin"), getRoles);

router.route("/bulk").post(protect, authorize("superadmin"), bulkCreateRoles);

router
  .route("/:id")
  .get(protect, authorize("superadmin", "admin"), getRoleById)
  .put(protect, authorize("superadmin"), updateRole)
  .delete(protect, authorize("superadmin"), deleteRole);

module.exports = router;
