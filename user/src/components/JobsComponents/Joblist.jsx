import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import axios from "axios";
import { userContext } from "../../context/UserContext";
import JobFilter from "./JobFilter";

const normalizeCategory = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const getJobCategory = (job) => {
  const category =
    job?.category ??
    job?.jobCategory ??
    job?.categoryName ??
    "";

  // Handle category as a string or populated object.
  if (typeof category === "object" && category !== null) {
    return category.name || category.title || "";
  }

  return category;
};

const Joblist = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get("keyword")?.trim() || "";
  const searchLocation =
    searchParams.get("location")?.trim() || "";

  const context = useContext(userContext);

  const jobs = context?.jobs || [];
  const jobsLoading = context?.jobsLoading || false;

  const backendUrl = (
    context?.backendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  const selectedCategory = normalizeCategory(
    category ? decodeURIComponent(category) : ""
  );

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [filterResults, setFilterResults] = useState(null);
  const [filterError, setFilterError] = useState("");

  const isSearching = Boolean(keyword || searchLocation);

  // Search jobs from the backend.
  useEffect(() => {
    let cancelled = false;

    const fetchSearchResults = async () => {
      if (!isSearching) {
        setSearchResults([]);
        setSearchError("");
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      setSearchError("");

      try {
        const params = {};

        if (keyword) params.keyword = keyword;
        if (searchLocation) params.location = searchLocation;

        const response = await axios.get(
          `${backendUrl}/api/jobs/search`,
          { params }
        );

        if (response.data?.success === false) {
          throw new Error(
            response.data.message || "Failed to search jobs."
          );
        }

        if (!cancelled) {
          setSearchResults(
            Array.isArray(response.data?.jobs)
              ? response.data.jobs
              : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          setSearchResults([]);
          setSearchError(
            error.response?.data?.message ||
            error.message ||
            "Failed to load search results."
          );
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      cancelled = true;
    };
  }, [backendUrl, keyword, searchLocation, isSearching]);

  // Receive filter results from JobFilter.jsx.
  const handleFilterResults = (results) => {
    setFilterResults(Array.isArray(results) ? results : []);
    setFilterError("");
  };

  const handleFilterError = (message) => {
    setFilterError(message || "Failed to filter jobs.");
  };

  // Select source jobs, then apply the category filter.
  const filteredJobs = useMemo(() => {
    let sourceJobs;

    if (isSearching) {
      sourceJobs = searchResults;
    } else if (filterResults !== null) {
      sourceJobs = filterResults;
    } else {
      sourceJobs = jobs;
    }

    if (!selectedCategory) {
      return sourceJobs;
    }

    return sourceJobs.filter((job) => {
      const jobCategory = normalizeCategory(getJobCategory(job));

      return jobCategory === selectedCategory;
    });
  }, [
    jobs,
    searchResults,
    filterResults,
    isSearching,
    selectedCategory,
  ]);

  const loading = isSearching
    ? searchLoading
    : filterResults === null && jobsLoading;

  const displayedError = isSearching
    ? searchError
    : filterError;

  const clearSearch = () => {
    setFilterResults(null);
    setFilterError("");

    navigate(
      category
        ? `/jobs/${encodeURIComponent(category)}`
        : "/jobs"
    );
  };

  const pageTitle = selectedCategory
    ? `${category} Jobs`
    : isSearching
      ? "Search Results"
      : filterResults !== null
        ? "Filtered Jobs"
        : "Available Jobs";

  return (
    <section className="w-full">
      <div
        className={`mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 px-5 py-12 sm:px-6 ${!isSearching
            ? "md:grid-cols-[280px_minmax(0,1fr)] lg:gap-10"
            : ""
          }`}
      >
        {/* Filters */}
        {!isSearching && (
          <aside className="w-full min-w-0">
            <JobFilter
              onFilterResults={handleFilterResults}
              onFilterError={handleFilterError}
            />
          </aside>
        )}

        {/* Results */}
        <div className="w-full min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {isSearching ? "Search Results" : pageTitle}
              </h1>

              <p className="mt-1 break-words text-sm text-gray-500">
                {isSearching
                  ? `Results${keyword ? ` for "${keyword}"` : ""}${searchLocation
                    ? ` in "${searchLocation}"`
                    : ""
                  }`
                  : selectedCategory
                    ? `Explore available ${category} opportunities`
                    : "Find the right opportunity for you"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <p className="text-sm font-medium text-gray-500">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "Job" : "Jobs"}
              </p>

              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-green-500 hover:text-green-600"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          )}

          {/* Errors */}
          {displayedError && !loading && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {displayedError}
            </div>
          )}

          {/* Job cards */}
          {!loading && (
            <div className="flex w-full min-w-0 flex-col gap-5">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const companyName =
                    typeof job.company === "object"
                      ? job.company?.name
                      : null;

                  const companyLogo =
                    typeof job.company === "object"
                      ? job.company?.logo
                      : null;

                  return (
                    <article
                      key={job._id}
                      className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
                    >
                      {/* Company and title */}
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt={companyName || "Company"}
                              className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-contain p-1 sm:h-16 sm:w-16"
                            />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl font-bold text-gray-500 sm:h-16 sm:w-16">
                              {(companyName || "C")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h2 className="break-words text-lg font-bold leading-snug text-gray-900 sm:text-xl">
                              {job.title || "Untitled Job"}
                            </h2>

                            <p className="mt-1 break-words text-sm font-medium text-gray-500">
                              {companyName || "Company"}
                            </p>

                            {getJobCategory(job) && (
                              <p className="mt-1 break-words text-sm text-gray-400">
                                {getJobCategory(job)}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/jobDetails/${job._id}`)
                          }
                          className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 transition hover:border-green-500 hover:text-green-600"
                        >
                          View
                        </button>
                      </div>

                      {/* Job information */}
                      <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                        {job.location && (
                          <span className="max-w-full break-words rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            📍 {job.location}
                          </span>
                        )}

                        {job.jobType && (
                          <span className="max-w-full break-words rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            💼 {job.jobType}
                          </span>
                        )}

                        {job.workMode && (
                          <span className="max-w-full break-words rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600">
                            🏢 {job.workMode}
                          </span>
                        )}

                        {job.experience && (
                          <span className="max-w-full break-words rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            🎯 {job.experience}
                          </span>
                        )}

                        {job.salary && (
                          <span className="max-w-full break-words rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                            💰 {job.salary}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {Array.isArray(job.skills) &&
                        job.skills.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-sm font-semibold text-gray-700">
                              Required Skills
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill, index) => (
                                <span
                                  key={`${skill}-${index}`}
                                  className="break-words rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Dates and details */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-400">
                          Posted:{" "}
                          {job.createdAt
                            ? new Date(
                              job.createdAt
                            ).toLocaleDateString()
                            : "Recently posted"}
                        </p>

                        {job.deadline && (
                          <p className="text-sm text-gray-500">
                            Deadline:{" "}
                            {new Date(
                              job.deadline
                            ).toLocaleDateString()}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/jobDetails/${job._id}`);
                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }}
                          className="font-semibold text-green-600 transition hover:text-green-700"
                        >
                          View Job →
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                !loading && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {displayedError
                        ? "Unable to load jobs"
                        : "No jobs found"}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {displayedError
                        ? "Please check the server and try again."
                        : isSearching
                          ? "Try another keyword or location."
                          : filterResults !== null
                            ? "No jobs match your selected filters. Try changing or clearing your filters."
                            : `There are no jobs available in ${category || "this category"
                            }.`}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Joblist;
