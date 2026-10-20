import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    Users,
    Building2,
    BriefcaseBusiness,
    FileText,
    RefreshCw,
    TrendingUp,
    AlertCircle,
} from "lucide-react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

import { adminContext } from "../context/AdminContext";

const COLORS = ["#16a34a", "#4ade80", "#15803d", "#86efac"];

const DasboardAdmin = () => {
    const { backendUrl, token } = useContext(adminContext);

    const [dashboard, setDashboard] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalApplications: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await axios.get(
                `${backendUrl}/api/admin/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!data.success) {
                throw new Error(data.message || "Failed to load dashboard");
            }

            // Backend returns { success: true, dashboard: {...} }
            setDashboard({
                totalUsers: Number(data.dashboard?.totalUsers) || 0,
                totalCompanies: Number(data.dashboard?.totalCompanies) || 0,
                totalJobs: Number(data.dashboard?.totalJobs) || 0,
                totalApplications:
                    Number(data.dashboard?.totalApplications) || 0,
            });
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Failed to load dashboard";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboard();
        } else {
            setLoading(false);
            setError("Authentication required. Please sign in again.");
        }
    }, [token, backendUrl]);

    const stats = [
        {
            title: "Total Users",
            value: dashboard.totalUsers,
            icon: Users,
            description: "Registered users",
        },
        {
            title: "Total Companies",
            value: dashboard.totalCompanies,
            icon: Building2,
            description: "Registered companies",
        },
        {
            title: "Total Jobs",
            value: dashboard.totalJobs,
            icon: BriefcaseBusiness,
            description: "Jobs on JobHub",
        },
        {
            title: "Total Applications",
            value: dashboard.totalApplications,
            icon: FileText,
            description: "Submitted applications",
        },
    ];

    const chartData = [
        { name: "Users", total: dashboard.totalUsers },
        { name: "Companies", total: dashboard.totalCompanies },
        { name: "Jobs", total: dashboard.totalJobs },
        { name: "Applications", total: dashboard.totalApplications },
    ];

    const hasChartData = chartData.some((item) => item.total > 0);

    return (
        <section className="space-y-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={28} className="text-green-600" />

                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Dashboard
                        </h1>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                        Overview of your JobHub platform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDashboard}
                    disabled={loading || !token}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Error state */}
            {error && !loading && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center"
                >
                    <AlertCircle
                        size={22}
                        className="shrink-0 text-red-600"
                    />

                    <div className="flex-1">
                        <p className="font-semibold text-red-800">
                            Unable to load dashboard
                        </p>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchDashboard}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Statistics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {stat.title}
                                    </p>

                                    <p className="mt-3 text-3xl font-bold text-gray-900">
                                        {loading ? "—" : stat.value.toLocaleString("en-US")}
                                    </p>

                                    <p className="mt-2 text-xs text-gray-500">
                                        {stat.description}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Bar chart */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900">
                            Platform Overview
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Current totals across JobHub.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex h-72 items-center justify-center">
                            <RefreshCw
                                size={30}
                                className="animate-spin text-green-600"
                            />
                        </div>
                    ) : !hasChartData ? (
                        <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                            No platform data available yet.
                        </div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -15,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: "#6b7280", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: "#6b7280", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        cursor={{ fill: "#f0fdf4" }}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #dcfce7",
                                        }}
                                    />

                                    <Bar
                                        dataKey="total"
                                        name="Total"
                                        fill="#16a34a"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Pie chart */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Data Distribution
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Share of each platform total.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex h-72 items-center justify-center">
                            <RefreshCw
                                size={30}
                                className="animate-spin text-green-600"
                            />
                        </div>
                    ) : !hasChartData ? (
                        <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                            No platform data available yet.
                        </div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.filter((item) => item.total > 0)}
                                        dataKey="total"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                    >
                                        {chartData
                                            .filter((item) => item.total > 0)
                                            .map((item) => (
                                                <Cell
                                                    key={item.name}
                                                    fill={
                                                        COLORS[
                                                        chartData.findIndex(
                                                            (entry) => entry.name === item.name
                                                        )
                                                        ]
                                                    }
                                                />
                                            ))}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #dcfce7",
                                        }}
                                    />

                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DasboardAdmin;
