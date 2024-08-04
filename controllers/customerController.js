const Customer = require("../models/Customer");
const User = require("../models/User");
const UserRole = require("../models/UserRole");
const Role = require("../models/Role");
const { check, validationResult } = require("express-validator");

// Create Customer
exports.createCustomer = [
  check("userId").isMongoId().withMessage("Invalid user ID"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, roleId, address, phoneNumber } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      const userRole = new UserRole({ userId, roleId });
      await userRole.save();

      const customer = new Customer({ userId, address, phoneNumber });
      await customer.save();

      res.status(201).json({
        message: "Customer created successfully",
        customer: {
          _id: customer._id,
          userId: customer.userId,
          address: customer.address,
          phoneNumber: customer.phoneNumber,
        },
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Error creating customer", error });
    }
  },
];

// Get All Customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).populate(
      "userId",
      "username email"
    );
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

// Get Customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "userId",
      "username email"
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

// Update Customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    customer.address = req.body.address || customer.address;
    customer.phoneNumber = req.body.phoneNumber || customer.phoneNumber;
    await customer.save();
    res.status(200).json({
      message: "Customer updated successfully",
      customer: {
        _id: customer._id,
        userId: customer.userId,
        address: customer.address,
        phoneNumber: customer.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Error updating customer", error });
  }
};

// Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error deleting customer", error });
  }
};
