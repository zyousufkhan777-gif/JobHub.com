import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Users,
  Mail,
  Calendar,
  UserRound,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { adminContext } from "../context/AdminContext";

const UsersAdmin = () => {
  const { backendUrl, token } = useContext(adminContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${backendUrl}/api/admin/getalluser`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to fetch users."
        );
      }

      setUsers(
        Array.isArray(response.data.users) ? response.data.users : []
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch users.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search users
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const name = String(user.name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const id = String(user._id || user.id || "").toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        id.includes(query)
      );
    });
  }, [users, search]);

  // Fetch a single user's details
  const handleViewDetails = async (userId) => {
    if (!userId) {
      toast.error("User ID is missing.");
      return;
    }

    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    setSelectedUser(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/admin/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success || !response.data?.user) {
        throw new Error(
          response.data?.message || "Failed to fetch user details."
        );
      }

      setSelectedUser(response.data.user);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch user details.";

      setDetailsError(message);
      toast.error(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close the details modal — defined only once
  const closeDetails = () => {
    setSelectedUser(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Users size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Users Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage and review registered users.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {users.length}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-green-700">
              <Users size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Search Results
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {filteredUsers.length}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Search size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <label
          htmlFor="user-search"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Search Users
        </label>

        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">
            All Users
          </h2>

          <p className="text-sm text-gray-500">
            {filteredUsers.length} user(s) found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
            <LoaderCircle
              size={34}
              className="animate-spin text-green-600"
            />

            <p className="text-sm text-gray-500">
              Loading users...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle size={36} className="text-red-500" />

            <p className="font-medium text-gray-800">
              Unable to load users
            </p>

            <p className="max-w-md text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchUsers}
              className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <Users size={38} className="text-gray-300" />

            <p className="font-semibold text-gray-800">
              No users found
            </p>

            <p className="text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "No registered users are available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Registered
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id || user.id}
                    className="transition hover:bg-green-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                          {String(user.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name || "Unknown User"}
                          </p>

                          <p className="mt-1 max-w-48 truncate text-xs text-gray-500">
                            ID: {user._id || user.id || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail
                          size={16}
                          className="shrink-0 text-gray-400"
                        />

                        <span>{user.email || "Not available"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewDetails(user._id || user.id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:border-green-600 hover:bg-green-600 hover:text-white"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {(selectedUser || detailsLoading || detailsError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2
                id="user-details-title"
                className="text-lg font-bold text-gray-900"
              >
                User Details
              </h2>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close user details"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-8">
                <LoaderCircle
                  size={32}
                  className="animate-spin text-green-600"
                />

                <p className="text-sm text-gray-500">
                  Loading user details...
                </p>
              </div>
            ) : detailsError ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <AlertCircle size={36} className="text-red-500" />

                <p className="font-medium text-gray-800">
                  Unable to load user details
                </p>

                <p className="text-sm text-gray-500">
                  {detailsError}
                </p>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="mt-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            ) : selectedUser ? (
              <div className="space-y-5 p-5">
                <div className="flex flex-col items-center rounded-xl bg-green-50 px-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                    {String(selectedUser.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-gray-900">
                    {selectedUser.name || "Unknown User"}
                  </h3>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    {selectedUser.email || "Not available"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <UserRound
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        User ID
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-800">
                        {selectedUser._id ||
                          selectedUser.id ||
                          "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Email Address
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-800">
                        {selectedUser.email || "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Registration Date
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
