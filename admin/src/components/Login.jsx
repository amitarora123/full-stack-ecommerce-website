import React from "react";
import { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const Login = ({ setAuthStatus }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(
        backendUrl + "/api/v1/users/admin",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      setAuthStatus(true);
    } catch (error) {
      console.log(error);
      setAuthStatus(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <div className="max-w-md px-8 py-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 min-w-72">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Email Address
            </p>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              placeholder="your@gmail.com"
              required
            />
          </div>
          <div className="mb-3 min-w-72">
            <p className="mb-2 text-sm font-medium text-gray-700">Password</p>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-2 text-white bg-black rounded-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
