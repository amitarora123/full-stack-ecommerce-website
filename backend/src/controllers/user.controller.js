import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import validator from "validator";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
      [error]
    );
  }
};

// controller for user register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // checking user already exist or not

  const exist = await User.findOne({ email });

  if (exist) throw new ApiError(400, "user already exist");

  // validating email format & strong password
  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Please enter a valid email");
  }

  if (password.length < 8) {
    throw new ApiError(400, "password length should be minimum 8");
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });

  const user = await User.findById(newUser._id).select(
    "-password -refreshToken -cartData"
  );

  if (!user) {
    throw new ApiError(501, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user created successfully"));
});

// controller for user login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validating email format
  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Please enter a valid email");
  }

  //checking if user exist
  const user = await User.findOne({ email }).select(" -refreshToken -cartData");

  if (!user) throw new ApiError(400, "Invalid user credentials ");

  // validating password

  if (!(await user.isPasswordCorrect(password)))
    throw new ApiError(400, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -cartData"
  );

  const options = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    );
});

// controller for admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL ||
    password === process.env.ADMIN_PASSWORD
  ) {
    const admin = await User.findOne({ email }).select();
    if (!admin.isPasswordCorrect(password))
      throw new ApiError("invalid credentials");

    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      admin._id
    );
    const loggedInAdmin = await User.findById(admin._id).select(
      "-password -cartData -refreshToken"
    );
    const options = {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { ...loggedInAdmin, accessToken, refreshToken },
          "admin login successful"
        )
      );
  } else {
    throw new ApiError(400, "Invalid credentials");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const fetchAdmin = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: req.admin?._id,
        name: req.admin?.name,
        email: req.admin?.email,
      },
      "admin fetched successfully"
    )
  );
});
const fetchUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user fetched successfully"));
});

export { loginUser, registerUser, adminLogin, logoutUser, fetchAdmin , fetchUser};
