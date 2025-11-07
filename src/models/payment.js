const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    receipt_url: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
