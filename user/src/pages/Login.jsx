
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import axios from "axios";

import { auth } from "../firebase/firebase";
import { userContext } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setToken } = useContext(userContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save JobHub JWT and user information
  const saveLoginData = (data) => {
    if (!data?.success || !data?.token) {
      throw new Error(data?.message || "Login failed.");
    }

    localStorage.setItem("token", data.token);
    setToken(data.token);

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    navigate("/");
    scrollTo(0, 0)
  };

  // Login with Email + Password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!backendUrl) {
      setError("Backend URL is not configured.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${backendUrl.replace(/\/+$/, "")}/api/auth/login`,
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      saveLoginData(data);
    } catch (err) {
      console.error(
        "Email login error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const handleGoogleLogin = async () => {
    setError("");

    if (!backendUrl) {
      setError("Backend URL is not configured.");
      return;
    }

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Authenticate with Firebase
      const result = await signInWithPopup(auth, provider);

      // Get Firebase ID token
      const idToken = await result.user.getIdToken();

      // Send Firebase ID token to JobHub backend
      const { data } = await axios.post(
        `${backendUrl.replace(/\/+$/, "")}/api/auth/google`,
        { idToken }
      );

      // Save JobHub JWT returned by backend
      saveLoginData(data);
    } catch (err) {
      console.error(
        "Google login error:",
        err.response?.data || err.message
      );

      if (err.code === "auth/popup-closed-by-user") {
        setError("Google login was cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Your browser blocked the Google login popup.");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Google login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">
            JobHub
          </h1>

          <h2 className="text-2xl font-semibold text-gray-800 mt-6">
            Log in to your account
          </h2>

          <p className="text-gray-500 mt-2">
            Welcome back to JobHub
          </p>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <FcGoogle size={24} />

          <span className="font-medium text-gray-700">
            {loading ? "Please wait..." : "Continue with Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4"
          >
            {error}
          </div>
        )}

        {/* Email Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
