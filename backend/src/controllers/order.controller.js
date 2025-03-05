import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Stripe from "stripe";
import razorpay from "razorpay";

// global variables
const currency = "inr";
const deliveryCharge = 14;

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Placing orders using COD Method
const placeOrder = asyncHandler(async (req, res) => {
  const { items, address, amount } = req.body;

  if (!items.length)
    throw new ApiError(400, "please add the items to the cart first");

  for (const item in address) {
    if (!address[item])
      throw new ApiError(400, "please add the address details");
  }

  if (!amount) {
    throw new ApiError(400, "please send the amount");
  }

  const order = await Order.create({
    userId: req.user?._id,
    items,
    amount,
    address,
    paymentMethod: "COD",
    payment: false,
  });

  await User.findByIdAndUpdate(req.user?._id, { cartData: {} });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "order placed successfully"));
});

// Placing orders using Stripe method
const placeOrderStripe = asyncHandler(async (req, res) => {
  const { items, address, amount } = req.body;

  const { origin } = req.headers;

  if (!items.length)
    throw new ApiError(400, "please add the items to the cart first");

  for (const item in address) {
    if (!address[item])
      throw new ApiError(400, "please add the address details");
  }

  if (!amount) {
    throw new ApiError(400, "please send the amount");
  }

  const order = await Order.create({
    userId: req.user?._id,
    items,
    amount,
    address,
    paymentMethod: "Stripe",
    payment: false,
  });

  const line_items = items.map((item) => ({
    price_data: {
      currency: currency,
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  }));

  line_items.push({
    price_data: {
      currency: currency,
      product_data: {
        name: "Delivery Charges",
      },
      unit_amount: deliveryCharge * 100,
    },
    quantity: 1,
  });
  const session = await stripe.checkout.sessions.create({
    success_url: `${origin}/verify?success=true&orderId=${order._id}`,
    cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
    line_items,
    mode: "payment",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { session_url: session.url },
        "payment processed successfully"
      )
    );
});

const verifyStripe = asyncHandler(async (req, res) => {
  const { orderId, success } = req.body;

  if (success === "true") {
    await Order.findByIdAndUpdate(orderId, { payment: true });
    await User.findByIdAndUpdate(req.user?._id, { cartData: {} });
    return res.json({ success: true });
  } else {
    await Order.findByIdAndDelete(orderId);
    return res.json({ success: false });
  }
});

const placeOrderRazorpay = asyncHandler(async (req, res) => {
  const { items, address, amount } = req.body;

  if (!items.length)
    throw new ApiError(400, "please add the items to the cart first");

  for (const item in address) {
    if (!address[item])
      throw new ApiError(400, "please add the address details");
  }

  if (!amount) {
    throw new ApiError(400, "please send the amount");
  }

  const orderData = {
    userId: req.user?._id,
    items,
    address,
    amount,
    paymentMethod: "Razorpay",
    payment: false,
  };

  const newOrder = new Order(orderData);
  await newOrder.save();

  const options = {
    amount: amount * 100,
    currency: currency.toUpperCase(),
    receipt: newOrder._id.toString(),
  };

  await razorpayInstance.orders.create(options, (error, order) => {
    if (error) {
      console.log(error);
      throw new ApiError(400, error);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, order, "payment initiated successfully"));
  });
});

const verifyRazorpay = asyncHandler(async (req, res) => {
  const { razorpay_order_id } = req.body;

  const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

  if (orderInfo.status === "paid") {
    await Order.findByIdAndUpdate(orderInfo.receipt, { payment: true });
    await User.findByIdAndUpdate(req.user?._id, { cartData: {} });
    return res.status(200).json(new ApiResponse(200, {}, "Payment successful"));
  } else {
    throw new ApiError(400, "Payment failed");
  }
});
// All Orders data for Admin Panel

const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "orders fetched successfully"));
});

// update order status from admin panel
const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;

  const updatedStatus = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedStatus, "status updated successfully"));
});

const userOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user?.id });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "order fetched successfully"));
});

export {
  placeOrder,
  userOrders,
  updateStatus,
  allOrders,
  placeOrderRazorpay,
  placeOrderStripe,
  verifyStripe,
  verifyRazorpay,
};
