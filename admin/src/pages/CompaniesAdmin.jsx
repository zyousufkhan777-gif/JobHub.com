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
  Building2,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Phone,
  AlertCircle,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";

import { adminContext } from "../context/AdminContext";

const CompaniesAdmin = () => {
  const { backendUrl, token } = useContext(adminContext);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Get all companies
  const fetchCompanies = useCallback(async () => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${backendUrl}/api/admin/allCompanies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to fetch companies."
        );
      }

      setCompanies(
        Array.isArray(response.data.companies)
          ? response.data.companies
          : []
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch companies.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Search companies
  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return companies;

    return companies.filter((company) => {
      const searchableValues = [
        company.name,
        company.companyName,
        company.email,
        company.location,
        company.address,
        company.website,
        company._id,
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [companies, search]);

  // Get company details
  const handleViewDetails = async (companyId) => {
    if (!companyId) {
      toast.error("Company ID is missing.");
      return;
    }

    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    setSelectedCompany(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/admin/company/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success || !response.data?.company) {
        throw new Error(
          response.data?.message ||
          "Failed to fetch company details."
        );
      }

      setSelectedCompany(response.data.company);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch company details.";

      setDetailsError(message);
      toast.error(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close company details modal
  const closeDetails = () => {
    setSelectedCompany(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

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

  const getCompanyName = (company) =>
    company?.companyName || company?.name || "Unnamed Company";

  const getEmail = (company) =>
    company?.email || company?.companyEmail || "Not available";

  const getLocation = (company) =>
    company?.location || company?.address || "Not specified";

  const getWebsite = (company) =>
    company?.website || company?.url || "";

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <Building2 size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Companies Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage registered companies.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchCompanies}
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
                Total Companies
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {companies.length}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-green-700">
              <Building2 size={25} />
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
                {filteredCompanies.length}
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
          htmlFor="company-search"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Search Companies
        </label>

        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="company-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company name, email, or location..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Companies Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">
            All Companies
          </h2>

          <p className="text-sm text-gray-500">
            {filteredCompanies.length} compan
            {filteredCompanies.length === 1 ? "y" : "ies"} found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
            <LoaderCircle
              size={34}
              className="animate-spin text-green-600"
            />

            <p className="text-sm text-gray-500">
              Loading companies...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle size={36} className="text-red-500" />

            <p className="font-medium text-gray-800">
              Unable to load companies
            </p>

            <p className="max-w-md text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchCompanies}
              className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <Building2 size={38} className="text-gray-300" />

            <p className="font-semibold text-gray-800">
              No companies found
            </p>

            <p className="text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "No registered companies are available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Company
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Registered
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.map((company) => (
                  <tr
                    key={company._id}
                    className="transition hover:bg-green-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                          <Building2 size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {getCompanyName(company)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            ID: {company._id || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {getEmail(company)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin
                          size={16}
                          className="shrink-0 text-gray-400"
                        />

                        {getLocation(company)}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(company.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewDetails(company._id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:border-green-600 hover:bg-green-600 hover:text-white"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Company Details Modal */}
      {(selectedCompany || detailsLoading || detailsError) && (
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
            aria-labelledby="company-details-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <h2
                id="company-details-title"
                className="text-lg font-bold text-gray-900"
              >
                Company Details
              </h2>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close company details"
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
                  Loading company details...
                </p>
              </div>
            ) : detailsError ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <AlertCircle size={36} className="text-red-500" />

                <p className="font-medium text-gray-800">
                  Unable to load company details
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
            ) : selectedCompany ? (
              <div className="space-y-5 p-5">
                <div className="flex flex-col items-center rounded-xl bg-green-50 px-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
                    <Building2 size={30} />
                  </div>

                  <h3 className="mt-3 text-center text-xl font-bold text-gray-900">
                    {getCompanyName(selectedCompany)}
                  </h3>

                  <p className="mt-1 break-all text-center text-sm text-gray-500">
                    {getEmail(selectedCompany)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Company ID
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-800">
                        {selectedCompany._id || "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Email Address
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-800">
                        {getEmail(selectedCompany)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {getLocation(selectedCompany)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Registration Date
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {formatDate(selectedCompany.createdAt)}
                      </p>
                    </div>
                  </div>

                  {selectedCompany.phone && (
                    <div className="flex items-start gap-3">
                      <Phone
                        size={19}
                        className="mt-0.5 shrink-0 text-green-600"
                      />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Phone
                        </p>

                        <p className="mt-1 text-sm text-gray-800">
                          {selectedCompany.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {getWebsite(selectedCompany) && (
                    <div className="flex items-start gap-3">
                      <Globe
                        size={19}
                        className="mt-0.5 shrink-0 text-green-600"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Website
                        </p>

                        <a
                          href={getWebsite(selectedCompany)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-sm text-green-700 hover:underline"
                        >
                          {getWebsite(selectedCompany)}
                          <ExternalLink
                            size={14}
                            className="shrink-0"
                          />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 text-right">
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

export default CompaniesAdmin;
