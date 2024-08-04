const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserDetailsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  phone: {
    type: String,
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  profilePicture: {
    type: String,
  },
  preferences: {
    language: { type: String, default: "en" },
    currency: { type: String, default: "BDT" },
  },
  online_id: {
    type: String,
    ref: "User",
  },
  online_status: {
    type: Number,
    enum: [0, 1],
    default: 0,
  },
  about: {
    type: String,
  },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  permissions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Permission",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserDetailsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const UserDetails = mongoose.model("UserDetails", UserDetailsSchema);

module.exports = UserDetails;
