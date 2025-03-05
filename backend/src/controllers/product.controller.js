import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiErr.js";
import Product from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
// function for adding product

const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, subCategory, sizes, bestseller } =
    req.body;
  [
    (name, description, price, category, subCategory, sizes, bestseller),
  ].forEach((item) => {
    if (!item) {
      throw new ApiError(400, "all fields are required required");
    }
  });
  const image1 = req.files.image1 && req.files.image1[0];
  const image2 = req.files.image2 && req.files.image2[0];
  const image3 = req.files.image3 && req.files.image3[0];
  const image4 = req.files.image4 && req.files.image4[0];

  const images = [image1, image2, image3, image4].filter((item) => {
    return item !== undefined;
  });
  if (!images.length)
    throw new ApiError(400, "at least one product image is required");

  let imagesUrl = await Promise.all(
    images.map(async (item) => {
      let result = await uploadOnCloudinary(item?.path);
      return result?.secure_url;
    })
  );

  const productData = {
    name,
    description,
    category,
    price: Number(price),
    subCategory,
    bestseller: bestseller === "true" ? true : false,
    sizes: JSON.parse(sizes),
    image: imagesUrl,
  };

  const product = new Product(productData);
  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "product added successfully"));
});

// function for list product
const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  return res
    .status(200)
    .json(new ApiResponse(200, products, "products fetched successfully"));
});
// function for removing product
const removeProduct = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.body.productId))
    throw new ApiError(400, "Invalid productId");

  const product = await Product.findById(req.body.productId);
  const imageUrls = product["image"];

  imageUrls.forEach(async (url) => {
    if (url) {
      const isImageDeleted = await deleteFromCloudinary(url);
      if (!isImageDeleted) throw new ApiError(400, "product unable to delete");
    }
  });

  const deleteResponse = await Product.deleteOne({ _id: req.body.productId });

  return res
    .status(200)
    .json(new ApiResponse(200, deleteResponse, "Product Removed"));
});
// function for single product info
const singleProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) throw new ApiError(400, "invalid productId");

  const product = await Product.findById(productId);

  if (!product) throw new ApiError(400, "product doesn't exist");

  return res
    .status(200)
    .json(new ApiResponse(200, product, "product fetched successfully"));
});

export { listProducts, addProduct, removeProduct, singleProduct };
