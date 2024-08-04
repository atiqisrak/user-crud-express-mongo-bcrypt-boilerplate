const mongoose = require("mongoose");

const UserRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
});

const UserRole = mongoose.model("UserRole", UserRoleSchema);

module.exports = UserRole;
