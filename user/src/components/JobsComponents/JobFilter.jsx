
import { useState } from "react";
import axios from "axios";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { FaRegSquareCheck } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";

const filters = {
  jobType: [
    ["Full Time", "Full-time"],
    ["Part Time", "Part-time"],
    ["Internship", "Internship"],
    ["Contract", "Contract"],
    ["Freelance", "Freelance"],
  ],
  experience: [
    ["Entry Level", "Entry Level"],
    ["Mid Level", "Mid Level"],
    ["Senior Level", "Senior Level"],
  ],
  salary: [
    ["$0 - $50K", "0-50K"],
    ["$50K - $100K", "50K-100K"],
    ["$100K - $150K", "100K-150K"],
    ["$150K+", "150K+"],
  ],
  location: [
    ["New York", "New York"],
    ["San Francisco", "San Francisco"],
    ["Los Angeles", "Los Angeles"],
    ["Chicago", "Chicago"],
    ["Remote", "Remote"],
  ],
};

const FilterSection = ({
  title,
  filterKey,
  items,
  selected,
  onSelect,
  disabled,
}) => (
  <div className="mt-7">
    <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-green-600">
      {title}
    </h2>

    <div className="space-y-1">
      {items.map(([name, value]) => {
        const checked = selected === value;

        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            aria-pressed={checked}
            onClick={() => onSelect(filterKey, value)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition disabled:cursor-wait disabled:opacity-50 ${checked
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            {checked ? (
              <FaRegSquareCheck className="shrink-0 text-lg text-green-600" />
            ) : (
              <MdOutlineRadioButtonUnchecked className="shrink-0 text-lg text-gray-400" />
            )}

            <span className="text-sm font-medium">{name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const JobFilter = ({ onFilterResults, onFilterError }) => {
  const [selected, setSelected] = useState({
    jobType: "",
    experience: "",
    salary: "",
    location: "",
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = (
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");

  const fetchJobs = async (nextSelected) => {
    setLoading(true);
    setError("");
    onFilterError?.("");

    try {
      const params = {};

      if (nextSelected.jobType) {
        params.jobType = nextSelected.jobType;
      }

      if (nextSelected.experience) {
        params.experience = nextSelected.experience;
      }

      if (nextSelected.salary) {
        params.salaryRange = nextSelected.salary;
      }

      if (nextSelected.location) {
        params.location = nextSelected.location;
      }

      const { data } = await axios.get(
        `${backendUrl}/api/jobs/filter`,
        { params }
      );

      if (data?.success !== true) {
        throw new Error(data?.message || "Failed to filter jobs.");
      }

      onFilterResults?.(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load filtered jobs.";

      setError(message);
      onFilterError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (filterKey, value) => {
    const nextSelected = {
      ...selected,
      [filterKey]: selected[filterKey] === value ? "" : value,
    };

    setSelected(nextSelected);
    fetchJobs(nextSelected);
  };

  const clearAll = () => {
    const emptyFilters = {
      jobType: "",
      experience: "",
      salary: "",
      location: "",
    };

    setSelected(emptyFilters);
    fetchJobs(emptyFilters);
  };

  return (
    <aside className="w-full min-w-0">
      <button
        type="button"
        onClick={() => setFilterOpen((open) => !open)}
        aria-expanded={filterOpen}
        className="mb-4 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 md:hidden"
      >
        <IoFilter className="text-xl" />
        Filters
      </button>

      <div
        className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-lg md:sticky md:top-24 md:p-6 ${filterOpen ? "block" : "hidden md:block"
          }`}
      >
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            Filter Jobs
          </h1>

          <button
            type="button"
            onClick={clearAll}
            disabled={loading}
            className="text-sm font-medium text-gray-500 hover:text-green-600 disabled:opacity-50"
          >
            Clear all
          </button>
        </div>

        {loading && (
          <p className="mt-3 text-sm text-gray-500" role="status">
            Updating jobs...
          </p>
        )}

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchJobs(selected)}
              disabled={loading}
              className="mt-2 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        <FilterSection
          title="Job Type"
          filterKey="jobType"
          items={filters.jobType}
          selected={selected.jobType}
          onSelect={handleSelect}
          disabled={loading}
        />

        <FilterSection
          title="Experience Level"
          filterKey="experience"
          items={filters.experience}
          selected={selected.experience}
          onSelect={handleSelect}
          disabled={loading}
        />

        <FilterSection
          title="Salary Range"
          filterKey="salary"
          items={filters.salary}
          selected={selected.salary}
          onSelect={handleSelect}
          disabled={loading}
        />

        <FilterSection
          title="Location"
          filterKey="location"
          items={filters.location}
          selected={selected.location}
          onSelect={handleSelect}
          disabled={loading}
        />
      </div>
    </aside>
  );
};

export default JobFilter;
