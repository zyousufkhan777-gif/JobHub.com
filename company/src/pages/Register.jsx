import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { companyContext } from "../context/companyContext";
import { toast } from "react-toastify";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const { setToken, backendUrl } = useContext(companyContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        try {
            setLoading(true);

            const { data } = await axios.post(
                `${backendUrl}/api/companies/register`,
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }
            );

            if (!data.success) {
                toast.error(data.message || "Registration failed.");
                return;
            }

            toast.success(data.message || "Account created successfully!");

            if (data.token) {
                localStorage.setItem("companyToken", data.token);
                setToken(data.token);
                navigate("/create-company");
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.error("Registration Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-10">
                {/* Header */}
                <div className="space-y-3 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-600">
                        JobHub
                    </h1>

                    <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                        Create Your Account
                    </h2>

                    <p className="text-sm leading-6 text-gray-500 sm:text-base">
                        Join JobHub and Build Your Hiring Future
                    </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="name"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            autoComplete="email"
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-50"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-green-600"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <p className="text-xs text-gray-400">
                            Use at least 8 characters for your password.
                        </p>
                    </div>

                    {/* Create Account */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-green-500 py-3.5 font-bold text-white shadow-lg shadow-green-100 transition duration-300 hover:-translate-y-0.5 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    {/* Login Link */}
                    <p className="pt-2 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-green-600 transition hover:text-green-700 hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                    By creating an account, you agree to JobHub's Terms of Service
                    and Privacy Policy.
                </p>
            </div>
        </section>
    );
};

export default Register;
