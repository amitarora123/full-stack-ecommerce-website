import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiErr.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

const verifyAdmin = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(400, "Unauthorized request");
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  const admin = await User.findById(decodedToken?._id);

  if (admin.email !== process.env.ADMIN_EMAIL && admin.password !== process.env.ADMIN_PASSWORD){
    throw new ApiError(400, "Unauthorized request");
  }

  req.admin = admin;
  next();
});

export default verifyAdmin;
