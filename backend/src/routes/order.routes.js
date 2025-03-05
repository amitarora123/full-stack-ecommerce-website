import express from "express";
import {
  placeOrder,
  placeOrderRazorpay,
  placeOrderStripe,
  allOrders,
  updateStatus,
  userOrders,
  verifyStripe,
  verifyRazorpay,
} from "../controllers/order.controller.js";
import verifyAdmin from "../middleware/adminAuth.middleware.js";
import verifyJwt from "../middleware/auth.middleware.js";

const orderRouter = express.Router();

//Admin features
orderRouter.get("/list", verifyAdmin, allOrders);
orderRouter.post("/status", verifyAdmin, updateStatus);

//payment features
orderRouter.post("/place", verifyJwt, placeOrder);
orderRouter.post("/stripe", verifyJwt, placeOrderStripe);
orderRouter.post("/razorpay", verifyJwt, placeOrderRazorpay);

//User features
orderRouter.get("/user-orders", verifyJwt, userOrders);

// verify payment
orderRouter.post("/verifyRazorpay", verifyJwt, verifyRazorpay)
orderRouter.post("/verifyStripe", verifyJwt, verifyStripe);

export default orderRouter;