
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaClipboardList } from "react-icons/fa";
import { toast } from "react-toastify";

import upload_area from "../assets/upload_area.png";
import { userContext } from "../context/UserContext.jsx";

const PROFILE_PATH = "/api/auth/me";
const UPDATE_PROFILE_PATH = "/api/users/updateprofile";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const emptyProfile = {
  name: "",
  professionalTitle: "",
  email: "",
  phone: "",
  location: "",
  skills: "",
  education: "",
  experience: "",
  profilePhoto: "",
};

const normalizeProfile = (apiUser = {}) => ({
  ...emptyProfile,
  ...apiUser,
  name: apiUser.name || "",
  professionalTitle: apiUser.professionalTitle || "",
  email: apiUser.email || "",
  phone: apiUser.phone || "",
  location: apiUser.location || "",
  skills: Array.isArray(apiUser.skills)
    ? apiUser.skills.join(", ")
    : apiUser.skills || "",
  education: apiUser.education || "",
  experience: apiUser.experience || "",
  profilePhoto: apiUser.profilePhoto || "",
});

const Profile = () => {
  const navigate = useNavigate();
  const context = useContext(userContext);

  if (!context) {
    throw new Error(
      "Profile must be rendered inside UserContextProvider."
    );
  }

  const { backendUrl, token, setUser } = context;

  const [profile, setProfile] = useState(emptyProfile);
  const [formData, setFormData] = useState(emptyProfile);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const baseUrl = backendUrl?.replace(/\/+$/, "");

  // Match this header to your backend authMiddleware.
  const getAuthHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // Fetch profile information.
  const getProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (!baseUrl) {
      toast.error("Backend URL is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data } = await axios.get(
        `${baseUrl}${PROFILE_PATH}`,
        { headers: getAuthHeaders() }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Could not load your profile."
        );
      }

      const apiUser = data.user || data;
      const normalized = normalizeProfile(apiUser);

      setProfile(normalized);
      setFormData(normalized);
      setImagePreview(normalized.profilePhoto);
      setUser(apiUser);
    } catch (error) {
      console.error(
        "Get profile error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Could not load your profile."
      );
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, getAuthHeaders, token, setUser]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Update a form field.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Enter edit mode.
  const handleEdit = () => {
    setFormData({ ...profile });
    setImageFile(null);
    setImagePreview(profile.profilePhoto);
    setIsEdit(true);
  };

  // Cancel edits.
  const handleCancel = () => {
    setFormData({ ...profile });
    setImageFile(null);
    setImagePreview(profile.profilePhoto);
    setIsEdit(false);
  };

  // Select and preview a profile image.
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be 2 MB or smaller.");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };

    reader.onerror = () => {
      toast.error("Could not preview this image.");
    };

    reader.readAsDataURL(file);
  };

  // Save profile changes.
  const handleSave = async (event) => {
    event?.preventDefault();

    if (isSaving) return;

    if (!token) {
      toast.error("Please log in to update your profile.");
      navigate("/login");
      return;
    }

    if (!baseUrl) {
      toast.error("Backend URL is not configured.");
      return;
    }

    const requiredFields = [
      "name",
      "phone",
      "location",
      "skills",
      "education",
      "experience",
    ];

    const hasMissingField = requiredFields.some(
      (field) => !String(formData[field] || "").trim()
    );

    if (hasMissingField) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("professionalTitle", formData.professionalTitle.trim());
      payload.append("phone", formData.phone.trim());
      payload.append("location", formData.location.trim());
      payload.append("skills", formData.skills.trim());
      payload.append("education", formData.education.trim());
      payload.append("experience", formData.experience.trim());

      // Must match upload.single("profilePhoto") in backend.
      if (imageFile) {
        payload.append("profilePhoto", imageFile);
      }

      const { data } = await axios.post(
        `${baseUrl}${UPDATE_PROFILE_PATH}`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Profile update failed."
        );
      }

      const updatedUser = data.user || {
        ...profile,
        ...formData,
        profilePhoto: imagePreview,
      };

      const normalized = normalizeProfile(updatedUser);

      setProfile(normalized);
      setFormData(normalized);
      setImagePreview(normalized.profilePhoto);
      setImageFile(null);
      setIsEdit(false);
      setUser(updatedUser);

      toast.success(
        data.message || "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Could not update your profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <h1 className="text-xl font-bold text-gray-800">
          Please log in to view your profile.
        </h1>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const displayedImage = imagePreview || upload_area;

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Profile header */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-green-900 via-green-700 to-green-500" />

          <div className="px-5 pb-8 sm:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end">
              <div className="-mt-16 shrink-0">
                <label
                  htmlFor={isEdit ? "profile-image" : undefined}
                  className={`relative block h-32 w-32 ${isEdit ? "cursor-pointer" : ""
                    }`}
                >
                  <img
                    src={displayedImage}
                    alt="Profile"
                    className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                  />

                  {isEdit && (
                    <>
                      <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-xl text-white shadow">
                        ✎
                      </span>

                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </>
                  )}
                </label>

                {isEdit && (
                  <p className="mt-2 text-xs text-gray-500">
                    Image max 2 MB
                  </p>
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                  {profile.name || "Your Name"}
                </h1>

                <p className="mt-1 text-lg font-medium text-green-600">
                  {profile.professionalTitle || "Add your professional title"}
                </p>

                <p className="mt-2 break-words text-sm text-gray-500">
                  📍 {profile.location || "Location not added"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pb-1">
                {isEdit ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-xl border border-green-600 px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile information */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <form
              onSubmit={handleSave}
              className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h2>

                <button
                  type="button"
                  onClick={isEdit ? handleSave : handleEdit}
                  disabled={isSaving}
                  className="text-sm font-semibold text-green-700 hover:text-green-800"
                >
                  {isEdit ? "Save" : "Edit"}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm text-gray-500">
                    Full Name
                  </label>

                  {isEdit ? (
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                    />
                  ) : (
                    <p className="mt-2 break-words font-medium text-gray-800">
                      {profile.name || "Not added"}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="professionalTitle"
                    className="text-sm text-gray-500"
                  >
                    Professional Title
                  </label>

                  {isEdit ? (
                    <input
                      id="professionalTitle"
                      name="professionalTitle"
                      type="text"
                      value={formData.professionalTitle}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="e.g. Junior Full-Stack Developer"
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                    />
                  ) : (
                    <p className="mt-2 break-words font-medium text-gray-800">
                      {profile.professionalTitle || "Not added"}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="text-sm text-gray-500">
                    Email
                  </label>

                  <p
                    id="email"
                    className="mt-2 break-words font-medium text-gray-800"
                  >
                    {profile.email || "Not available"}
                  </p>
                </div>

                <div>
                  <label htmlFor="phone" className="text-sm text-gray-500">
                    Phone
                  </label>

                  {isEdit ? (
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                    />
                  ) : (
                    <p className="mt-2 break-words font-medium text-gray-800">
                      {profile.phone || "Not added"}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="text-sm text-gray-500">
                    Location
                  </label>

                  {isEdit ? (
                    <input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                    />
                  ) : (
                    <p className="mt-2 break-words font-medium text-gray-800">
                      {profile.location || "Not added"}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="education" className="text-sm text-gray-500">
                    Education
                  </label>

                  {isEdit ? (
                    <input
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                    />
                  ) : (
                    <p className="mt-2 break-words font-medium text-gray-800">
                      {profile.education || "Not added"}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="skills" className="text-sm text-gray-500">
                    Skills
                  </label>

                  {isEdit ? (
                    <input
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, MongoDB"
                      required
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                    />
                  ) : (
                    <p className="mt-2 break-words font-medium text-gray-800">
                      {profile.skills || "Not added"}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="experience" className="text-sm text-gray-500">
                    Experience / Projects
                  </label>

                  {isEdit ? (
                    <textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={4}
                      required
                      placeholder="Describe your experience or projects"
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
                    />
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-gray-700">
                      {profile.experience || "Not added"}
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* About / Experience */}
            <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-gray-900">
                About / Experience
              </h2>

              <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-gray-600">
                {profile.experience ||
                  "Add your experience or projects above."}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                My Resume
              </h2>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
                    📄
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      My Resume
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF Resume
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => goTo("/my-resume")}
                className="mt-4 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
              >
                Upload Resume
              </button>
            </div>

            <nav
              aria-label="Profile navigation"
              className="rounded-2xl bg-white p-3 shadow-sm"
            >
              <button
                type="button"
                onClick={() => goTo("/profile")}
                className="flex w-full items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-left font-semibold text-green-700"
              >
                👤 <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => goTo("/saved")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-600 hover:bg-gray-50"
              >
                ❤️ <span>Saved Jobs</span>
              </button>

              <button
                type="button"
                onClick={() => goTo("/my-resume")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-600 hover:bg-gray-50"
              >
                📄 <span>My Resume</span>
              </button>

              <button
                type="button"
                onClick={() => goTo("/applications")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-600 hover:bg-gray-50"
              >
                <FaClipboardList className="text-green-600" />
                <span>My Applications</span>
              </button>
            </nav>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Profile;
