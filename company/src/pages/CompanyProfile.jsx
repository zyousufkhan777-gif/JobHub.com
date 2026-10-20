import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { companyContext } from "../context/companyContext";

const CompanyProfile = () => {
  const {
    companyInfo,
    setCompanyInfo,
    getCompany,
    loadingCompany,
    backendUrl,
    token,
  } = useContext(companyContext);

  const fileInputRef = useRef(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    location: "",
    industry: "",
    companySize: "",
    foundedYear: "",
  });

  useEffect(() => {
    if (token) {
      getCompany();
    }
  }, [token, getCompany]);

  useEffect(() => {
    if (!companyInfo) return;

    setFormData({
      companyName: companyInfo.companyName || "",
      description: companyInfo.description || "",
      website: companyInfo.website || "",
      location: companyInfo.location || "",
      industry: companyInfo.industry || "",
      companySize: companyInfo.companySize || "",
      foundedYear: companyInfo.foundedYear ?? "",
    });

    setLogoPreview(companyInfo.logo || "");
  }, [companyInfo]);

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    if (!backendUrl) {
      toast.error("Backend URL is not configured.");
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      if (logoFile) {
        form.append("logo", logoFile);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/companies/profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(
          data.message || "Failed to update company profile."
        );
        return;
      }

      await getCompany();

      setLogoFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(
        data.message || "Company profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Update Company Error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to update company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6">
        Please log in to access your company profile.
      </div>
    );
  }

  if (loadingCompany && !companyInfo) {
    return (
      <div className="p-6">
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Company Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        {/* Company Logo */}
        <div>
          <label className="mb-3 block font-semibold">
            Company Logo
          </label>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border bg-gray-50">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">
                  No Logo
                </span>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                id="companyLogo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />

              <label
                htmlFor="companyLogo"
                className="inline-block cursor-pointer rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
              >
                Choose Logo
              </label>

              <p className="mt-2 text-sm text-gray-500">
                JPG, PNG, or WEBP. Maximum size: 5 MB.
              </p>

              {logoFile && (
                <p className="mt-1 text-sm text-green-700">
                  Selected: {logoFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label
            htmlFor="companyName"
            className="mb-1 block font-medium"
          >
            Company Name
          </label>

          <input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
            placeholder="Enter company name"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1 block font-medium"
          >
            Company Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border p-3"
            placeholder="Describe your company..."
          />
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className="mb-1 block font-medium"
          >
            Website
          </label>

          <input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="https://example.com"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="mb-1 block font-medium"
          >
            Location
          </label>

          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="City, State, Country"
          />
        </div>

        {/* Industry */}
        <div>
          <label
            htmlFor="industry"
            className="mb-1 block font-medium"
          >
            Industry
          </label>

          <input
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="Technology, Education, Healthcare..."
          />
        </div>

        {/* Company Size */}
        <div>
          <label
            htmlFor="companySize"
            className="mb-1 block font-medium"
          >
            Company Size
          </label>

          <select
            id="companySize"
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          >
            <option value="">Select company size</option>
            <option value="1-10">1–10 employees</option>
            <option value="11-50">11–50 employees</option>
            <option value="51-200">51–200 employees</option>
            <option value="201-500">201–500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>

        {/* Founded Year */}
        <div>
          <label
            htmlFor="foundedYear"
            className="mb-1 block font-medium"
          >
            Founded Year
          </label>

          <input
            id="foundedYear"
            name="foundedYear"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={formData.foundedYear}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="2020"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default CompanyProfile;
