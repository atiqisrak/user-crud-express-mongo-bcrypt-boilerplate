const User = require("../models/User");
const DeletedUser = require("../models/DeletedUser");
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
      const user = new User({ username, email, password });
      await user.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user", error });
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
        res.status(200).json({ message: "Logged in successfully" });
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
exports.updateUser = async (req, res) => {
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
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete User
// exports.deleteUser = async (req, res) => {
//   console.log("Delete request received for user ID:", req.params.id); // Log request
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       console.log("User not found"); // Log if user not found
//       return res.status(404).json({ message: "User not found" });
//     }
//     console.log("User deleted successfully"); // Log successful deletion
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error); // Log any error
//     res.status(500).json({ message: "Error deleting user", error });
//   }
// };

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
