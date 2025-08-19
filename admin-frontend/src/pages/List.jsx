import axios from "axios";
import React from "react";
import { useState } from "react";
import { currency, backendUrl } from "../App";
import { toast } from "react-toastify";
import { useEffect } from "react";
const List = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/v1/products/list");
      setList(response.data.data);
      console.log(response.data.data)
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const removeProduct = async (productId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/v1/products/remove",
        { productId },
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      fetchList();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* List Table Title */}

        <div className="md:grid hidden md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {/* Product List */}

        {list.map((item, index) => (
          <div
            key={index}
            className="grid md:grid-cols-[1fr_3fr_1fr_1fr_1fr] grid-cols-[1fr_3fr_1fr] items-center py-1 px-2 border gap-2 text-sm"
          >
            <img className="w-12" src={item.image[0]} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <p
              onClick={() => {
                removeProduct(item._id);
              }}
              className="text-lg text-right cursor-pointer md:text-center"
            >
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
