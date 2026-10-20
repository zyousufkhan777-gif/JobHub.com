
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "react-toastify";

import { userContext } from "../context/UserContext";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(userContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumesLoading, setResumesLoading] = useState(false);

  const baseUrl = backendUrl?.replace(/\/+$/, "");

  // Initialize animations
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
    });
  }, []);

  // Fetch job details from backend
  useEffect(() => {
    let cancelled = false;

    const fetchJobDetails = async () => {
      if (!baseUrl || !id) {
        setError("Backend URL or job ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setJob(null);

      try {
        const { data } = await axios.get(
          `${baseUrl}/api/users/getjobs/${id}`
        );

        if (!data.success || !data.job) {
          throw new Error(data.message || "Job not found.");
        }

        if (!cancelled) {
          setJob(data.job);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Fetch Job Details Error:",
            err.response?.data || err.message
          );

          setError(
            err.response?.data?.message ||
            err.message ||
            "Failed to fetch job details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchJobDetails();

    return () => {
      cancelled = true;
    };
  }, [baseUrl, id]);

  // Check whether this job is already saved
  useEffect(() => {
    let cancelled = false;

    const checkSavedStatus = async () => {
      if (!baseUrl || !id || !token) {
        setIsSaved(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${baseUrl}/api/saved-jobs/${id}/check`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled && data.success) {
          setIsSaved(Boolean(data.isSaved));
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Check Saved Job Error:",
            err.response?.data || err.message
          );
        }
      }
    };

    checkSavedStatus();

    return () => {
      cancelled = true;
    };
  }, [baseUrl, id, token]);

  // Save or remove a saved job
  const handleSaveJob = useCallback(async () => {
    if (!token) {
      toast.info("Please log in to save this job.");
      navigate("/login");
      return;
    }

    if (!baseUrl || !id || saving) {
      return;
    }

    setSaving(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isSaved) {
        const { data } = await axios.delete(
          `${baseUrl}/api/saved-jobs/remove-saved-job/${id}`,
          config
        );

        if (data.success) {
          setIsSaved(false);
          toast.success("Job removed from saved jobs.");
        }
      } else {
        const { data } = await axios.post(
          `${baseUrl}/api/saved-jobs/add-saved-job`,
          { jobId: id },
          config
        );

        if (data.success) {
          setIsSaved(true);
          toast.success("Job saved successfully!");
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message || "Failed to update saved job.";

      console.error(
        "Save Job Error:",
        err.response?.data || err.message
      );

      if (
        status === 400 &&
        message.toLowerCase().includes("already saved")
      ) {
        setIsSaved(true);
        toast.info("This job is already saved.");
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  }, [baseUrl, id, token, saving, isSaved, navigate]);

  // Load the current user's resumes before applying.
  const handleOpenApply = useCallback(async () => {
    if (!token) {
      toast.info("Please log in to apply for this job.");
      navigate("/login");
      return;
    }
    if (!baseUrl || !id || applying || resumesLoading) return;

    setResumesLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/api/resumes/my-resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resumeList = Array.isArray(data.resumes)
        ? data.resumes
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      setResumes(resumeList);
      if (resumeList.length === 0) {
        toast.info("You need to upload a resume before applying.");
        navigate("/resumes");
        return;
      }

      setSelectedResumeId((current) => {
        if (current && resumeList.some((resume) => String(resume._id || resume.id) === current)) return current;
        return String(resumeList[0]._id || resumeList[0].id || "");
      });
      setShowResumeModal(true);
    } catch (err) {
      console.error("Fetch Resumes Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Could not load your resumes. Check the resumes API route.");
    } finally {
      setResumesLoading(false);
    }
  }, [baseUrl, id, token, applying, resumesLoading, navigate]);

  // Submit the application using the selected resume's real database ID.
  const handleSubmitApplication = useCallback(async () => {
    if (!token) {
      toast.info("Please log in to apply for this job.");
      navigate("/login");
      return;
    }
    if (!baseUrl || !id || !selectedResumeId || applying) {
      toast.error("Please select a resume first.");
      return;
    }

    setApplying(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/applications/create`,
        { jobId: id, resumeId: selectedResumeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message || "Application submitted successfully!");
        setShowResumeModal(false);
      } else {
        toast.error(data.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Submit Application Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  }, [baseUrl, id, selectedResumeId, token, applying, navigate]);

  // Loading state
  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-5">
        <p className="text-gray-500">Loading job details...</p>
      </section>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Job Not Found
          </h1>

          <p className="mt-2 break-words text-gray-500">
            {error || "The job you are looking for does not exist."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="mt-5 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Back to Jobs
          </button>
        </div>
      </section>
    );
  }

  // Company information
  const companyName =
    job.company && typeof job.company === "object"
      ? job.company.name || "Company"
      : "Company";

  const companyLogo =
    job.company && typeof job.company === "object"
      ? job.company.logo
      : null;

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString()
    : "Recently posted";

  const deadlineDate = job.deadline
    ? new Date(job.deadline).toLocaleDateString()
    : null;

  return (
    <section className="w-full bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-gray-500 transition hover:text-green-600"
        >
          ← Back to Jobs
        </button>

        {/* Job header */}
        <div
          data-aos="fade-up"
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="h-16 w-16 shrink-0 rounded-2xl border border-gray-100 object-contain p-2 sm:h-20 sm:w-20"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl font-bold text-green-600 sm:h-20 sm:w-20">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                  {job.title}
                </h1>

                <p className="mt-2 font-medium text-gray-500">
                  {companyName}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  📍 {job.location || "Location not specified"}
                </p>

                {job.category && (
                  <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {job.category}
                  </span>
                )}
              </div>
            </div>

            {/* Save and apply buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveJob}
                disabled={saving}
                aria-pressed={isSaved}
                className={`rounded-xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${isSaved
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-green-600 hover:text-green-600"
                  }`}
              >
                {saving
                  ? "Please wait..."
                  : isSaved
                    ? "✓ Saved"
                    : "♡ Save Job"}
              </button>

              <button
                type="button"
                onClick={handleOpenApply}
                disabled={resumesLoading || applying}
                className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resumesLoading ? "Loading resumes..." : "Apply Now"}
              </button>
            </div>
          </div>

          {/* Job information badges */}
          <div className="mt-8 flex flex-wrap gap-3">
            {job.jobType && (
              <span className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                💼 {job.jobType}
              </span>
            )}

            {job.workMode && (
              <span className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                🏢 {job.workMode}
              </span>
            )}

            {job.experience && (
              <span className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                🎯 {job.experience}
              </span>
            )}

            {job.salary && (
              <span className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                💰 {job.salary}
              </span>
            )}

            <span className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              🕒 Posted: {postedDate}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Job description and skills */}
          <div className="space-y-6 lg:col-span-2">
            <div
              data-aos="fade-right"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-bold text-gray-900">
                Job Description
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {job.description || "No description provided."}
              </p>
            </div>

            {Array.isArray(job.skills) && job.skills.length > 0 && (
              <div
                data-aos="fade-right"
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  Required Skills
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job overview sidebar */}
          <aside className="space-y-6">
            <div
              data-aos="fade-left"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-900">
                Job Overview
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Company
                  </p>
                  <p className="mt-1 break-words font-medium text-gray-700">
                    {companyName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Location
                  </p>
                  <p className="mt-1 font-medium text-gray-700">
                    {job.location || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Job Type
                  </p>
                  <p className="mt-1 font-medium text-gray-700">
                    {job.jobType || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Work Mode
                  </p>
                  <p className="mt-1 font-medium text-gray-700">
                    {job.workMode || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Experience
                  </p>
                  <p className="mt-1 font-medium text-gray-700">
                    {job.experience || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Salary
                  </p>
                  <p className="mt-1 font-medium text-green-600">
                    {job.salary || "Not specified"}
                  </p>
                </div>

                {deadlineDate && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      Application Deadline
                    </p>
                    <p className="mt-1 font-medium text-gray-700">
                      {deadlineDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Save job sidebar card */}
            <div className="rounded-3xl bg-green-600 p-6 text-white shadow-sm">
              <h2 className="text-lg font-bold">
                Interested in this job?
              </h2>

              <p className="mt-2 text-sm leading-6 text-green-50">
                Save this opportunity to find it easily later.
              </p>

              <button
                type="button"
                onClick={handleSaveJob}
                disabled={saving}
                className="mt-5 w-full rounded-xl bg-white px-5 py-3 font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Please wait..."
                  : isSaved
                    ? "✓ Remove Saved Job"
                    : "♡ Save Job"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {showResumeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget && !applying) setShowResumeModal(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="resume-modal-title" className="text-xl font-bold text-gray-900">Select your resume</h2>
            <p className="mt-2 text-sm text-gray-500">Choose the resume to send with your application.</p>

            <div className="mt-5 max-h-64 space-y-3 overflow-y-auto">
              {resumes.map((resume, index) => {
                const resumeId = String(resume._id || resume.id || "");
                const resumeName = resume.title || resume.name || resume.fileName || resume.originalName || `Resume ${index + 1}`;
                return (
                  <label
                    key={resumeId || index}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${selectedResumeId === resumeId ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="selectedResume"
                      value={resumeId}
                      checked={selectedResumeId === resumeId}
                      onChange={() => setSelectedResumeId(resumeId)}
                      disabled={!resumeId || applying}
                      className="accent-green-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block break-words font-medium text-gray-800">{resumeName}</span>
                      {resume.createdAt && (
                        <span className="mt-1 block text-xs text-gray-500">
                          Added {new Date(resume.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                disabled={applying}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >Cancel</button>
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={!selectedResumeId || applying}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >{applying ? "Submitting..." : "Submit Application"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default JobDetails;
