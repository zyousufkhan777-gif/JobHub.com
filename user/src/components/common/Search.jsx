import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";

const Search = ({ searchOpen, setSearchOpen }) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const handleSearch = async (e) => {
    e.preventDefault();

    const keyword = search.trim();

    if (!keyword || loading) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${backendUrl}/api/jobs/all-search`,
        {
          params: { keyword },
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Failed to search jobs."
        );
      }

      // Go to the jobs page with the search keyword.
      navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`);

      setSearch("");
      setSearchOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to search jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-50 bg-green-400 transition-transform duration-300 ${searchOpen ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      <div className="flex items-start gap-4 p-6">
        <form
          onSubmit={handleSearch}
          className="flex w-full flex-wrap items-center gap-3"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search jobs, skills or positions..."
            aria-label="Search jobs"
            className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-5 py-4 text-gray-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          <button
            type="submit"
            disabled={loading || !search.trim()}
            aria-label="Search"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-900 text-white transition hover:bg-green-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="text-sm">...</span>
            ) : (
              <CiSearch className="text-3xl" />
            )}
          </button>

          {error && (
            <p className="w-full text-sm text-red-900" role="alert">
              {error}
            </p>
          )}
        </form>

        <button
          type="button"
          onClick={() => {
            setSearchOpen(false);
            setError("");
          }}
          aria-label="Close search"
          className="shrink-0 text-white transition hover:text-green-900"
        >
          <IoClose className="text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default Search;