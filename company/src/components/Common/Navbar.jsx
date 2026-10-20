
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
    FiSearch,
    FiChevronDown,
    FiMenu,
} from "react-icons/fi";
import { companyContext } from "../../context/companyContext";

const Navbar = ({ onMenuClick }) => {
    const { companyInfo, loadingCompany } = useContext(companyContext);

    const companyName = companyInfo?.companyName?.trim() || "";
    const logo = companyInfo?.logo;
    const initial = companyName
        ? companyName.charAt(0).toUpperCase()
        : "C";

    return (
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white">
            <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                {/* Left side */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        aria-label="Open menu"
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
                    >
                        <FiMenu size={22} />
                    </button>

                    <div>
                        <p className="hidden text-xs text-gray-500 sm:block">
                            Company Workspace
                        </p>
                        <h1 className="text-xl font-bold text-gray-900">
                            JobHub
                        </h1>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 sm:gap-5">

                    {/* Company profile */}
                    <Link
                        to="/company/profile"
                        className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-50"
                    >
                        {loadingCompany ? (
                            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                        ) : logo ? (
                            <img
                                src={logo}
                                alt={`${companyName} logo`}
                                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">
                                {initial}
                            </div>
                        )}

                        <div className="hidden md:block">
                            <span className="block max-w-40 truncate text-sm font-medium text-gray-700">
                                {loadingCompany
                                    ? "Loading company..."
                                    : companyName || "Company name unavailable"}
                            </span>

                            {!loadingCompany && !companyName && (
                                <span className="text-xs text-red-600">
                                    Company information not loaded
                                </span>
                            )}
                        </div>

                        <FiChevronDown
                            size={16}
                            className="hidden text-gray-400 md:block"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
