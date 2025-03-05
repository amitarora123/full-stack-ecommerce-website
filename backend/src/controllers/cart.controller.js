import { isValidObjectId } from "mongoose";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addToCart = asyncHandler(async (req, res) => {
  const { itemId, size } = req.body;

  // Fix condition to properly check for missing values
  if (!itemId || !size) {
    throw new ApiError(400, "itemId and size are required");
  }

  const userData = await User.findById(req.user?._id);

  if (!userData) {
    throw new ApiError(404, "User not found");
  }

  // Ensure cartData exists
  let cartData = userData.cartData || {};

  // Initialize itemId entry if missing
  if (!cartData[itemId]) {
    cartData[itemId] = {};
  }

  // Update size quantity
  if (cartData[itemId][size]) {
    cartData[itemId][size] += 1;
  } else {
    cartData[itemId][size] = 1;
  }

  // Update user in database
  const user = await User.findByIdAndUpdate(
    userData._id,
    { $set: { cartData: cartData } },
    { new: true, runValidators: true } // Ensures validation runs
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Product added to cart"));
});

const updateCart = asyncHandler(async (req, res) => {
  const { itemId, size, quantity } = req.body;
  if (!isValidObjectId(itemId) || !size || quantity === undefined)
    throw new ApiError(400, "All fields are required");

  const userData = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  let cartData = userData.cartData;

  if (!cartData[itemId])
    throw new ApiError(400, "please first add the item to the cart ");

  cartData[itemId][size] = quantity;

  const user = await User.findByIdAndUpdate(
    userData._id,
    { $set: { cartData: cartData } },
    { new: true, runValidators: true } // Ensures validation runs
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cart updated successfully"));
});

const getUserCart = asyncHandler(async (req, res) => {
  const userData = await User.findById(req.user?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, userData.cartData, "cart fetched successfully"));
});

export { getUserCart, addToCart, updateCart };
