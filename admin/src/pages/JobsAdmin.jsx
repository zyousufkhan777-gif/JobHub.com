import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Eye,
  Trash2,
  X,
  BriefcaseBusiness,
  MapPin,
  Calendar,
  Building2,
  AlertCircle,
  LoaderCircle,
  DollarSign,
} from "lucide-react";

import { adminContext } from "../context/AdminContext";

const JobsAdmin = () => {
  const { backendUrl, token } = useContext(adminContext);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // Get all jobs
  const fetchJobs = useCallback(async () => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${backendUrl}/api/admin/alljobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to fetch jobs."
        );
      }

      setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch jobs.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Search jobs
  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return jobs;

    return jobs.filter((job) => {
      const searchableValues = [
        job.title,
        job.name,
        job.companyName,
        job.location,
        job.category,
        job.jobType,
        job.type,
        job._id,
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [jobs, search]);

  // Get job details by ID
  const handleViewDetails = async (jobId) => {
    if (!jobId) {
      toast.error("Job ID is missing.");
      return;
    }

    setSelectedJob(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/admin/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success || !response.data?.job) {
        throw new Error(
          response.data?.message || "Failed to fetch job details."
        );
      }

      setSelectedJob(response.data.job);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch job details.";

      setDetailsError(message);
      toast.error(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Delete a job
  const handleDeleteJob = async (jobId) => {
    if (!jobId) {
      toast.error("Job ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(jobId);

      const response = await axios.delete(
        `${backendUrl}/api/admin/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to delete job."
        );
      }

      setJobs((previousJobs) =>
        previousJobs.filter(
          (job) => String(job._id) !== String(jobId)
        )
      );

      if (
        selectedJob &&
        String(selectedJob._id) === String(jobId)
      ) {
        setSelectedJob(null);
      }

      toast.success(response.data.message || "Job deleted successfully.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete job.";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  // Close details modal
  const closeDetails = () => {
    setSelectedJob(null);
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

  const getJobTitle = (job) =>
    job?.title || job?.jobTitle || job?.name || "Untitled Job";

  const getCompanyName = (job) =>
    job?.companyName ||
    job?.company?.name ||
    job?.company?.companyName ||
    "Not available";

  const getLocation = (job) =>
    job?.location || job?.jobLocation || "Not specified";

  const getJobType = (job) =>
    job?.jobType || job?.type || "Not specified";

  const getSalary = (job) => {
    if (job?.salary !== undefined && job?.salary !== null && job.salary !== "") {
      return typeof job.salary === "object"
        ? JSON.stringify(job.salary)
        : String(job.salary);
    }

    if (job?.salaryRange) return String(job.salaryRange);

    return "Not specified";
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <BriefcaseBusiness size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Jobs Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View, manage, and delete job listings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchJobs}
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
                Total Jobs
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {jobs.length}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-green-700">
              <BriefcaseBusiness size={25} />
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
                {filteredJobs.length}
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
          htmlFor="job-search"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Search Jobs
        </label>

        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="job-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, company, location, or category..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">All Jobs</h2>

          <p className="text-sm text-gray-500">
            {filteredJobs.length} job(s) found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
            <LoaderCircle
              size={34}
              className="animate-spin text-green-600"
            />

            <p className="text-sm text-gray-500">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle size={36} className="text-red-500" />

            <p className="font-medium text-gray-800">
              Unable to load jobs
            </p>

            <p className="max-w-md text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={fetchJobs}
              className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <BriefcaseBusiness size={38} className="text-gray-300" />

            <p className="font-semibold text-gray-800">No jobs found</p>

            <p className="text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "No job listings are available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Job
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Company
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Job Type
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map((job) => (
                  <tr
                    key={job._id}
                    className="transition hover:bg-green-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                          <BriefcaseBusiness size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {getJobTitle(job)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            ID: {job._id || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {getCompanyName(job)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="shrink-0 text-gray-400" />
                        {getLocation(job)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        {getJobType(job)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(job._id)}
                          title="View job details"
                          aria-label={`View ${getJobTitle(job)}`}
                          className="rounded-lg border border-green-200 bg-green-50 p-2 text-green-700 transition hover:bg-green-600 hover:text-white"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job._id)}
                          disabled={deletingId === job._id}
                          title="Delete job"
                          aria-label={`Delete ${getJobTitle(job)}`}
                          className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === job._id ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {(selectedJob || detailsLoading || detailsError) && (
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
            aria-labelledby="job-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <h2
                id="job-details-title"
                className="text-lg font-bold text-gray-900"
              >
                Job Details
              </h2>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close job details"
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
                  Loading job details...
                </p>
              </div>
            ) : detailsError ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <AlertCircle size={36} className="text-red-500" />

                <p className="font-medium text-gray-800">
                  Unable to load job details
                </p>

                <p className="text-sm text-gray-500">{detailsError}</p>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="mt-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            ) : selectedJob ? (
              <div className="space-y-6 p-5">
                <div className="rounded-xl bg-green-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
                      <BriefcaseBusiness size={28} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-gray-900">
                        {getJobTitle(selectedJob)}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {getCompanyName(selectedJob)}
                      </p>

                      <p className="mt-2 break-all text-xs text-gray-500">
                        ID: {selectedJob._id || "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <MapPin size={18} />
                      <span className="text-sm font-semibold">Location</span>
                    </div>

                    <p className="mt-2 text-sm text-gray-700">
                      {getLocation(selectedJob)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Building2 size={18} />
                      <span className="text-sm font-semibold">Job Type</span>
                    </div>

                    <p className="mt-2 text-sm text-gray-700">
                      {getJobType(selectedJob)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <DollarSign size={18} />
                      <span className="text-sm font-semibold">Salary</span>
                    </div>

                    <p className="mt-2 break-words text-sm text-gray-700">
                      {getSalary(selectedJob)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Calendar size={18} />
                      <span className="text-sm font-semibold">Posted Date</span>
                    </div>

                    <p className="mt-2 text-sm text-gray-700">
                      {formatDate(
                        selectedJob.createdAt || selectedJob.updatedAt
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">
                    Description
                  </h4>

                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                    {selectedJob.description ||
                      selectedJob.jobDescription ||
                      "No description available."}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">
                    Requirements
                  </h4>

                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                    {selectedJob.requirements ||
                      selectedJob.qualifications ||
                      "No requirements available."}
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteJob(selectedJob._id)}
                    disabled={deletingId === selectedJob._id}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete Job
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

export default JobsAdmin;