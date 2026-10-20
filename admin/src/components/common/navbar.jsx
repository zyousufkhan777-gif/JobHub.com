import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    ShieldCheck,
    LayoutDashboard,
    Users,
    BriefcaseBusiness,
    Building2,
    FileText,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { adminContext } from "../../context/AdminContext";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const { setToken } = useContext(adminContext);
    const navigate = useNavigate();

    const navigationLinks = [
        {
            name: "Dashboard",
            path: "/admin-panel",
            icon: LayoutDashboard,
        },
        {
            name: "Users",
            path: "/admin-panel/users",
            icon: Users,
        },
        {
            name: "Jobs",
            path: "/admin-panel/jobs",
            icon: BriefcaseBusiness,
        },
        {
            name: "Companies",
            path: "/admin-panel/companies",
            icon: Building2,
        },
        {
            name: "Applications",
            path: "/admin-panel/applications",
            icon: FileText,
        },
    ];

    const handleLogout = () => {
        setToken("");
        navigate("/login", { replace: true });
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Logo */}
                    <button
                        type="button"
                        onClick={() => navigate("/admin-panel")}
                        className="flex items-center gap-3"
                        aria-label="Go to dashboard"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-md shadow-green-200">
                            <ShieldCheck size={24} />
                        </div>

                        <div className="text-left">
                            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                                Job<span className="text-green-600">Hub</span>
                            </h1>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-700">
                                Admin Panel
                            </p>
                        </div>
                    </button>

                    {/* Desktop navigation */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        {navigationLinks.map((link) => {
                            const Icon = link.icon;

                            return (
                                <button
                                    key={link.name}
                                    type="button"
                                    onClick={() => navigate(link.path)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
                                >
                                    <Icon size={17} />
                                    {link.name}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Admin profile */}
                    <div className="relative flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-gray-800">Administrator</p>
                            <p className="text-xs text-green-600">System Manager</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setProfileOpen((open) => !open)}
                            className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-1.5 transition hover:bg-green-100"
                            aria-label="Open administrator menu"
                            aria-expanded={profileOpen}
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white">
                                A
                            </div>
                            <ChevronDown
                                size={16}
                                className="mr-1 text-green-700"
                            />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-14 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                                <p className="px-3 py-2 text-xs text-gray-500">
                                    Administrator account
                                </p>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    <LogOut size={17} />
                                    Sign out
                                </button>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            className="rounded-lg p-2 text-gray-700 transition hover:bg-green-50 lg:hidden"
                            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={23} /> : <Menu size={23} />}
                        </button>
                    </div>
                </div>

                {/* Mobile navigation */}
                {menuOpen && (
                    <nav className="border-t border-green-100 bg-white p-3 lg:hidden">
                        <div className="mx-auto flex max-w-[1600px] flex-col gap-1">
                            {navigationLinks.map((link) => {
                                const Icon = link.icon;

                                return (
                                    <button
                                        key={link.name}
                                        type="button"
                                        onClick={() => {
                                            navigate(link.path);
                                            setMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                                    >
                                        <Icon size={19} />
                                        {link.name}
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                                <LogOut size={19} />
                                Sign out
                            </button>
                        </div>
                    </nav>
                )}
            </header>

            {/* Close profile menu when clicking outside is a future enhancement */}
        </>
    );
};

export default Navbar;
