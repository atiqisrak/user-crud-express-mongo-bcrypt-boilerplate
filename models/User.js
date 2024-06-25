const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});

UserSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("password")) {
    this.salt = crypto.randomBytes(16).toString("hex");
  }
  next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const pepper = process.env.PEPPER || "defaultPepper";
    this.password = await bcrypt.hash(this.password + this.salt + pepper, 10);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  const pepper = process.env.PEPPER || "defaultPepper";
  return await bcrypt.compare(
    enteredPassword + this.salt + pepper,
    this.password
  );
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
