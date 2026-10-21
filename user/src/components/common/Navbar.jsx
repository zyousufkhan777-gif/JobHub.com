import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import { NavLink, useNavigate } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

import {
  FaHome,
  FaBriefcase,
  FaBuilding,
  FaHeart,
  FaFileAlt,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";

import axios from "axios";

import Logo from "../../assets/jobhub-logo.png";
import upload_area from "../../assets/upload_area.png";

import Notification from "./Notification";
import Search from "./Search";

import { userContext } from "../../context/UserContext.jsx";

const COMPANY_URL = "http://localhost:5175";

const Navbar = () => {
  const navigate = useNavigate();
  const context = useContext(userContext);

  if (!context) {
    throw new Error(
      "Navbar must be rendered inside UserContextProvider."
    );
  }

  const {
    token,
    setToken,
    user,
    setUser,
    backendUrl,
  } = context;

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications.
  useEffect(() => {
    if (!token || !backendUrl) {
      setUnreadCount(0);
      return;
    }

    const controller = new AbortController();

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.data?.success) {
          const notifications =
            response.data.notifications || [];

          const unread = notifications.filter(
            (notification) => !notification.isRead
          ).length;

          setUnreadCount(unread);
        }
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          console.error(
            "Failed to fetch unread notifications:",
            error
          );
        }
      }
    };

    fetchUnreadCount();

    return () => controller.abort();
  }, [token, backendUrl]);

  const linkStyle = ({ isActive }) =>
    isActive
      ? "text-green-900 font-bold border-b-2 border-green-900 pb-1 transition"
      : "font-semibold hover:text-green-900 transition";

  // Navigate to the separate company application.
  const handleAdminClick = () => {
    window.location.href = 'https://job-hub-com-56jv.vercel.app/login';
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setUnreadCount(0);

    setProfileOpen(false);
    setNotificationOpen(false);
    setSearchOpen(false);

    navigate("/login");
  };

  const handleNotificationOpen = () => {
    setNotificationOpen((previous) => !previous);
    setProfileOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setProfileOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const profileImage = user?.profilePhoto || upload_area;

  return (
    <>
      {/* Desktop Navbar */}
      <header className="bg-slate-100 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <img
              className="w-36 md:w-48"
              src={Logo}
              alt="JobHub"
            />
          </NavLink>

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink className={linkStyle} to="/">
              Home
            </NavLink>

            <NavLink className={linkStyle} to="/jobs">
              Jobs
            </NavLink>

            <NavLink className={linkStyle} to="/companies">
              Companies
            </NavLink>

            <NavLink className={linkStyle} to="/saved">
              Saved
            </NavLink>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search */}
            <button
              type="button"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-1 transition hover:bg-white"
            >
              <CiSearch className="text-2xl md:text-3xl" />
            </button>

            {/* Company Admin Login */}
            {!token && (
              <button
                type="button"
                onClick={handleAdminClick}
                className="rounded-xl bg-green-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-green-950 md:px-4"
              >
                Admin
              </button>
            )}

            {/* Notifications */}
            {token && (
              <div className="relative">
                <button
                  type="button"
                  aria-label={`Notifications: ${unreadCount} unread`}
                  aria-expanded={notificationOpen}
                  onClick={handleNotificationOpen}
                  className="relative transition hover:text-green-900"
                >
                  <IoMdNotificationsOutline className="text-2xl md:text-3xl" />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-900 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Profile or Login */}
            {token ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  onClick={() => {
                    setProfileOpen((previous) => !previous);
                    setNotificationOpen(false);
                  }}
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <img
                    className="h-9 w-9 cursor-pointer rounded-full object-cover md:h-10 md:w-10"
                    src={profileImage}
                    alt="Profile"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = upload_area;
                    }}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-[60] w-60 rounded-2xl bg-white p-3 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => handleNavigate("/profile")}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      <FaHome className="text-green-600" />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/my-resume")}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      <FaFileAlt className="text-green-600" />
                      My Resume
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/saved")}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      <FaHeart className="text-red-500" />
                      Saved Jobs
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate("/applications")}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                    >
                      <FaClipboardList className="text-green-600" />
                      My Applications
                    </button>

                    <div className="my-2 border-t border-gray-200" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  className="rounded-xl bg-green-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-green-950 md:px-4"
                  to="/login"
                >
                  Login
                </NavLink>

                <NavLink
                  className="hidden rounded-xl border-2 border-green-500 px-4 py-2 font-bold text-green-700 transition hover:bg-white md:block"
                  to="/register"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navbar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-green-200 bg-green-500 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-lg md:hidden"
      >
        <NavLink
          to="/"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-1 text-xs font-semibold transition ${isActive ? "text-green-950" : "text-white"
            }`
          }
        >
          <FaHome className="text-xl" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/jobs"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-1 text-xs font-semibold transition ${isActive ? "text-green-950" : "text-white"
            }`
          }
        >
          <FaBriefcase className="text-xl" />
          <span>Jobs</span>
        </NavLink>

        <NavLink
          to="/companies"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-1 text-xs font-semibold transition ${isActive ? "text-green-950" : "text-white"
            }`
          }
        >
          <FaBuilding className="text-xl" />
          <span>Companies</span>
        </NavLink>

        <NavLink
          to="/saved"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-1 text-xs font-semibold transition ${isActive ? "text-green-950" : "text-white"
            }`
          }
        >
          <FaHeart className="text-xl" />
          <span>Saved</span>
        </NavLink>
      </nav>

      {/* Notifications and Search */}
      <Notification
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
      />

      <Search
        setSearchOpen={setSearchOpen}
        searchOpen={searchOpen}
      />
    </>
  );
};

export default Navbar;
