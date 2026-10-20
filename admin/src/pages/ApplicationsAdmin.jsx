import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  FileText,
  UserRound,
  BriefcaseBusiness,
  Building2,
  Mail,
  Calendar,
  AlertCircle,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";

import { adminContext } from "../context/AdminContext";

const ApplicationsAdmin = () => {
  const { backendUrl, token } = useContext(adminContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${backendUrl}/api/admin/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to fetch applications."
        );
      }

      setApplications(
        Array.isArray(response.data.applications)
          ? response.data.applications
          : []
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch applications.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Helpers for possibly populated MongoDB references
  const getApplicant = (application) =>
    application?.user || application?.applicant || {};

  const getJob = (application) =>
    application?.job || application?.jobId || {};

  const getCompany = (job) =>
    job?.company || job?.companyId || {};

  const getApplicantName = (application) => {
    const applicant = getApplicant(application);

    if (typeof applicant === "string") return "Applicant";

    return (
      applicant?.name ||
      applicant?.fullName ||
      application?.applicantName ||
      "Unknown Applicant"
    );
  };

  const getApplicantEmail = (application) => {
    const applicant = getApplicant(application);

    if (typeof applicant === "string") {
      return application?.applicantEmail || "Not available";
    }

    return (
      applicant?.email ||
      application?.applicantEmail ||
      "Not available"
    );
  };

  const getJobTitle = (application) => {
    const job = getJob(application);

    if (typeof job === "string") {
      return application?.jobTitle || "Job";
    }

    return (
      job?.title ||
      job?.jobTitle ||
      job?.name ||
      application?.jobTitle ||
      "Unknown Job"
    );
  };

  const getCompanyName = (application) => {
    const job = getJob(application);

    if (typeof job === "string") {
      return application?.companyName || "Not available";
    }

    const company = getCompany(job);

    if (typeof company === "string") {
      return application?.companyName || "Not available";
    }

    return (
      company?.companyName ||
      company?.name ||
      job?.companyName ||
      application?.companyName ||
      "Not available"
    );
  };

  const getApplicationStatus = (application) =>
    application?.status ||
    application?.applicationStatus ||
    "Pending";

  const getApplicationDate = (application) =>
    application?.createdAt ||
    application?.appliedAt ||
    application?.applicationDate;

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

  const getStatusClasses = (status) => {
    const normalizedStatus = String(status).toLowerCase();

    if (
      normalizedStatus.includes("accept") ||
      normalizedStatus.includes("approv") ||
      normalizedStatus.includes("shortlist")
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      normalizedStatus.includes("reject") ||
      normalizedStatus.includes("declin")
    ) {
      return "bg-red-100 text-red-700";
    }

    if (
      normalizedStatus.includes("interview") ||
      normalizedStatus.includes("review")
    ) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  // Search applications
  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((application) => {
      const values = [
        getApplicantName(application),
        getApplicantEmail(application),
        getJobTitle(application),
        getCompanyName(application),
        getApplicationStatus(application),
        application?._id,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [applications, search]);

  // Fetch one application by ID
  const handleViewDetails = async (applicationId) => {
    if (!applicationId) {
      toast.error("Application ID is missing.");
      return;
    }

    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    setSelectedApplication(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/admin/applications/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success || !response.data?.application) {
        throw new Error(
          response.data?.message ||
          "Failed to fetch application details."
        );
      }

      setSelectedApplication(response.data.application);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch application details.";

      setDetailsError(message);
      toast.error(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close details modal
  const closeDetails = () => {
    setSelectedApplication(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  const openResume = (resumeUrl) => {
    if (!resumeUrl || typeof resumeUrl !== "string") {
      toast.error("No resume is available for this application.");
      return;
    }

    try {
      const url = new URL(resumeUrl);

      if (!["https:", "http:"].includes(url.protocol)) {
        throw new Error("Invalid URL");
      }

      window.open(url.href, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("The resume URL is invalid.");
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <FileText size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Applications Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review job applications and applicant details.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
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
                Total Applications
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {applications.length}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-green-700">
              <FileText size={25} />
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
                {filteredApplications.length}
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
          htmlFor="application-search"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Search Applications
        </label>

        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="application-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by applicant, email, job, or status..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">
            All Applications
          </h2>

          <p className="text-sm text-gray-500">
            {filteredApplications.length} application(s) found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
            <LoaderCircle
              size={34}
              className="animate-spin text-green-600"
            />

            <p className="text-sm text-gray-500">
              Loading applications...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle size={36} className="text-red-500" />

            <p className="font-medium text-gray-800">
              Unable to load applications
            </p>

            <p className="max-w-md text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchApplications}
              className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <FileText size={38} className="text-gray-300" />

            <p className="font-semibold text-gray-800">
              No applications found
            </p>

            <p className="text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "No job applications are available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Applicant
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Job
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Company
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Applied
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((application) => {
                  const status = getApplicationStatus(application);

                  return (
                    <tr
                      key={application._id}
                      className="transition hover:bg-green-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                            {getApplicantName(application)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {getApplicantName(application)}
                            </p>

                            <p className="mt-1 max-w-48 truncate text-xs text-gray-500">
                              {getApplicantEmail(application)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {getJobTitle(application)}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          ID: {application._id || "N/A"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {getCompanyName(application)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(getApplicationDate(application))}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewDetails(application._id)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:border-green-600 hover:bg-green-600 hover:text-white"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {(selectedApplication || detailsLoading || detailsError) && (
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
            aria-labelledby="application-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <h2
                id="application-details-title"
                className="text-lg font-bold text-gray-900"
              >
                Application Details
              </h2>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close application details"
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
                  Loading application details...
                </p>
              </div>
            ) : detailsError ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <AlertCircle size={36} className="text-red-500" />

                <p className="font-medium text-gray-800">
                  Unable to load application details
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
            ) : selectedApplication ? (
              <div className="space-y-5 p-5">
                <div className="rounded-xl bg-green-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
                      <FileText size={28} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-gray-900">
                        {getJobTitle(selectedApplication)}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {getCompanyName(selectedApplication)}
                      </p>

                      <p className="mt-2 break-all text-xs text-gray-500">
                        Application ID: {selectedApplication._id || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <UserRound size={18} />
                      <span className="text-sm font-semibold">
                        Applicant
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm text-gray-800">
                      {getApplicantName(selectedApplication)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Mail size={18} />
                      <span className="text-sm font-semibold">
                        Applicant Email
                      </span>
                    </div>

                    <p className="mt-2 break-all text-sm text-gray-800">
                      {getApplicantEmail(selectedApplication)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <BriefcaseBusiness size={18} />
                      <span className="text-sm font-semibold">Job Title</span>
                    </div>

                    <p className="mt-2 text-sm text-gray-800">
                      {getJobTitle(selectedApplication)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Building2 size={18} />
                      <span className="text-sm font-semibold">Company</span>
                    </div>

                    <p className="mt-2 text-sm text-gray-800">
                      {getCompanyName(selectedApplication)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Calendar size={18} />
                      <span className="text-sm font-semibold">
                        Application Date
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-800">
                      {formatDate(getApplicationDate(selectedApplication))}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-green-700">
                      Application Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        getApplicationStatus(selectedApplication)
                      )}`}
                    >
                      {getApplicationStatus(selectedApplication)}
                    </span>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">
                      Cover Letter
                    </h4>

                    <p className="whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-600">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                {selectedApplication.resume && (
                  <button
                    type="button"
                    onClick={() =>
                      openResume(
                        typeof selectedApplication.resume === "string"
                          ? selectedApplication.resume
                          : selectedApplication.resume?.url ||
                          selectedApplication.resume?.fileUrl
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-600 hover:text-white"
                  >
                    <ExternalLink size={16} />
                    Open Resume
                  </button>
                )}

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

export default ApplicationsAdmin;
