const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission;
