import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
    FiAlertCircle,
    FiArrowRight,
    FiBriefcase,
    FiCheckCircle,
    FiFileText,
    FiPlus,
    FiRefreshCw,
    FiTrendingUp,
    FiUsers,
} from "react-icons/fi";

import { companyContext } from "../context/companyContext";

const Dashboard = () => {
    const { token, backendUrl } = useContext(companyContext);
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");


    console.log(dashboard)

    const fetchDashboard = useCallback(
        async (showToast = false) => {
            if (!token) {
                setDashboard(null);
                setLoading(false);
                setApiError("Please log in to view your company dashboard.");
                return;
            }

            setLoading(true);
            setApiError("");

            try {
                const response = await axios.get(backendUrl + '/api/companies/dashboard',
                    {
                        headers: {
                            Authorization: `Bearer ${token} `,
                        },
                        timeout: 10000,
                    }
                );

                const data = response.data;

                if (
                    data?.success !== true ||
                    !data?.dashboard ||
                    typeof data.dashboard !== "object"
                ) {
                    throw new Error(
                        data?.message || "The backend returned invalid dashboard data."
                    );
                }

                setDashboard(data.dashboard);

                if (showToast) {
                    toast.success("Dashboard refreshed successfully.");
                }
            } catch (error) {
                setDashboard(null);

                let message = "Unable to load dashboard data.";

                if (error.response) {
                    const status = error.response.status;

                    if (status === 401) {
                        message = "Your session has expired. Please log in again.";
                    } else if (status === 403) {
                        message = "You do not have permission to access this dashboard.";
                    } else if (status === 404) {
                        message = "Dashboard API route was not found.";
                    } else if (status >= 500) {
                        message = "Backend server error. Check your server terminal.";
                    } else {
                        message =
                            error.response.data?.message ||
                            `Request failed with HTTP ${status}.`;
                    }
                } else if (error.code === "ECONNABORTED") {
                    message = "The request timed out. Please try again.";
                } else if (error.request) {
                    message = "Cannot connect to the backend. Is the server running?";
                } else {
                    message = error.message || message;
                }

                setApiError(message);

                if (showToast) {
                    toast.error(message);
                }
            } finally {
                setLoading(false);
            }
        },
        [backendUrl, token]
    );

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const formatValue = (value) => {
        return typeof value === "number" && Number.isFinite(value)
            ? value.toLocaleString()
            : "—";
    };

    const stats = [
        {
            title: "Jobs Posted",
            description: "All jobs posted by your company",
            value: dashboard?.jobs,
            icon: FiBriefcase,
            style: "bg-green-100 text-green-700",
        },
        {
            title: "Active Jobs",
            description: "Currently active job listings",
            value: dashboard?.activeJob,
            icon: FiTrendingUp,
            style: "bg-emerald-100 text-emerald-700",
        },
        {
            title: "Applications",
            description: "Applications received",
            value: dashboard?.applications,
            icon: FiFileText,
            style: "bg-lime-100 text-lime-800",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-lg sm:p-10">
                    <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/10" />

                    <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                                <FiCheckCircle />
                                Company Workspace
                            </span>

                            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                Find the right talent.
                                <br />
                                Build your future.
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-7 text-green-50 sm:text-base">
                                Manage your job listings, track applications, and connect
                                with candidates from your JobHub dashboard.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/company/job-post")}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-green-700 shadow-sm transition hover:bg-green-50"
                                >
                                    <FiPlus />
                                    Post a Job
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/company/applications")}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                                >
                                    View Applications
                                    <FiArrowRight />
                                </button>
                            </div>
                        </div>

                        <div className="hidden shrink-0 items-center justify-center md:flex">
                            <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/30 bg-white/10 shadow-inner">
                                <FiUsers className="text-7xl text-white" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Page Header */}
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Dashboard Overview
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Your company activity and recruitment statistics.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchDashboard(true)}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 font-semibold text-green-700 shadow-sm transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </section>

                {/* API Error */}
                {apiError && (
                    <section
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"
                    >
                        <FiAlertCircle className="mt-1 shrink-0 text-xl" />

                        <div>
                            <h3 className="font-bold">
                                Unable to load dashboard
                            </h3>

                            <p className="mt-1 text-sm">{apiError}</p>

                            <button
                                type="button"
                                onClick={() => fetchDashboard(true)}
                                className="mt-3 text-sm font-bold underline"
                            >
                                Try again
                            </button>
                        </div>
                    </section>
                )}

                {/* Statistics */}
                <section>
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            Recruitment Statistics
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Numbers returned by your backend.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {stats.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article
                                    key={item.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-slate-700">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-xs leading-5 text-slate-400">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className={`rounded - xl p - 3 ${item.style} `}>
                                            <Icon className="text-2xl" />
                                        </div>
                                    </div>

                                    <div className="mt-7">
                                        <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                                            {loading && !dashboard
                                                ? "..."
                                                : formatValue(item.value)}
                                        </p>

                                        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                                            {typeof item.value === "number" ? (
                                                <>
                                                    <FiCheckCircle className="text-green-600" />
                                                    Data loaded from backend
                                                </>
                                            ) : (
                                                "No valid value returned"
                                            )}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            Quick Actions
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Continue managing your recruitment process.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Applications */}
                        <button
                            type="button"
                            onClick={() => navigate("/company/applications")}
                            className="group flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-white p-6 text-left shadow-sm transition hover:border-green-400 hover:bg-green-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-green-100 p-4 text-green-700">
                                    <FiUsers className="text-2xl" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        View Applications
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Review applications from candidates.
                                    </p>
                                </div>
                            </div>

                            <FiArrowRight className="shrink-0 text-xl text-green-600 transition group-hover:translate-x-1" />
                        </button>

                        {/* Create Job */}
                        <button
                            type="button"
                            onClick={() => navigate("/company/job-post")}
                            className="group flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-white p-6 text-left shadow-sm transition hover:border-green-400 hover:bg-green-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-emerald-100 p-4 text-emerald-700">
                                    <FiBriefcase className="text-2xl" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Post a Job
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Create a new job listing.
                                    </p>
                                </div>
                            </div>

                            <FiArrowRight className="shrink-0 text-xl text-green-600 transition group-hover:translate-x-1" />
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} JobHub. Company Dashboard.
                </footer>
            </div>
        </main>
    );
};

export default Dashboard;
