const express = require("express");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("admin", "superadmin"), createCustomer)
  .get(protect, authorize("admin", "superadmin"), getCustomers);

router
  .route("/:id")
  .get(protect, authorize("admin", "superadmin", "user"), getCustomerById)
  .put(protect, authorize("admin", "superadmin"), updateCustomer)
  .delete(protect, authorize("admin", "superadmin"), deleteCustomer);

module.exports = router;
