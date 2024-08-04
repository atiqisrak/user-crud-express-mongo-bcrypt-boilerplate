const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserRole = require("../models/UserRole");
const Role = require("../models/Role");

exports.protect = async (req, res, next) => {
  if (process.env.INITIAL_SETUP === "true") {
    return next(); // Bypass authorization during initial setup
  }

  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -salt");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }
    const userRole = await UserRole.findOne({ userId: user._id }).populate(
      "roleId"
    );
    if (!userRole) {
      return res
        .status(401)
        .json({ message: "Not authorized, role not found" });
    }
    const role = await Role.findById(userRole.roleId).populate("permissions");
    req.user = user;
    req.user.role = role.name;
    req.user.permissions = role.permissions.map(
      (permission) => permission.name
    );
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

exports.authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (process.env.INITIAL_SETUP === "true") {
      return next(); // Bypass authorization during initial setup
    }
    if (
      !req.user.permissions.some((permission) =>
        requiredPermissions.includes(permission)
      )
    ) {
      return res
        .status(403)
        .json({ message: "Access denied, insufficient permissions" });
    }
    next();
  };
};
