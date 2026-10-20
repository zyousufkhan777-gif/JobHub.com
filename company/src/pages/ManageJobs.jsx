import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiMapPin,
  FiBriefcase,
  FiRefreshCw,
  FiEdit,
} from "react-icons/fi";

import { companyContext } from "../context/companyContext";

const ManageJobs = () => {
  const {
    backendUrl,
    token,
    jobs,
    setJobs,
    getallJob,
    loadingJobs,
  } = useContext(companyContext);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (token) {
      getallJob();
    }
  }, [token, getallJob]);

  // Filter jobs locally.
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const title = job.title || job.jobTitle || "";
      const location = job.location || "";
      const company = job.companyName || "";

      const matchesSearch = [
        title,
        location,
        company,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      );

      const type = job.jobType || job.type || "";
      const matchesType =
        filterType === "All" ||
        type.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [jobs, search, filterType]);

  // Delete a job.
  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    setDeletingId(jobId);

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      if (data.success) {
        setJobs((previousJobs) =>
          previousJobs.filter(
            (job) => job._id !== jobId
          )
        );

        toast.success("Job deleted successfully.");
      } else {
        toast.error(
          data.message || "Failed to delete job."
        );
      }
    } catch (error) {
      console.error(
        "Delete Job Error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to delete job."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Company Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Manage Jobs
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create, search, and manage your job listings.
            </p>
          </div>


          <button
            type="button"
            onClick={() => navigate("/company/job-post")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <FiPlus size={19} />
            Post a Job
          </button>

        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FiBriefcase size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Jobs
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {jobs.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FiSearch size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Search Results
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {filteredJobs.length}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Jobs table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Your Job Listings
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredJobs.length} jobs
            </span>
          </div>

          {loadingJobs && jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FiRefreshCw
                className="mx-auto mb-3 animate-spin"
                size={25}
              />
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FiBriefcase size={26} />
              </div>

              <h3 className="font-semibold text-slate-900">
                {jobs.length === 0
                  ? "No jobs posted yet"
                  : "No matching jobs found"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {jobs.length === 0
                  ? "Create your first job listing to get started."
                  : "Try changing your search or filter."}
              </p>

              {jobs.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/job-post")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <FiPlus size={17} />
                  Create Your First Job
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Job
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Location
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Job Type
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Posted
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => {
                    const title =
                      job.title ||
                      job.jobTitle ||
                      "Untitled Job";

                    const location =
                      job.location || "Not specified";

                    const type =
                      job.jobType ||
                      job.type ||
                      "Not specified";

                    return (
                      <tr
                        key={job._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <div className="font-semibold text-slate-900">
                            {title}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FiMapPin
                              className="shrink-0 text-slate-400"
                              size={16}
                            />
                            {location}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {type}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-500">
                          {formatDate(
                            job.createdAt
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">


                            <button
                              type="button"
                              title="Delete job"
                              onClick={() =>
                                handleDelete(
                                  job._id
                                )
                              }
                              disabled={
                                deletingId ===
                                job._id
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FiTrash2
                                size={16}
                              />

                              {deletingId ===
                                job._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
