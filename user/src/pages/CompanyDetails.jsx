
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaGlobe,
  FaMapMarkerAlt,
  FaRedo,
  FaUsers,
} from "react-icons/fa";
import { userContext } from "../context/UserContext";

const CompanyDetails = () => {
  const { id } = useParams();
  const context = useContext(userContext);

  const backendUrl = context?.backendUrl?.replace(/\/+$/, "") || "";
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 80,
    });
  }, []);

  const fetchCompanyDetails = useCallback(async () => {
    if (!id) {
      setError("Company ID is missing.");
      setLoading(false);
      return;
    }

    if (!backendUrl) {
      setError("Backend URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${backendUrl}/api/users/getcompanies/${encodeURIComponent(id)}`
      );

      const data = response.data;

      if (!data?.success || !data?.company) {
        throw new Error(data?.message || "Company details could not be loaded.");
      }

      setCompany(data.company);
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      console.error("Fetch Company Details Error:", err);

      setCompany(null);
      setJobs([]);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load company details."
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl, id]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  const companyName =
    company?.companyName || "Company";

  const companyLogo =
    company?.logo || company?.companyLogo || company?.profilePhoto || "";

  const companyLocation =
    company?.location || company?.address || company?.city || "";

  const companyIndustry =
    company?.industry || company?.category || "";

  const companyWebsite =
    company?.website || company?.companyWebsite || "";

  const companyDescription =
    company?.description || company?.about || "";

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getWebsiteUrl = (website) => {
    if (!website || typeof website !== "string") return null;

    const value = website.trim();

    if (!value) return null;

    try {
      const url = new URL(
        /^https?:\/\//i.test(value) ? value : `https://${value}`
      );

      if (!["http:", "https:"].includes(url.protocol)) return null;

      return url.href;
    } catch {
      return null;
    }
  };

  const websiteUrl = getWebsiteUrl(companyWebsite);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"
            role="status"
            aria-label="Loading"
          />
          <p className="mt-4 text-gray-600">
            Loading company details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <FaBuilding className="mx-auto text-4xl text-gray-400" />

          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            Unable to load company
          </h2>

          <p className="mt-3 break-words text-gray-600">
            {error || "Company not found."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={fetchCompanyDetails}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
            >
              <FaRedo />
              Try Again
            </button>

            <Link
              to="/companies"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <FaArrowLeft />
              Back to Companies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Back navigation */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-green-600"
        >
          <FaArrowLeft />
          Back to Companies
        </Link>
      </div>

      {/* Company header */}
      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-aos="fade-up"
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="h-36 bg-gradient-to-r from-green-700 via-green-600 to-emerald-400 sm:h-48" />

          <div className="px-5 pb-8 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm sm:h-32 sm:w-32">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={`${companyName} logo`}
                    className="h-full w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <FaBuilding className="text-4xl text-green-600 sm:text-5xl" />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-2 sm:pb-1">
                <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                  {companyName}
                </h1>

                {companyIndustry && (
                  <p className="mt-2 text-gray-600">
                    {companyIndustry}
                  </p>
                )}

                {companyLocation && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <FaMapMarkerAlt className="shrink-0 text-green-600" />
                    {companyLocation}
                  </p>
                )}
              </div>

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
                >
                  Visit Website
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              )}
            </div>

            {/* Company information */}
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {companyLocation && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {companyLocation}
                    </p>
                  </div>
                </div>
              )}

              {(company.size || company.companySize) && (
                <div className="flex items-start gap-3">
                  <FaUsers className="mt-1 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Company Size</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {company.size || company.companySize}
                    </p>
                  </div>
                </div>
              )}

              {(company.founded || company.foundedYear) && (
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="mt-1 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Founded</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {company.founded || company.foundedYear}
                    </p>
                  </div>
                </div>
              )}

              {websiteUrl && (
                <div className="flex items-start gap-3">
                  <FaGlobe className="mt-1 text-green-600" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all font-medium text-green-700 hover:underline"
                    >
                      {companyWebsite}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About company */}
      {companyDescription && (
        <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            data-aos="fade-up"
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-xl font-bold text-gray-900">
              About the Company
            </h2>

            <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
              {companyDescription}
            </p>
          </div>
        </section>
      )}

      {/* Jobs section */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Open Positions
            </h2>
            <p className="mt-2 text-gray-600">
              Explore opportunities at {companyName}.
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            {jobs.length} {jobs.length === 1 ? "Position" : "Positions"}
          </span>
        </div>

        {jobs.length === 0 ? (
          <div
            data-aos="fade-up"
            className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center"
          >
            <FaBriefcase className="mx-auto text-4xl text-gray-300" />

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              No open positions yet
            </h3>

            <p className="mt-2 text-gray-500">
              This company currently has no available jobs.
            </p>

            <Link
              to="/jobs"
              className="mt-5 inline-flex items-center gap-2 font-medium text-green-700 hover:underline"
            >
              Explore other jobs
              <FaArrowLeft className="rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {jobs.map((job, index) => {
              const jobId = job._id || job.id;
              const jobTitle =
                job.title || job.jobTitle || "Untitled Position";
              const jobType = job.jobType || job.type || "";
              const jobLocation = job.location || companyLocation;
              const salary = job.salaryRange || job.salary || "";
              const experience = job.experience || job.experienceLevel || "";

              return (
                <article
                  key={jobId || `${jobTitle}-${index}`}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(index * 80, 240)}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <FaBriefcase className="text-xl" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-bold text-gray-900">
                        {jobTitle}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {companyName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {jobType && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {jobType}
                      </span>
                    )}

                    {jobLocation && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        <FaMapMarkerAlt />
                        {jobLocation}
                      </span>
                    )}
                  </div>

                  {(salary || experience) && (
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      {salary && (
                        <p>
                          <span className="font-medium text-gray-800">
                            Salary:
                          </span>{" "}
                          {typeof salary === "object"
                            ? JSON.stringify(salary)
                            : salary}
                        </p>
                      )}

                      {experience && (
                        <p>
                          <span className="font-medium text-gray-800">
                            Experience:
                          </span>{" "}
                          {experience}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-6">
                    <Link
                      to={
                        jobId
                          ? `/jobDetails/${jobId}`
                          : "/jobs"
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                    >
                      View Job Details
                      <FaExternalLinkAlt className="text-xs" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default CompanyDetails;
