import express from "express";
import cors from "cors";
import { ApiError } from "./utils/ApiErr.js";
import cookieParser from "cookie-parser";

const app = express();
//middleware
app.use(
  cors({
    origin: ["http://localhost:5174","https://forever-frontend-1.onrender.com", "https://full-stack-ecommerce-website-hmrq.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies, authorization headers
    maxAge: 86400, // Optional: cache preflight request for 24 hours
  })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import productRouter from "./routes/product.routes.js";
import userRouter from "./routes/user.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";

// api endpoints

app.get("/", (req, res) => {
  res.send("api working");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);

app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
  });
});

export default app;
