import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
    FiBriefcase,
    FiMapPin,
    FiDollarSign,
    FiCalendar,
    FiPlus,
    FiArrowLeft,
} from "react-icons/fi";

import { companyContext } from "../context/companyContext";

const initialForm = {
    title: "",
    description: "",
    category: "",
    location: "",
    jobType: "Full-time",
    workMode: "On-site",
    salary: "",
    skills: "",
    experience: "",
    deadline: "",
};

const PostJob = () => {
    const {
        backendUrl,
        token,
        getallJob,
    } = useContext(companyContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!token) {
            toast.error("Please log in as a company first.");
            return;
        }

        const requiredFields = [
            "title",
            "description",
            "category",
            "location",
            "jobType",
            "workMode",
            "experience",
        ];

        const missingField = requiredFields.find(
            (field) => !String(formData[field]).trim()
        );

        if (missingField) {
            toast.error("Please complete all required fields.");
            return;
        }

        const payload = {
            ...formData,

            // Send skills as an array of strings.
            skills: formData.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean),

            // Send an empty salary as null.
            salary: formData.salary.trim()
                ? Number(formData.salary)
                : null,

            // Send an empty deadline as null.
            deadline: formData.deadline || null,
        };

        if (
            payload.salary !== null &&
            (!Number.isFinite(payload.salary) ||
                payload.salary < 0)
        ) {
            toast.error("Please enter a valid salary.");
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/jobs/create`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 15000,
                }
            );

            if (data.success) {
                toast.success(
                    data.message || "Job posted successfully!"
                );

                setFormData(initialForm);

                // Refresh the company's job list.
                await getallJob();

                navigate("/manage-jobs");
            } else {
                toast.error(
                    data.message || "Failed to post job."
                );
            }
        } catch (error) {
            console.error(
                "Create Job Error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to post job. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

    const labelClass =
        "text-sm font-semibold text-slate-700";

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate("/manage-jobs")}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
                        >
                            <FiArrowLeft size={17} />
                            Back to Manage Jobs
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                                <FiBriefcase size={25} />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    Post a Job
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Find the right candidate for your team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                        <h2 className="font-bold text-slate-900">
                            Job Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Fields marked with * are required.
                        </p>
                    </div>

                    <div className="space-y-6 p-6 sm:p-8">

                        {/* Job Title */}
                        <div>
                            <label
                                htmlFor="title"
                                className={labelClass}
                            >
                                Job Title *
                            </label>

                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Junior React Developer"
                                className={inputClass}
                                required
                                maxLength={150}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="description"
                                className={labelClass}
                            >
                                Job Description *
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the responsibilities and requirements..."
                                className={`${inputClass} min-h-40 resize-y`}
                                rows={6}
                                required
                                maxLength={10000}
                            />
                        </div>

                        {/* Category and Location */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="category"
                                    className={labelClass}
                                >
                                    Category *
                                </label>

                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">
                                        Select a category
                                    </option>
                                    <option value="Technology">
                                        Technology
                                    </option>
                                    <option value="Design">
                                        Design
                                    </option>
                                    <option value="Marketing">
                                        Marketing
                                    </option>
                                    <option value="Finance">
                                        Finance
                                    </option>
                                    <option value="Sales">
                                        Sales
                                    </option>
                                    <option value="Human Resources">
                                        Human Resources
                                    </option>
                                    <option value="Customer Service">
                                        Customer Service
                                    </option>
                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="location"
                                    className={labelClass}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <FiMapPin size={16} />
                                        Location *
                                    </span>
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
                        </div>

                        {/* Job Type and Work Mode */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="jobType"
                                    className={labelClass}
                                >
                                    Job Type *
                                </label>

                                <select
                                    id="jobType"
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="Full-time">
                                        Full-time
                                    </option>
                                    <option value="Part-time">
                                        Part-time
                                    </option>
                                    <option value="Internship">
                                        Internship
                                    </option>
                                    <option value="Contract">
                                        Contract
                                    </option>
                                    <option value="Freelance">
                                        Freelance
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="workMode"
                                    className={labelClass}
                                >
                                    Work Mode *
                                </label>

                                <select
                                    id="workMode"
                                    name="workMode"
                                    value={formData.workMode}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="On-site">
                                        On-site
                                    </option>
                                    <option value="Remote">
                                        Remote
                                    </option>
                                    <option value="Hybrid">
                                        Hybrid
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Salary and Experience */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="salary"
                                    className={labelClass}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <FiDollarSign size={16} />
                                        Salary
                                    </span>
                                </label>

                                <input
                                    id="salary"
                                    name="salary"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. 3500"
                                    className={inputClass}
                                />

                                <p className="mt-1 text-xs text-slate-400">
                                    Enter the salary amount in your chosen currency.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="experience"
                                    className={labelClass}
                                >
                                    Experience *
                                </label>

                                <select
                                    id="experience"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">
                                        Select experience
                                    </option>
                                    <option value="No experience">
                                        No experience
                                    </option>
                                    <option value="Entry level">
                                        Entry level
                                    </option>
                                    <option value="1-2 years">
                                        1–2 years
                                    </option>
                                    <option value="3-5 years">
                                        3–5 years
                                    </option>
                                    <option value="5+ years">
                                        5+ years
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <label
                                htmlFor="skills"
                                className={labelClass}
                            >
                                Required Skills
                            </label>

                            <input
                                id="skills"
                                name="skills"
                                type="text"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="React, JavaScript, Node.js"
                                className={inputClass}
                            />

                            <p className="mt-1 text-xs text-slate-400">
                                Separate skills with commas.
                            </p>
                        </div>

                        {/* Application Deadline */}
                        <div>
                            <label
                                htmlFor="deadline"
                                className={labelClass}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiCalendar size={16} />
                                    Application Deadline
                                </span>
                            </label>

                            <input
                                id="deadline"
                                name="deadline"
                                type="date"
                                min={
                                    new Date().toLocaleDateString(
                                        "en-CA"
                                    )
                                }
                                value={formData.deadline}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                        <button
                            type="button"
                            onClick={() => navigate("/manage-jobs")}
                            disabled={loading}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FiPlus size={18} />

                            {loading
                                ? "Posting Job..."
                                : "Publish Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;