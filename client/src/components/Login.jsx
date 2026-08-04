import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "@fontsource/permanent-marker";
import "@fontsource/playfair-display";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './../../utils/api';
import { alertError, alertSuccess } from './../../utils/alert';
import Loader from "./Loader";

const base_url = BASE_URL;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log("Login Form Submitted:", data);
    setLoading(true);
    try {
      // API request
      const res = await axios.post(`${base_url}/api/login`, {
        email: data.email,
        password: data.password
      });

      // Handle success
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        alertSuccess(res.data.message || "Login successful!");
        navigate(res.data.redirect || "/dashboard");
      } else {
        alertError("Login failed: Invalid response from server");
      }

    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);

      // Show clear error message
      if (error.response?.data?.message) {
        alertError(`Error: ${error.response.data.message}`);
      } else {
        alertError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen w-full">
      {loading && <Loader text="Logging in..." />}
      {/* Left Section */}
      <div className="flex w-1/2 items-center justify-center bg-gradient-to-br from-[#476EAE] to-[#48B3AF] p-6">
        <h1
          className="text-white text-5xl md:text-6xl font-bold underline underline-offset-8 decoration-wavy decoration-yellow-300"
          style={{ fontFamily: "Playfair Display, cursive" }}
        >
          Invoice Buddy
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex w-1/2 flex-col bg-gradient-to-br from-[#F6FF99] to-[#FFD6A5] justify-center p-8 md:p-16">
        <h2
          className="relative text-3xl text-center font-extrabold mb-8 text-gray-900 tracking-wide"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Login
          <span className="absolute left-1/2 -bottom-3 w-20 h-1.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transform -translate-x-1/2"></span>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 
              bg-white focus:outline-none focus:border-4 focus:border-dotted focus:border-indigo-500 
              shadow-inner transition duration-300"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 
              bg-white focus:outline-none focus:border-4 focus:border-dotted focus:border-pink-500 
              shadow-inner transition duration-300 pr-12"
            />
            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black"
            >
              {showPassword ? (
                // Eye Open SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1l22 22" />
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c.71-1.21 1.75-2.57 3-3.73M10.58 10.58A3 3 0 0 0 13.42 13.42" />
                </svg>
              ) : (
                // Eye Closed SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Gradient Login Button */}
          <button
            type="submit"
            className="group w-full relative overflow-hidden rounded-xl 
            bg-gradient-to-r from-[#19183B] to-[#4338CA] px-6 py-3 
            text-lg font-semibold text-white shadow-lg transition-all duration-300 
            cursor-pointer hover:scale-105 hover:shadow-2xl"
          >
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
            opacity-0 transition duration-300 group-hover:opacity-100"></span>
            <span className="relative">Login</span>
          </button>
        </form>
      </div>
    </div>
  );
}
