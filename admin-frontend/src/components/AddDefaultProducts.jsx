import React from "react";
import { products } from "../assets/frontend_assets/assets";
import { backendUrl } from "../App";
import { useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
const AddDefaultProducts = () => {
  const formDatas = [];

  async function urlToFile(url, filename, mimeType) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  }

  const addDefaultProducts = async () => {
    for (const product of products) {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("category", product.category);
      formData.append("subCategory", product.subCategory);
      formData.append("bestseller", product.bestseller);
      formData.append("sizes", JSON.stringify(product.sizes));

      for (let i = 0; i < product.image.length; i++) {
        const imageFile = await urlToFile(
          product.image[i],
          `${product.name}${i}.jpg`,
          "image/jpeg"
        );
        if (imageFile) {
          formData.append(`image${i + 1}`, imageFile);
        }
      }

      formDatas.push(formData);
    }

    formDatas.forEach(async (formData) => {
      try {
        const response = await axios.post(
          backendUrl + "/api/v1/products/add",
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          toast.success(response.data.message);
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  useEffect(() => {
    addDefaultProducts();
  }, []);

  return <div>AddDefaultProducts</div>;
};

export default AddDefaultProducts;
