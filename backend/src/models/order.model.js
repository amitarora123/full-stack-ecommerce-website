import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Order Placed",
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["COD", "Stripe", "Razorpay"],
        message: "Payment method must be COD, Stripe, or Razorpay",
      },
      required: [true, "Payment method is required"],
    },
    payment: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model.orders || mongoose.model("Order", orderSchema);

export default Order;
