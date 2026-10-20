import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "react-toastify";
import { userContext } from "../../context/UserContext";

const AllCompanies = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(userContext);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const baseUrl = backendUrl?.replace(/\/+$/, "");

  // Fetch all companies
  const fetchCompanies = useCallback(async () => {
    if (!baseUrl) {
      setError("Backend URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${baseUrl}/api/users/getcompanies`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to fetch companies."
        );
      }

      const data = Array.isArray(response.data.companies)
        ? response.data.companies
        : [];

      setCompanies(data);
    } catch (err) {
      console.error("Fetch Companies Error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load companies.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 50,
    });
  }, []);

  // Search companies instantly
  const searchedCompanies = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return companies;
    }

    return companies.filter((company) => {
      const searchableText = [
        company.name,
        company.companyName,
        company.category,
        company.industry,
        company.location,
        company.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [companies, search]);

  return (
    <section className="min-h-screen bg-white px-5 py-14 sm:px-8 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 font-semibold text-green-500">
            Find Your Next Workplace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            All Companies
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-gray-500">
            Explore companies, learn about their work, and discover
            new career opportunities.
          </p>
        </div>

        {/* Full-width Search */}
        <div className="mb-8 w-full">
          <label
            htmlFor="company-search"
            className="mb-3 block text-sm font-semibold text-gray-700"
          >
            Search Companies
          </label>

          <div className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-50 sm:px-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-gray-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              id="company-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, industry, location..."
              autoComplete="off"
              className="w-full min-w-0 bg-transparent py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 sm:text-base"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="shrink-0 rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            )}
          </div>

          {!loading && !error && (
            <p className="mt-3 text-sm text-gray-500">
              {searchedCompanies.length}{" "}
              {searchedCompanies.length === 1
                ? "company"
                : "companies"}{" "}
              {search.trim() ? "found" : "available"}
            </p>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-100 p-5"
              >
                <div className="h-14 w-14 rounded-xl bg-gray-200" />
                <div className="mt-5 h-5 w-2/3 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-1/3 rounded bg-gray-100" />
                <div className="mt-5 h-4 w-1/2 rounded bg-gray-100" />
                <div className="mt-5 h-10 rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <h2 className="font-semibold text-red-600">
              Could not load companies.
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchCompanies}
              className="mt-5 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          searchedCompanies.length === 0 && (
            <div className="rounded-2xl border border-gray-100 px-5 py-16 text-center">
              <div className="mb-4 text-4xl" aria-hidden="true">
                🏢
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                {search.trim()
                  ? "No matching companies"
                  : "No companies found"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                {search.trim()
                  ? `No companies match "${search.trim()}". Try another keyword.`
                  : "There are no companies available right now."}
              </p>

              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fetchCompanies}
                  className="mt-5 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
                >
                  Refresh Companies
                </button>
              )}
            </div>
          )}

        {/* Company Cards */}
        {!loading &&
          !error &&
          searchedCompanies.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {searchedCompanies.map((company, index) => {
                const companyName =
                  company.name ||
                  company.companyName ||
                  "Unnamed Company";

                return (
                  <article
                    key={company._id}
                    data-aos="fade-up"
                    data-aos-delay={Math.min(index * 80, 240)}
                    className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
                  >
                    {/* Logo and Jobs */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 p-2">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={`${companyName} logo`}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-xl font-bold text-green-600">
                            {companyName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
                        {Number(company.jobCount) || 0} Jobs
                      </span>
                    </div>

                    {/* Company Information */}
                    <div className="mt-5 flex-1">
                      <h2 className="break-words text-lg font-bold text-gray-900 transition group-hover:text-green-600">
                        {companyName}
                      </h2>

                      <p className="mt-1 text-sm text-green-600">
                        {company.category ||
                          company.industry ||
                          "Company"}
                      </p>

                      <p className="mt-3 text-sm text-gray-500">
                        <span aria-hidden="true">📍 </span>
                        {company.location || "Location not specified"}
                      </p>

                      {company.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                          {company.description}
                        </p>
                      )}
                    </div>

                    {/* View Company */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/companies/${company._id}`);
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="mt-6 w-full rounded-xl bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition hover:bg-green-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-100"
                    >
                      View Company →
                    </button>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
};

export default AllCompanies;
