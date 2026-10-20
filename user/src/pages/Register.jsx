
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

const Register = () => {
  const navigate = useNavigate();

  const { backendUrl, setToken } = useContext(userContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Register with Email + Password + OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!backendUrl) {
      setError("Backend URL is not configured.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create user in our Backend
      const registerResponse = await axios.post(
        `${backendUrl.replace(/\/+$/, "")}/api/auth/register`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      );

      if (!registerResponse.data.success) {
        throw new Error(
          registerResponse.data.message || "Registration failed."
        );
      }

      // Step 2: Send OTP to the user's email
      const otpResponse = await axios.post(
        `${backendUrl.replace(/\/+$/, "")}/api/auth/sendOtp`,
        {
          email: email.trim().toLowerCase(),
        }
      );

      if (!otpResponse.data.success) {
        throw new Error(
          otpResponse.data.message || "Could not send verification code."
        );
      }

      // Step 3: Navigate to OTP verification page
      navigate("/verify-otp", {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      console.error("Registration error:", err);

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setError(message || "This email is already registered.");
      } else if (err.response) {
        setError(message || "Registration failed. Please try again.");
      } else {
        setError(
          err.message || "Could not connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Register / Login with Google
  const handleGoogleRegister = async () => {
    setError("");

    if (!backendUrl) {
      setError("Backend URL is not configured.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Sign in with Google through Firebase
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);

      // Step 2: Get Firebase ID token
      const idToken = await result.user.getIdToken();

      // Step 3: Send Firebase token to our Backend
      const { data } = await axios.post(
        `${backendUrl.replace(/\/+$/, "")}/api/auth/google`,
        {
          idToken,
        }
      );

      if (!data.success || !data.token) {
        throw new Error(
          data.message || "Google authentication failed."
        );
      }

      // Step 4: Save our Backend JWT
      localStorage.setItem("token", data.token);
      setToken(data.token);

      // Save user information for display
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Step 5: Navigate to the home page
      navigate("/");
    } catch (err) {
      console.error("Google registration error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign in was cancelled.");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Google sign in failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">
            JobHub
          </h1>

          <h2 className="text-2xl font-semibold text-gray-800 mt-6">
            Create your account
          </h2>

          <p className="text-gray-500 mt-2">
            Join JobHub and find your next opportunity
          </p>
        </div>

        {/* Google Register Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 cursor-pointer border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle size={24} />

          <span className="font-medium text-gray-700">
            {loading ? "Please wait..." : "Continue with Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />

          <span className="text-sm text-gray-400">
            OR
          </span>

          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4"
          >
            {error}
          </div>
        )}

        {/* Email Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
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
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600 disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={8}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600 disabled:bg-gray-100"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              minLength={8}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-green-600 disabled:bg-gray-100"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
