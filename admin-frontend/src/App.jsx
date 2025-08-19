import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import { useState } from "react";
import Login from "./components/Login";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "$";
const App = () => {
  const [authStatus, setAuthStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fetchAdmin = async () => {
    try {
      const response = await axios.get(
        backendUrl + "/api/v1/users/fetchAdmin",
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  useState(() => {
    (async () => {
      try {
        setLoading(true);
        const isAuthenticated = await fetchAdmin();
        if (isAuthenticated) {
          setAuthStatus(true);
        }
      } catch (error) {
        setAuthStatus(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {!loading ? (
        !authStatus ? (
          <Login setAuthStatus={setAuthStatus} />
        ) : (
          <>
            <Navbar setAuthStatus={setAuthStatus} />
            <hr />
            <ToastContainer />
            <div className="flex w-full">
              <Sidebar />

              <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
                <Routes>
                  <Route path="/add" element={<Add />} />
                  <Route path="/list" element={<List />} />
                  <Route path="/orders" element={<Orders authStatus={authStatus} />} />
                </Routes>
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex items-center justify-center">
          <ClipLoader color="#3498db" size={50} />
        </div>
      )}
    </div>
  );
};

export default App;
