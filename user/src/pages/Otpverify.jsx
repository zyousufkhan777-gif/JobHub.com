
import React, { useContext, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { userContext } from "../context/UserContext";

const Otpverify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { backendUrl, setToken } = useContext(userContext);

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    if (!backendUrl) {
      setError("Backend URL is not configured.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${backendUrl.replace(/\/+$/, "")}/api/auth/verifyOtp`,
        {
          email,
          otp,
        }
      );

      if (!data.success || !data.token) {
        setError(data.message || "OTP verification failed.");
        return;
      }

      // Save Backend JWT
      localStorage.setItem("token", data.token);
      setToken(data.token);

      // Save user information
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setSuccess("Email verified successfully!");

      // Navigate after successful verification
      navigate("/");
    } catch (err) {
      console.error("OTP verification error:", err);

      setError(
        err.response?.data?.message ||
        "Could not verify the code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    try {
      setResending(true);

      const { data } = await axios.post(
        `${backendUrl.replace(/\/+$/, "")}/api/auth/sendOtp`,
        { email }
      );

      if (data.success) {
        setSuccess("A new verification code has been sent to your email.");
        setOtp("");
      } else {
        setError(data.message || "Could not resend the code.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);

      setError(
        err.response?.data?.message ||
        "Could not resend the code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">
            JobHub
          </h1>

          <h2 className="text-2xl font-semibold text-gray-800 mt-6">
            Verify your email
          </h2>

          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to your email.
          </p>

          {email && (
            <p className="text-sm font-medium text-gray-700 mt-3 break-all">
              {email}
            </p>
          )}
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

        {/* Success */}
        {success && (
          <div
            role="status"
            className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4"
          >
            {success}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Verification Code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-green-600 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-2">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || loading}
            className="text-green-700 font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        {/* Back to Register */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Back to{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Otpverify;
