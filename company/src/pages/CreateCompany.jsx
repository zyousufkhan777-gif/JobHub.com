import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { companyContext } from "../context/companyContext";
import { toast } from "react-toastify";
import { FaCloudUploadAlt, FaImage } from "react-icons/fa";

const CreateCompany = () => {
    const { backendUrl, token } = useContext(companyContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");

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
        if (!logo) {
            setLogoPreview("");
            return;
        }

        const previewUrl = URL.createObjectURL(logo);
        setLogoPreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [logo]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Please select a JPG, PNG, or WEBP image.");
            e.target.value = "";
            return;
        }

        // Optional client-side size limit: 5 MB
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Logo must be smaller than 5 MB.");
            e.target.value = "";
            return;
        }

        setLogo(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!backendUrl) {
            toast.error("Backend URL is not configured.");
            return;
        }

        if (!token) {
            toast.error("Please log in first.");
            navigate("/login");
            return;
        }

        if (!logo) {
            toast.error("Please upload your company logo.");
            return;
        }

        try {
            setLoading(true);

            const dataToSend = new FormData();

            dataToSend.append("logo", logo);
            dataToSend.append("companyName", formData.companyName.trim());
            dataToSend.append("description", formData.description.trim());

            // Website is optional in the backend.
            dataToSend.append("website", formData.website.trim());

            dataToSend.append("location", formData.location.trim());
            dataToSend.append("industry", formData.industry);
            dataToSend.append("companySize", formData.companySize);
            dataToSend.append("foundedYear", formData.foundedYear);

            const response = await axios.post(
                `${backendUrl}/api/companies/create`,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data.success) {
                toast.error(
                    response.data.message || "Could not create company."
                );
                return;
            }

            toast.success(
                response.data.message || "Company created successfully!"
            );

            navigate("/dashboard");
        } catch (error) {
            console.error("Create Company Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-50";

    const labelClass = "text-sm font-semibold text-gray-700";

    return (
        <section className="min-h-screen bg-slate-100 px-4 py-10">
            <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl sm:p-10">
                {/* Header */}
                <div className="mb-8 space-y-3 text-center">
                    <h1 className="text-4xl font-extrabold text-green-600">
                        JobHub
                    </h1>

                    <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                        Create Your Company
                    </h2>

                    <p className="text-sm leading-6 text-gray-500 sm:text-base">
                        Tell us about your company and start finding great talent.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Logo */}
                    <div className="flex flex-col gap-3">
                        <label htmlFor="logo" className={labelClass}>
                            Company Logo
                        </label>

                        <label
                            htmlFor="logo"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 transition hover:border-green-500 hover:bg-green-50"
                        >
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Company logo preview"
                                    className="h-28 w-28 rounded-xl border bg-white object-contain p-2"
                                />
                            ) : (
                                <>
                                    <FaCloudUploadAlt className="text-4xl text-green-600" />

                                    <span className="mt-3 font-semibold text-gray-700">
                                        Click to upload your logo
                                    </span>

                                    <span className="mt-1 text-xs text-gray-400">
                                        JPG, PNG, or WEBP — maximum 5 MB
                                    </span>
                                </>
                            )}

                            {logo && (
                                <span className="mt-3 max-w-full break-all text-sm text-green-700">
                                    {logo.name}
                                </span>
                            )}
                        </label>

                        <input
                            id="logo"
                            name="logo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleLogoChange}
                            className="sr-only"
                        />

                        {logoPreview && (
                            <button
                                type="button"
                                onClick={() => setLogo(null)}
                                className="self-start text-sm font-medium text-red-500 hover:text-red-600"
                            >
                                Remove logo
                            </button>
                        )}
                    </div>

                    {/* Company Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="companyName" className={labelClass}>
                            Company Name
                        </label>

                        <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            className={inputClass}
                            required
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className={labelClass}>
                            Company Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your company..."
                            rows={4}
                            className={`${inputClass} resize-y`}
                            required
                            maxLength={2000}
                        />
                    </div>

                    {/* Website: optional */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="website" className={labelClass}>
                            Company Website (Optional)
                        </label>

                        <input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className={inputClass}
                        />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="location" className={labelClass}>
                            Company Location
                        </label>

                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. São Paulo, Brazil"
                            className={inputClass}
                            required
                        />
                    </div>

                    {/* Industry and Company Size */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="industry" className={labelClass}>
                                Industry
                            </label>

                            <select
                                id="industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            >
                                <option value="">Select industry</option>
                                <option value="Technology">Technology</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Finance">Finance</option>
                                <option value="Retail">Retail</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="companySize" className={labelClass}>
                                Company Size
                            </label>

                            <select
                                id="companySize"
                                name="companySize"
                                value={formData.companySize}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            >
                                <option value="">Select company size</option>
                                <option value="1-10">1–10 employees</option>
                                <option value="11-50">11–50 employees</option>
                                <option value="51-200">51–200 employees</option>
                                <option value="201-500">201–500 employees</option>
                                <option value="501-1000">501–1000 employees</option>
                                <option value="1000+">1000+ employees</option>
                            </select>
                        </div>
                    </div>

                    {/* Founded Year */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="foundedYear" className={labelClass}>
                            Founded Year
                        </label>

                        <input
                            id="foundedYear"
                            name="foundedYear"
                            type="number"
                            min="1800"
                            max={new Date().getFullYear()}
                            step="1"
                            value={formData.foundedYear}
                            onChange={handleChange}
                            placeholder="e.g. 2020"
                            className={inputClass}
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 font-bold text-white shadow-lg shadow-green-100 transition hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaImage />

                        {loading ? "Creating Company..." : "Create Company"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default CreateCompany;
