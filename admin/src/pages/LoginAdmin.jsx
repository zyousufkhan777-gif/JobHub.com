
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
    ShieldCheck,
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    Leaf,
} from "lucide-react";

import { adminContext } from "../context/AdminContext";

const LoginAdmin = () => {
    const { setToken, backendUrl } = useContext(adminContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password) {
            toast.error("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const { data } = await axios.post(
                `${backendUrl}/api/admin/login`,
                {
                    email: email.trim(),
                    password,
                },
                { timeout: 10000 }
            );

            if (!data.success || !data.token) {
                toast.error(data.message || "Login failed.");
                return;
            }

            setToken(data.token);
            toast.success("Login successful!");
            navigate("/admin-panel", { replace: true });
        } catch (error) {
            console.error(
                "Admin Login Error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to log in. Please check your connection."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f0fdf4] px-4 py-10">
            {/* Green background decorations */}
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green-200/50 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />

            <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl shadow-green-900/10 md:grid-cols-2">
                {/* Left panel */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-10 text-white md:flex lg:p-12">
                    <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border border-white/10" />
                    <div className="absolute -right-10 top-32 h-44 w-44 rounded-full border border-white/10" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-green-400/10" />

                    <div className="relative flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                            <Leaf size={27} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold tracking-wide">
                                JobHub
                            </h2>
                            <p className="text-xs text-green-100">
                                Administration Portal
                            </p>
                        </div>
                    </div>

                    <div className="relative my-12">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20">
                            <ShieldCheck size={46} strokeWidth={1.5} />
                        </div>

                        <h1 className="max-w-sm text-4xl font-bold leading-tight lg:text-5xl">
                            Manage your platform with confidence.
                        </h1>

                        <p className="mt-5 max-w-sm text-base leading-7 text-green-100">
                            Manage users, companies, jobs, and applications from one secure workspace.
                        </p>

                        <div className="mt-8 flex items-center gap-3 text-sm text-green-50">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20">
                                <ShieldCheck size={15} />
                            </span>
                            Secure administrator access
                        </div>
                    </div>

                    <p className="relative text-xs text-green-100/80">
                        © {new Date().getFullYear()} JobHub. All rights reserved.
                    </p>
                </div>

                {/* Right panel: Login form */}
                <div className="p-7 sm:p-10 lg:p-14">
                    <div className="mb-8 flex items-center gap-3 md:hidden">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white">
                            <ShieldCheck size={27} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-green-900">
                                JobHub Admin
                            </h1>
                            <p className="text-xs text-green-700">
                                Administration Portal
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            ADMINISTRATOR ACCESS
                        </span>

                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Sign in to access your JobHub dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Email Address
                            </label>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-green-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
                                <Mail size={19} className="shrink-0 text-green-700" />

                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-green-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
                                <Lock size={19} className="shrink-0 text-green-700" />

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((previous) => !previous)
                                    }
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                    className="shrink-0 text-slate-400 transition hover:text-green-700"
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:from-green-800 hover:to-emerald-700 hover:shadow-green-700/30 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign In"}

                            {!loading && (
                                <ArrowRight
                                    size={18}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            )}
                        </button>
                    </form>

                    <div className="mt-7 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
                        <ShieldCheck
                            size={20}
                            className="mt-0.5 shrink-0 text-green-700"
                        />

                        <p className="text-xs leading-5 text-green-800">
                            <span className="font-semibold">Secure access.</span>{" "}
                            This area is restricted to authorized administrators.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;
