import React from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { useEffect } from "react";
import { assets } from "../assets/assets";
import { formatDate } from "../utils/formatDate.js";

const Orders = ({ authStatus }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!authStatus) {
      return null;
    }

    try {
      const response = await axios.get(backendUrl + "/api/v1/orders/list", {
        withCredentials: true,
      });

      if (response.data.success) {
        setOrders(response.data.data.reverse());
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const updateStatus = async (status, orderId) => {
    if (!authStatus) {
      return null;
    }
    try {
      const response = await axios.post(
        backendUrl + "/api/v1/orders/status",
        { status, orderId },
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAllOrders()
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [authStatus]);

  return (
    <div>
      <h3>Order Page</h3>
      {orders && (
        <div>
          {orders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 "
            >
              <img className="w-12" src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return (
                        <p className="py-0.5" key={index}>
                          {item.name} x {item.quantity} <span>{item.size}</span>
                        </p>
                      );
                    } else {
                      return (
                        <p className="py-0.5" key={index}>
                          {item.name} x {item.quantity} <span>{item.size}</span>
                        </p>
                      );
                    }
                  })}
                </div>
                <p className="mt-3 mb-2 font-medium">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>
                    {order.address.city +
                      ", " +
                      order.address.state +
                      ", " +
                      order.address.country +
                      ", " +
                      order.address.zipCode}
                  </p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className="text-sm sm:text-[15px]">
                  Items: {order.items.length}
                </p>
                <p className="mt-3">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                <p>Date: {formatDate(order.createdAt)}</p>
              </div>
              <p className="text-sm sm:text-[15px]">
                {currency}
                {order.amount}
              </p>

              <select
                onChange={(e) => updateStatus(e.target.value, order._id)}
                className="p-2 font-semibold"
                name=""
                id=""
                value={order.status}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">delivered</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
