const Permission = require("../models/Permission");
const Role = require("../models/Role");
const { check, validationResult } = require("express-validator");
const sendEmail = require("../utils/emailService");

async function notifyRoleChange(user, newRole) {
  const subject = "Role Change Notification";
  const message = `Your role has been changed to ${newRole}.`;
  await sendEmail(user.email, subject, message);
}

// Create Role
exports.createRole = [
  check("name").not().isEmpty().withMessage("Role name is required"),
  check("permissions").isArray().withMessage("Permissions should be an array"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, permissions } = req.body;
    try {
      const permissionDocs = await Permission.find({
        _id: { $in: permissions },
      });
      const role = new Role({ name, permissions });
      await role.save();
      res.status(201).json({
        message: "Role created successfully",
        role: {
          _id: role._id,
          name: role.name,
          // permissions: role.permissions,
          permissions: permissionDocs,
        },
      });
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Error creating role", error });
    }
  },
];

exports.bulkCreateRoles = [
  check("roles").isArray().withMessage("Roles should be an array"),
  check("roles.*.name").not().isEmpty().withMessage("Role name is required"),
  check("roles.*.permissions")
    .isArray()
    .withMessage("Permissions should be an array"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roles } = req.body;

    try {
      const createdRoles = await Role.insertMany(roles);
      res.status(201).json({
        message: "Roles created successfully",
        roles: createdRoles,
      });
    } catch (error) {
      console.error("Error creating roles:", error);
      res.status(500).json({ message: "Error creating roles", error });
    }
  },
];

// Get All Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({}).populate("permissions");
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Error fetching roles", error });
  }
};

// Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate("permissions");
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ message: "Error fetching role", error });
  }
};

// Update Role
exports.updateRole = [
  check("name").not().isEmpty().withMessage("Role name is required"),
  check("permissions").isArray().withMessage("Permissions should be an array"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const role = await Role.findById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      const { name, permissions } = req.body;
      const permissionDocs = await Permission.find({
        _id: { $in: permissions },
      });

      role.name = name;
      role.permissions = permissions;
      await role.save();

      // Notify users of role change
      const users = await User.find({ roles: role._id });
      for (const user of users) {
        await notifyRoleChange(user, role.name);
      }

      res.status(200).json({
        message: "Role updated successfully",
        role: {
          _id: role._id,
          name: role.name,
          permissions: permissionDocs,
        },
      });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Error updating role", error });
    }
  },
];

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ message: "Error deleting role", error });
  }
};
