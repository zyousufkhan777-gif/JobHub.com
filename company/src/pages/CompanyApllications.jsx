import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiBriefcase,
  FiMail,
  FiCalendar,
  FiExternalLink,
} from "react-icons/fi";

import { companyContext } from "../context/companyContext";

const STATUSES = [
  "pending",
  "under_review",
  "shortlisted",
  "rejected",
];

const formatStatus = (status) => {
  const labels = {
    pending: "Pending",
    under_review: "Under Review",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
  };

  return labels[status] || status || "Pending";
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "under_review":
      return "bg-violet-50 text-violet-700";
    case "shortlisted":
      return "bg-blue-50 text-blue-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getApplicant = (application) =>
  application.applicant ||
  application.user ||
  application.candidate ||
  {};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const CompanyApllications = () => {
  const {
    backendUrl,
    token,
    jobs,
    getallJob,
  } = useContext(companyContext);

  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");

  // Load company jobs.
  useEffect(() => {
    if (token) {
      getallJob();
    }
  }, [token, getallJob]);

  // Select the first available job.
  useEffect(() => {
    if (!jobs.length) {
      setSelectedJobId("");
      setApplications([]);
      return;
    }

    const exists = jobs.some(
      (job) => job._id === selectedJobId
    );

    if (!exists) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // Fetch applications for the selected job.
  const fetchApplications = useCallback(
    async (signal) => {
      if (!selectedJobId || !token) {
        setApplications([]);
        return;
      }

      setLoading(true);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/jobs/${selectedJobId}/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
            signal,
          }
        );

        if (!data.success) {
          setApplications([]);

          toast.error(
            data.message ||
            "Failed to load applications."
          );

          return;
        }

        setApplications(
          Array.isArray(data.applications)
            ? data.applications
            : []
        );
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "Fetch Applications Error:",
          error.response?.data || error.message
        );

        setApplications([]);

        toast.error(
          error.response?.data?.message ||
          "Failed to load applications."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [backendUrl, selectedJobId, token]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchApplications(controller.signal);

    return () => controller.abort();
  }, [fetchApplications]);

  // Update application status through the backend API.
  const handleStatusChange = async (
    applicationId,
    newStatus
  ) => {
    if (
      !selectedJobId ||
      !applicationId ||
      !token
    ) {
      toast.error("Missing application information.");
      return;
    }

    if (!STATUSES.includes(newStatus)) {
      toast.error("Invalid application status.");
      return;
    }

    setUpdatingId(applicationId);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/jobs/${selectedJobId}/applications/${applicationId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      if (!data.success) {
        toast.error(
          data.message ||
          "Failed to update application status."
        );
        return;
      }

      setApplications((previous) =>
        previous.map((application) =>
          String(application._id || application.id) ===
            String(applicationId)
            ? {
              ...application,
              status: data.application?.status || newStatus,
            }
            : application
        )
      );

      toast.success(
        data.message ||
        "Application status updated successfully."
      );
    } catch (error) {
      console.error(
        "Update Application Status Error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const selectedJob = jobs.find(
    (job) => job._id === selectedJobId
  );

  // Search applicants by name or email.
  const filteredApplications = applications.filter(
    (application) => {
      const applicant = getApplicant(application);

      const name = String(
        applicant.name ||
        applicant.fullName ||
        application.name ||
        ""
      );

      const email = String(
        applicant.email ||
        application.email ||
        ""
      );

      const query = search.trim().toLowerCase();

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    }
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Company Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Job Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review candidates and manage their application status.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FiBriefcase size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Your Jobs
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
                <FiUsers size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Applications
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {applications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <FiSearch size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Matching Results
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredApplications.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="jobSelect"
                className="text-sm font-semibold text-slate-700"
              >
                Select Job
              </label>

              <select
                id="jobSelect"
                value={selectedJobId}
                onChange={(event) =>
                  setSelectedJobId(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">
                  Select a job
                </option>

                {jobs.map((job) => (
                  <option
                    key={job._id}
                    value={job._id}
                  >
                    {job.title ||
                      job.jobTitle ||
                      "Untitled Job"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="applicationSearch"
                className="text-sm font-semibold text-slate-700"
              >
                Search Applicants
              </label>

              <div className="relative mt-2">
                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  id="applicationSearch"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {selectedJob && (
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <FiBriefcase size={16} />
              <span>
                Selected job:{" "}
                <strong className="text-slate-800">
                  {selectedJob.title ||
                    selectedJob.jobTitle ||
                    "Untitled Job"}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Applications Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Applicants
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredApplications.length} applicants
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <FiRefreshCw
                className="mx-auto mb-3 animate-spin"
                size={25}
              />
              Loading applications...
            </div>
          ) : !selectedJobId ? (
            <div className="px-5 py-16 text-center">
              <FiBriefcase
                className="mx-auto mb-4 text-slate-300"
                size={36}
              />
              <h3 className="font-semibold text-slate-900">
                No jobs available
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Post a job to start receiving applications.
              </p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <FiUsers
                className="mx-auto mb-4 text-slate-300"
                size={36}
              />
              <h3 className="font-semibold text-slate-900">
                No applications found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Applications for this job will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Applicant
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Applied On
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Resume
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Update Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((application) => {
                    const applicant = getApplicant(application);

                    const applicationId =
                      application._id || application.id;

                    const name =
                      applicant.name ||
                      applicant.fullName ||
                      application.name ||
                      "Unknown Applicant";

                    const email =
                      applicant.email ||
                      application.email ||
                      "No email provided";

                    const status =
                      application.status || "pending";

                    const resumeUrl =
                      application.resumeUrl ||
                      application.resume?.fileUrl ||
                      application.resume?.url ||
                      applicant.resumeUrl ||
                      "";

                    return (
                      <tr
                        key={applicationId}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <div className="font-semibold text-slate-900">
                            {name}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <FiMail size={14} />
                            {email}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <FiCalendar size={15} />
                            {formatDate(
                              application.createdAt ||
                              application.appliedAt
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          {resumeUrl ? (
                            <a
                              href={resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                              View Resume
                              <FiExternalLink size={14} />
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Not provided
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(status)}`}
                          >
                            {formatStatus(status)}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <select
                            value={status}
                            disabled={updatingId === applicationId}
                            onChange={(event) =>
                              handleStatusChange(
                                applicationId,
                                event.target.value
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-50"
                          >
                            {STATUSES.map((item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {formatStatus(item)}
                              </option>
                            ))}
                          </select>

                          {updatingId === applicationId && (
                            <p className="mt-1 text-xs text-slate-400">
                              Updating...
                            </p>
                          )}
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

export default CompanyApllications;
