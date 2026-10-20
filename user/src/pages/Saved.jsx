
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "react-toastify";

import { userContext } from "../context/UserContext";

const Saved = () => {
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(userContext);

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const baseUrl = backendUrl?.replace(/\/+$/, "");

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
    });
  }, []);

  // Fetch saved jobs from the backend
  const fetchSavedJobs = useCallback(async () => {
    if (!baseUrl) {
      setError("Backend URL is not configured.");
      setLoading(false);
      return;
    }

    if (!token) {
      setSavedJobs([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(
        `${baseUrl}/api/saved-jobs/get-saved-jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch saved jobs.");
      }

      setSavedJobs(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(
        "Fetch Saved Jobs Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch saved jobs."
      );
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  // Remove a saved job
  const handleRemoveSavedJob = async (jobId) => {
    if (!token) {
      toast.info("Please log in first.");
      navigate("/login");
      return;
    }

    if (!baseUrl || !jobId || removingId) return;

    setRemovingId(jobId);

    try {
      const { data } = await axios.delete(
        `${baseUrl}/api/saved-jobs/remove-saved-job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setSavedJobs((currentJobs) =>
          currentJobs.filter(
            (savedItem) => savedItem.job?._id !== jobId
          )
        );

        toast.success("Job removed from saved jobs.");
      }
    } catch (err) {
      console.error(
        "Remove Saved Job Error:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
        "Failed to remove saved job."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-5">
        <p className="text-gray-500">Loading saved jobs...</p>
      </div>
    );
  }

  // Not logged in
  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Login Required
          </h1>

          <p className="mt-3 text-gray-500">
            Please log in to view your saved jobs.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-5 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // API error
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-5">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Could Not Load Saved Jobs
          </h1>

          <p className="mt-3 break-words text-gray-500">{error}</p>

          <button
            type="button"
            onClick={fetchSavedJobs}
            className="mt-5 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-900 via-green-800 to-green-700">
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-200">
            Your Saved Jobs
          </p>

          <div className="flex items-center justify-between gap-5">
            <div>
              <h1 className="text-4xl font-bold text-white md:text-5xl">
                Saved Jobs
              </h1>

              <p className="mt-4 max-w-xl text-white/80">
                Keep track of the jobs you are interested in and apply later.
              </p>
            </div>

            <div className="hidden h-20 w-20 items-center justify-center rounded-full bg-white/10 md:flex">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Saved jobs content */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 rounded-xl bg-green-50 px-5 py-3">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
              />
            </svg>

            <span className="font-semibold text-green-700">
              Saved Jobs
            </span>

            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-green-600 px-1 text-xs font-bold text-white">
              {savedJobs.length}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchSavedJobs}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-600"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Empty state */}
        {savedJobs.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No Saved Jobs Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Explore available jobs and save the ones you want to revisit.
            </p>

            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((savedItem, index) => {
              const job = savedItem.job;

              // A saved record may reference a job that no longer exists.
              if (!job || typeof job !== "object" || !job._id) {
                return (
                  <div
                    key={savedItem._id || index}
                    className="rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <p className="text-gray-600">
                      This saved job is no longer available.
                    </p>
                  </div>
                );
              }

              const companyName =
                job.company && typeof job.company === "object"
                  ? job.company.name || "Company"
                  : "Company";

              const companyLogo =
                job.company && typeof job.company === "object"
                  ? job.company.logo
                  : null;

              const savedDate = savedItem.createdAt
                ? new Date(savedItem.createdAt).toLocaleDateString()
                : null;

              return (
                <div
                  key={savedItem._id || job._id}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(index * 60, 300)}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg md:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    {/* Company logo */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 p-2">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt={`${companyName} logo`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-green-600">
                          {companyName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Job details */}
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-lg font-bold text-gray-900 transition group-hover:text-green-600">
                        {job.title || "Untitled Job"}
                      </h2>

                      <p className="mt-1 font-medium text-green-600">
                        {companyName}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        📍 {job.location || "Location not specified"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.category && (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                            {job.category}
                          </span>
                        )}

                        {job.jobType && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {job.jobType}
                          </span>
                        )}

                        {job.workMode && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {job.workMode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Salary and saved date */}
                    <div className="flex shrink-0 flex-col gap-3 text-sm text-gray-600 lg:w-48">
                      <div className="flex items-center gap-2 font-medium text-gray-700">
                        <svg
                          className="h-5 w-5 shrink-0 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="7" width="18" height="13" rx="2" />
                          <path
                            strokeLinecap="round"
                            d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                          />
                        </svg>

                        {job.salary || "Salary not specified"}
                      </div>

                      {savedDate && (
                        <p className="text-xs text-gray-400">
                          Saved on {savedDate}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 lg:w-48 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/jobDetails/${job._id}`);
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        View Details →
                      </button>

                      <button
                        type="button"
                        disabled={removingId === job._id}
                        onClick={() => handleRemoveSavedJob(job._id)}
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {removingId === job._id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Saved;
