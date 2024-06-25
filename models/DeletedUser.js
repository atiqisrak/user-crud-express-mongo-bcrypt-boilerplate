const mongoose = require("mongoose");

const DeletedUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

const DeletedUser = mongoose.model("DeletedUser", DeletedUserSchema);

module.exports = DeletedUser;
