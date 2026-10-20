
import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { companyContext } from "../context/companyContext";

const Login = () => {
    const navigate = useNavigate();
    const { backendUrl, setToken } = useContext(companyContext);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const { data } = await axios.post(
                `${backendUrl}/api/companies/login`,
                {
                    email: formData.email.trim(),
                    password: formData.password,
                }
            );

            if (!data.success || !data.token) {
                toast.error(data.message || "Login failed!");
                return;
            }

            localStorage.setItem("companyToken", data.token);
            setToken(data.token);

            toast.success(data.message || "Login successful!");
            navigate("/dasboard");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <Link to="/" className="text-3xl font-extrabold tracking-tight text-green-700">
                        Job<span className="text-gray-800">Hub</span>
                    </Link>

                    <p className="mt-2 text-sm text-gray-500">
                        Find opportunities. Build your future.
                    </p>
                </div>

                {/* Login Card */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-green-100 bg-white p-7 shadow-xl shadow-green-900/5 sm:p-9"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back!
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Sign in to manage your company account.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="company@example.com"
                            autoComplete="email"
                            required
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white shadow-md shadow-green-600/20 transition duration-200 hover:bg-green-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <div className="border-t border-gray-100 pt-5 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have a company account?{" "}
                            <Link
                                to="/"
                                className="font-semibold text-green-700 transition hover:text-green-800 hover:underline"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} JobHub. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
