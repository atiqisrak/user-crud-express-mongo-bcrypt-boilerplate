const User = require("../models/User");
const DeletedUser = require("../models/DeletedUser");
const Role = require("../models/Role");
const Customer = require("../models/Customer");
const UserDetails = require("../models/UserDetails");
const { generateToken } = require("../utils/jwt");
const { check, validationResult } = require("express-validator");

// Create User
exports.createUser = [
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
      const userCount = await User.countDocuments();
      const user = new User({ username, email, password });
      await user.save();

      // Automatically assign 'customer' role
      const customerRole = await Role.findOne({ name: "customer" });
      if (customerRole) {
        user.roles.push(customerRole._id);
        await user.save();
      } else {
        return res.status(500).json({ message: "Customer role not found" });
      }

      // Add user to the Customer collection
      const customer = new Customer({
        userId: user._id,
        roles: user.roles,
        permissions: customerRole.permissions,
      });
      await customer.save();

      // Create user details
      const userDetails = new UserDetails({
        userId: user._id,
        online_id: username,
        firstName: "",
        lastName: "",
        dateOfBirth: new Date(),
        gender: "male",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        roles: [customerRole._id],
        permissions: customerRole.permissions.map(
          (permissions) => permissions._id
        ),
      });
      await userDetails.save();

      let responseMessage = "User created successfully.";

      if (userCount === 0) {
        // First user, assign superadmin role
        const superadminRole = await Role.findOne({ name: "superadmin" });
        if (!superadminRole) {
          return res.status(500).json({ message: "Superadmin role not found" });
        }
        user.roles.push(superadminRole._id);
        await user.save();
        responseMessage += " Superadmin role assigned.";
      }

      res.status(201).json({
        message: responseMessage,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user", error });
    }
  },
];

// Bulk Create Users
exports.bulkCreateUsers = [
  check("users").isArray().withMessage("Users should be an array"),
  check("users.*.username").not().isEmpty().withMessage("Username is required"),
  check("users.*.email").isEmail().withMessage("Email is not valid"),
  check("users.*.password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { users } = req.body;

    try {
      const customerRole = await Role.findOne({ name: "customer" }).populate(
        "permissions"
      );
      if (!customerRole) {
        return res.status(500).json({ message: "Customer role not found" });
      }

      const createdUsers = await Promise.all(
        users.map(async (userData) => {
          const user = new User(userData);
          await user.save();

          // Automatically assign 'customer' role
          user.roles.push(customerRole._id);
          await user.save();

          // Add user to the Customer collection
          const customer = new Customer({
            userId: user._id,
            roles: user.roles,
            permissions: customerRole.permissions,
          });
          await customer.save();

          // Create user details
          const userDetails = new UserDetails({
            userId: user._id,
            online_id: user.username, // Assuming online_id is the same as username
            firstName: "",
            lastName: "",
            dateOfBirth: new Date(), // Default date, should be updated later
            gender: "other", // Default value, should be updated later
            phone: "",
            address: {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "",
            },
            roles: [customerRole._id],
            permissions: customerRole.permissions.map(
              (permission) => permission._id
            ),
          });
          await userDetails.save();

          return user;
        })
      );

      res.status(201).json({
        message: "Users created successfully",
        users: createdUsers.map((user) => ({
          _id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        })),
      });
    } catch (error) {
      console.error("Error creating users:", error);
      res.status(500).json({ message: "Error creating users", error });
    }
  },
];

// Login User
exports.loginUser = [
  check("email").isEmail().withMessage("Email is not valid"),
  check("password").exists().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user);
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
        res.status(200).json({
          message: "Logged in successfully",
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
          },
          token: token,
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in", error });
    }
  },
];

// Logout User
exports.logoutUser = (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).json({ message: "Logged out successfully" });
};

// Get All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -salt");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -salt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// Update User
exports.updateUser = [
  check("username")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric"),
  check("email").isEmail().withMessage("Email is not valid"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      await user.save();
      res.status(200).json({
        message: "User updated successfully",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user", error });
    }
  },
];

// Soft delete
exports.deleteUser = async (req, res) => {
  console.log("Delete request received for user ID:", req.params.id);
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Move user to deleted users collection
    const deletedUser = new DeletedUser({
      username: user.username,
      email: user.email,
      password: user.password,
      salt: user.salt,
      deletedAt: new Date(),
    });
    await deletedUser.save();

    // Remove user from users collection
    await user.deleteOne();
    console.log("User deleted successfully");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};
