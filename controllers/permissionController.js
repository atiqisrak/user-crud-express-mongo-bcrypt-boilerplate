const Permission = require("../models/Permission");
const { check, validationResult } = require("express-validator");

// Create Permission
exports.createPermission = [
  check("name").not().isEmpty().withMessage("Permission name is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    try {
      const permission = new Permission({ name });
      await permission.save();
      res.status(201).json({ message: "Permission created successfully" });
    } catch (error) {
      console.error("Error creating permission:", error);
      res.status(500).json({ message: "Error creating permission", error });
    }
  },
];

// Bulk Create Permissions
exports.bulkCreatePermissions = [
  check("permissions").isArray().withMessage("Permissions should be an array"),
  check("permissions.*.name")
    .not()
    .isEmpty()
    .withMessage("Permission name is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { permissions } = req.body;

    try {
      const createdPermissions = await Permission.insertMany(permissions);
      res.status(201).json({
        message: "Permissions created successfully",
        permissions: createdPermissions,
      });
    } catch (error) {
      console.error("Error creating permissions:", error);
      res.status(500).json({ message: "Error creating permissions", error });
    }
  },
];

// Get All Permissions
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({});
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Error fetching permissions", error });
  }
};

// Get Permission by ID
exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }
    res.status(200).json(permission);
  } catch (error) {
    console.error("Error fetching permission:", error);
    res.status(500).json({ message: "Error fetching permission", error });
  }
};

// Update Permission
exports.updatePermission = [
  check("name").not().isEmpty().withMessage("Permission name is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const permission = await Permission.findById(req.params.id);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      permission.name = req.body.name;
      await permission.save();
      res.status(200).json({ message: "Permission updated successfully" });
    } catch (error) {
      console.error("Error updating permission:", error);
      res.status(500).json({ message: "Error updating permission", error });
    }
  },
];

// Delete Permission
exports.deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }
    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    console.error("Error deleting permission:", error);
    res.status(500).json({ message: "Error deleting permission", error });
  }
};
