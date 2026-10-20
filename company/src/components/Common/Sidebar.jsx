
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FiGrid,
    FiHome,
    FiBriefcase,
    FiFileText,
    FiSettings,
    FiLogOut,
    FiX,
    FiPlus,
    FiHelpCircle,
} from "react-icons/fi";
import { useContext } from "react";
import { companyContext } from "../../context/companyContext";

const Sidebar = ({ isOpen = false, onClose }) => {
    const { setToken, setCompany } = useContext(companyContext);
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/company",
            icon: FiGrid,
            end: true,
        },
        {
            name: "Company Profile",
            path: "/company/profile",
            icon: FiHome,
        },
        {
            name: "Manage Jobs",
            path: "/company/jobs",
            icon: FiBriefcase,
        },
        {
            name: "Applications",
            path: "/company/applications",
            icon: FiFileText,
        },

    ];

    const handleLogout = () => {
        localStorage.removeItem("companyToken");
        setToken("");

        if (setCompany) {
            setCompany(null);
        }

        navigate("/login", { replace: true });
    };

    const closeSidebar = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={closeSidebar}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-green-800 text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
                    <NavLink
                        to="/company"
                        onClick={closeSidebar}
                        className="text-2xl font-bold tracking-tight"
                    >
                        Job<span className="text-green-300">Hub</span>
                    </NavLink>

                    <button
                        type="button"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                        className="rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
                    >
                        <FiX size={21} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-green-300">
                        Workspace
                    </p>

                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={closeSidebar}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                                            ? "bg-white text-green-800 shadow-sm"
                                            : "text-white/90 hover:bg-white/10 hover:text-white"
                                        }`
                                    }
                                >
                                    <Icon size={19} />
                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Help card */}
                    <div className="mt-7 rounded-xl border border-white/15 bg-white/5 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <FiHelpCircle size={18} className="text-green-300" />
                            <h3 className="text-sm font-semibold">Need help?</h3>
                        </div>

                        <p className="text-xs leading-5 text-green-100">
                            Manage your company profile to get started on JobHub.
                        </p>

                        <NavLink
                            to="/company/profile"
                            onClick={closeSidebar}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-green-200 hover:text-white"
                        >
                            Complete profile <FiPlus size={14} />
                        </NavLink>
                    </div>
                </div>

                {/* Logout */}
                <div className="border-t border-white/10 p-3">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                        <FiLogOut size={19} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
