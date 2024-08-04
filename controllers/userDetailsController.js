const UserDetails = require("../models/UserDetails");
const { check, validationResult } = require("express-validator");

// Create User Details
exports.createUserDetails = [
  check("userId").isMongoId().withMessage("Invalid user ID"),
  check("firstName").not().isEmpty().withMessage("First name is required"),
  check("lastName").not().isEmpty().withMessage("Last name is required"),
  check("dateOfBirth").isDate().withMessage("Invalid date of birth"),
  check("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  check("phone").not().isEmpty().withMessage("Phone number is required"),
  check("address.street").not().isEmpty().withMessage("Street is required"),
  check("address.city").not().isEmpty().withMessage("City is required"),
  check("address.state").not().isEmpty().withMessage("State is required"),
  check("address.postalCode")
    .not()
    .isEmpty()
    .withMessage("Postal code is required"),
  check("address.country").not().isEmpty().withMessage("Country is required"),
  check("online_id").not().isEmpty().withMessage("Online ID is required"),
  check("online_status").isIn([0, 1]).withMessage("Invalid online status"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
      profilePicture,
      preferences,
      online_id,
      online_status,
      about,
      roles,
      permissions,
    } = req.body;

    try {
      const userDetails = new UserDetails({
        userId,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        address,
        profilePicture,
        preferences,
        online_id,
        online_status,
        about,
        roles,
        permissions,
      });

      await userDetails.save();
      res.status(201).json({
        message: "User details created successfully",
        userDetails,
      });
    } catch (error) {
      console.error("Error creating user details:", error);
      res.status(500).json({ message: "Error creating user details", error });
    }
  },
];

// Get User Details by User ID
exports.getUserDetailsByUserId = async (req, res) => {
  try {
    const userDetails = await UserDetails.findOne({ userId: req.params.userId })
      .populate("roles")
      .populate("permissions");
    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details", error });
  }
};

// Update User Details
exports.updateUserDetails = [
  check("firstName")
    .optional()
    .not()
    .isEmpty()
    .withMessage("First name is required"),
  check("lastName")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Last name is required"),
  check("dateOfBirth").optional().isDate().withMessage("Invalid date of birth"),
  check("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  check("phone")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Phone number is required"),
  check("address.street")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Street is required"),
  check("address.city")
    .optional()
    .not()
    .isEmpty()
    .withMessage("City is required"),
  check("address.state")
    .optional()
    .not()
    .isEmpty()
    .withMessage("State is required"),
  check("address.postalCode")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Postal code is required"),
  check("address.country")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Country is required"),
  check("profilePicture")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Profile picture is required"),
  check("preferences.language")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Language is required"),
  check("preferences.currency")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Currency is required"),
  check("about").optional().not().isEmpty().withMessage("About is required"),
  check("online_status")
    .optional()
    .isIn([0, 1])
    .withMessage("Invalid online status"),
  check("roles").optional().isArray().withMessage("Roles should be an array"),
  check("permissions")
    .optional()
    .isArray()
    .withMessage("Permissions should be an array"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userDetails = await UserDetails.findOne({
        userId: req.params.userId,
      });
      if (!userDetails) {
        return res.status(404).json({ message: "User details not found" });
      }

      const isAdmin =
        req.user.roles.includes("admin") ||
        req.user.roles.includes("superadmin");
      const isSelf = req.user._id.toString() === req.params.userId;

      if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: "Access denied" });
      }

      const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        address,
        profilePicture,
        preferences,
        online_status,
        about,
        roles,
        permissions,
      } = req.body;

      // Users can update their own info and online status
      if (isSelf) {
        userDetails.firstName = firstName || userDetails.firstName;
        userDetails.lastName = lastName || userDetails.lastName;
        userDetails.dateOfBirth = dateOfBirth || userDetails.dateOfBirth;
        userDetails.gender = gender || userDetails.gender;
        userDetails.phone = phone || userDetails.phone;
        userDetails.address = address || userDetails.address;
        userDetails.profilePicture =
          profilePicture || userDetails.profilePicture;
        userDetails.preferences = preferences || userDetails.preferences;
        userDetails.about = about || userDetails.about;
        userDetails.online_status = online_status || userDetails.online_status;
      }

      // Admins can update roles and permissions
      if (isAdmin) {
        userDetails.roles = roles || userDetails.roles;
        userDetails.permissions = permissions || userDetails.permissions;
      }

      await userDetails.save();

      res.status(200).json({
        message: "User details updated successfully",
        userDetails,
      });
    } catch (error) {
      console.error("Error updating user details:", error);
      res.status(500).json({ message: "Error updating user details", error });
    }
  },
];

// Delete User Details
exports.deleteUserDetails = async (req, res) => {
  try {
    const userDetails = await UserDetails.findOneAndDelete({
      userId: req.params.userId,
    });
    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }
    res.status(200).json({ message: "User details deleted successfully" });
  } catch (error) {
    console.error("Error deleting user details:", error);
    res.status(500).json({ message: "Error deleting user details", error });
  }
};
