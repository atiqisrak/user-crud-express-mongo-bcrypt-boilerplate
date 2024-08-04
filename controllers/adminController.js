const Admin = require("../models/Admin");
const User = require("../models/User");
const UserRole = require("../models/UserRole");
const Role = require("../models/Role");
const { check, validationResult } = require("express-validator");

// Create Admin
exports.createAdmin = [
  check("username")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric"),
  check("email").isEmail().withMessage("Email is not valid"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    try {
      const user = new User({ username, email, password });
      await user.save();

      // Automatically assign 'admin' role
      const adminRole = await Role.findOne({ name: "admin" });
      if (adminRole) {
        user.roles.push(adminRole._id); // Add the role to the user
        await user.save();

        // Add user to the Admin collection
        const admin = new Admin({ userId: user._id });
        await admin.save();
      } else {
        return res.status(500).json({ message: "Admin role not found" });
      }

      res.status(201).json({
        message: "Admin created successfully",
        admin: {
          _id: admin._id,
          userId: user._id,
          roles: user.roles,
          permissions: admin.permissions,
        },
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Error creating admin", error });
    }
  },
];

// Get All Admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).populate("userId", "username email");
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Error fetching admins", error });
  }
};

// Get Admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate(
      "userId",
      "username email"
    );
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ message: "Error fetching admin", error });
  }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    admin.roles = req.body.roles || admin.roles;
    admin.permissions = req.body.permissions || admin.permissions;
    await admin.save();
    res.status(200).json({
      message: "Admin updated successfully",
      admin: {
        _id: admin._id,
        userId: admin.userId,
        roles: admin.roles,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Error updating admin", error });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Error deleting admin", error });
  }
};
