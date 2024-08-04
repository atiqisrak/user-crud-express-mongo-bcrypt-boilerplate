const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  address: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  purchaseHistory: [
    {
      gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
      },
      purchaseDate: {
        type: Date,
        default: Date.now,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
  ],
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
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

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
