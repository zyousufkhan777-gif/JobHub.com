
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { userContext } from "../../context/UserContext";

const TopCompanies = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(userContext);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCompanies = async () => {
      setLoading(true);

      try {
        if (
          typeof backendUrl !== "string" ||
          !backendUrl.trim()
        ) {
          throw new Error(
            "Backend URL is missing. Check UserContext.jsx."
          );
        }

        const baseUrl = backendUrl
          .trim()
          .replace(/\/+$/, "");

        let apiUrl;

        try {
          apiUrl = new URL(
            `${baseUrl}/api/users/getcompanies`
          ).toString();
        } catch {
          throw new Error(
            "Invalid backend URL. Check UserContext.jsx."
          );
        }

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data?.success && Array.isArray(data.companies)) {
          if (isMounted) {
            setCompanies(data.companies.slice(0, 6));
          }
        } else {
          if (isMounted) {
            setCompanies([]);
            toast.error(
              data?.message || "Failed to fetch companies."
            );
          }
        }
      } catch (error) {
        console.error("Fetch Top Companies Error:", error);

        if (isMounted) {
          setCompanies([]);

          toast.error(
            error.response?.data?.message ||
            error.message ||
            "Failed to load companies."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, [backendUrl]);

  const handleViewCompany = (companyId) => {
    if (!companyId) {
      toast.error("Company ID is missing.");
      return;
    }

    // Correct company details route
    navigate(`/companies/${companyId}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-gray-50 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div
          data-aos="fade-up"
          className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <p className="mb-2 font-semibold text-green-500">
              Explore Opportunities
            </p>

            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Top Companies
            </h2>

            <p className="mt-3 max-w-xl text-gray-500">
              Discover companies that are hiring talented people like you.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center">
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full
              border-4 border-gray-200 border-t-green-500"
            />

            <p className="mt-4 text-gray-500">
              Loading companies...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && companies.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              No companies found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              There are no companies available right now.
            </p>
          </div>
        )}

        {/* Companies */}
        {!loading && companies.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, index) => (
              <div
                key={company._id || company.id || index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group rounded-2xl border border-gray-200 bg-white p-6
                transition-all duration-300 hover:-translate-y-2
                hover:border-green-200 hover:shadow-xl"
              >
                {/* Company Logo and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-green-50 p-2">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={`${company.name || "Company"} logo`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                    ) : null}

                    <span
                      className={`text-2xl font-bold text-green-600 ${company.logo ? "hidden" : ""
                        }`}
                    >
                      {company.name?.charAt(0)?.toUpperCase() || "C"}
                    </span>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                    Company
                  </span>
                </div>

                {/* Company Information */}
                <div className="mt-5">
                  <h3 className="text-xl font-bold text-gray-900 transition group-hover:text-green-600">
                    {company.companyName || "Unnamed Company"}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-green-500">
                    {company.industry ||
                      company.category ||
                      "Technology"}
                  </p>

                  <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <span>📍</span>
                    <span>
                      {company.location || "Location not specified"}
                    </span>
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                    {company.description ||
                      "Discover this company and its career opportunities."}
                  </p>
                </div>

                {/* Jobs and Button */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {Number(company.jobCount) || 0}
                    </p>

                    <p className="text-xs text-gray-500">
                      Open Positions
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleViewCompany(company._id || company.id)
                    }
                    className="rounded-xl border border-green-500 px-4 py-2
                    text-sm font-semibold text-green-600 transition
                    hover:bg-green-500 hover:text-white"
                  >
                    View Company
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopCompanies;
