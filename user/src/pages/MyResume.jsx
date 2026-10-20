import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FiUpload,
  FiFileText,
  FiTrash2,
  FiEye,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { userContext } from "../context/UserContext";
import add_icon from "../assets/add_icon.svg";

const MyResume = () => {
  const { backendUrl, token } = useContext(userContext);

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const fileInputRef = useRef(null);
  const uploadLock = useRef(false);

  // GET USER RESUME
  const getResume = useCallback(async () => {
    if (!token) {
      setResumes([]);
      setLoadingResumes(false);
      return;
    }

    setLoadingResumes(true);

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/resumes/my-resumes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setResumes(data.resumes || []);
      } else {
        toast.error(data.message || "Failed to load resume.");
      }
    } catch (error) {
      console.error("Get Resume Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load your resume."
      );
    } finally {
      setLoadingResumes(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    getResume();
  }, [getResume]);

  // UPLOAD ONLY ONE PDF RESUME
  const handleResumeChange = async (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    // Reset input so the same file can be selected again after an error.
    const resetInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    if (uploadLock.current || uploading) {
      resetInput();
      return;
    }

    if (loadingResumes) {
      toast.info("Please wait while your resume is loading.");
      resetInput();
      return;
    }

    if (!token) {
      toast.error("Please log in before uploading your resume.");
      resetInput();
      return;
    }

    // Frontend limit: only one resume per user.
    if (resumes.length >= 1) {
      toast.error(
        "You can upload only one resume. Delete your current resume first."
      );
      resetInput();
      return;
    }

    // Validate PDF file.
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf || !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed.");
      resetInput();
      return;
    }

    if (file.size === 0) {
      toast.error("The selected PDF file is empty.");
      resetInput();
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("The PDF file must be 5 MB or smaller.");
      resetInput();
      return;
    }

    uploadLock.current = true;
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("title", file.name.replace(/\.pdf$/i, ""));
      formData.append("resume", file);

      const { data } = await axios.post(
        `${backendUrl}/api/resumes/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Resume upload failed.");
      }

      const newResume = data.resume;

      if (!newResume) {
        throw new Error("Resume uploaded, but no resume data was returned.");
      }

      setResumes([newResume]);
      toast.success(data.message || "Resume uploaded successfully.");
    } catch (error) {
      console.error("Upload Resume Error:", error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to upload resume."
      );

      // Refresh server state in case the upload succeeded on the server.
      await getResume();
    } finally {
      uploadLock.current = false;
      setUploading(false);
      resetInput();
    }
  };

  // DELETE RESUME
  const removeResume = async (resumeId) => {
    if (!resumeId || deletingId || uploading) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your resume?"
    );

    if (!confirmed) return;

    setDeletingId(resumeId);

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/resumes/delete`,
        {
          params: { id: resumeId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to delete resume.");
      }

      setResumes((previous) =>
        previous.filter((resume) => resume._id !== resumeId)
      );

      if (selectedResume?._id === resumeId) {
        setSelectedResume(null);
      }

      toast.success(data.message || "Resume deleted successfully.");
    } catch (error) {
      console.error("Delete Resume Error:", error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete resume."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "PDF";

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const hasResume = resumes.length >= 1;
  const uploadDisabled =
    uploading || loadingResumes || hasResume || !token;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          My Resume
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Upload one PDF resume to your account.
        </p>
      </div>

      {/* UPLOAD SECTION */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <img
            src={add_icon}
            alt=""
            className="h-8 w-8 object-contain"
          />

          <div>
            <h2 className="font-semibold text-gray-800">
              Upload your resume
            </h2>

            <p className="text-sm text-gray-500">
              PDF only · Maximum 5 MB · One resume per account
            </p>
          </div>
        </div>

        <label
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 transition ${uploadDisabled
            ? "cursor-not-allowed bg-gray-50 opacity-60"
            : "cursor-pointer hover:border-green-500 hover:bg-green-50/30"
            }`}
        >
          <FiUpload className="mb-3 h-8 w-8 text-gray-500" />

          <span className="text-center font-medium text-gray-700">
            {loadingResumes
              ? "Checking your resume..."
              : uploading
                ? "Uploading resume..."
                : hasResume
                  ? "You already have a resume"
                  : "Choose a PDF file"}
          </span>

          <span className="mt-1 text-center text-sm text-gray-500">
            {hasResume
              ? "Delete your existing resume before uploading another."
              : "Select your resume from your device."}
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={uploadDisabled}
            onChange={handleResumeChange}
          />
        </label>

        {hasResume && (
          <p className="mt-3 text-sm text-amber-700">
            Only one resume is allowed. You must delete the current
            resume before uploading a replacement.
          </p>
        )}
      </div>

      {/* RESUME LIST */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-800">
          Your resume
        </h2>

        {loadingResumes ? (
          <p className="py-6 text-center text-gray-500">
            Loading your resume...
          </p>
        ) : resumes.length === 0 ? (
          <div className="py-8 text-center">
            <FiFileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />

            <p className="font-medium text-gray-700">
              No resume uploaded yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Upload one PDF file to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-lg bg-red-50 p-3">
                    <FiFileText className="h-6 w-6 text-red-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="break-words font-medium text-gray-800">
                      {resume.title || "My Resume"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      PDF · {formatFileSize(resume.size)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedResume(resume)}
                    disabled={!resume.fileUrl || Boolean(deletingId)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiEye />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => removeResume(resume._id)}
                    disabled={Boolean(deletingId) || uploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 />
                    {deletingId === resume._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF PREVIEW MODAL */}
      {selectedResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
          onClick={() => setSelectedResume(null)}
        >
          <div
            className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <h2 className="truncate font-semibold text-gray-800">
                {selectedResume.title || "Resume Preview"}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedResume(null)}
                aria-label="Close preview"
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {selectedResume.fileUrl ? (
              <iframe
                title="Resume PDF Preview"
                src={selectedResume.fileUrl}
                className="min-h-0 flex-1"
                width="100%"
              />
            ) : (
              <p className="p-6 text-center text-gray-500">
                The PDF preview is not available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResume;
