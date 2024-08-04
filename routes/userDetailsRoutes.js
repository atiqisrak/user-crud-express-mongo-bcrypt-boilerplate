const express = require("express");
const {
  createUserDetails,
  getUserDetailsByUserId,
  updateUserDetails,
  deleteUserDetails,
} = require("../controllers/userDetailsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, authorize("superadmin"), createUserDetails);

router
  .route("/:userId")
  .get(protect, authorize("superadmin", "admin"), getUserDetailsByUserId)
  .put(protect, updateUserDetails)
  .delete(protect, authorize("superadmin"), deleteUserDetails);

module.exports = router;
