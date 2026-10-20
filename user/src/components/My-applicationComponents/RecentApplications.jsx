import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { userContext } from "../../context/UserContext";

const RecentApplications = () => {
  const context = useContext(userContext);
  const backendUrl = context?.backendUrl || import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const token = context?.token;

  const [applications, setApplications] = useState([]);
  const [companiesById, setCompaniesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setError("Please log in to view your applications.");
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const baseUrl = backendUrl.replace(/\/$/, "");
        const [applicationsResponse, companiesResponse] = await Promise.allSettled([
          axios.get(`${baseUrl}/api/applications/my-applications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Optional company list: lets the UI resolve company IDs when the job
          // response has not populated the company document.
          axios.get(`${baseUrl}/api/users/getcompanies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (applicationsResponse.status === "rejected") {
          throw applicationsResponse.reason;
        }

        const data = applicationsResponse.value.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.applications)
            ? data.applications
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setApplications(list);

        if (companiesResponse.status === "fulfilled") {
          const companyData = companiesResponse.value.data;
          const companyList = Array.isArray(companyData)
            ? companyData
            : Array.isArray(companyData?.companies)
              ? companyData.companies
              : Array.isArray(companyData?.data)
                ? companyData.data
                : [];

          const companyMap = {};
          companyList.forEach((company) => {
            const companyId = company?._id || company?.id;
            if (companyId) companyMap[String(companyId)] = company;
          });
          setCompaniesById(companyMap);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError(
          err.response?.data?.message ||
          "Could not load applications. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [backendUrl, token]);

  const getCompanyName = (application) => {
    const job = application?.job;
    const company = job?.company || job?.companyId || job?.company_id || application?.company;

    // When populated by Mongoose, company is an object containing its name.
    if (company && typeof company === "object") {
      if (company.name) return company.name;
      if (company.companyName) return company.companyName;
      const nestedId = company._id || company.id;
      if (nestedId && companiesById[String(nestedId)]?.name) {
        return companiesById[String(nestedId)].name;
      }
    }

    // When the API returns only a company ID, resolve it using the company list.
    if (typeof company === "string") {
      const matchedCompany = companiesById[company];
      if (matchedCompany?.name) return matchedCompany.name;
      // Avoid showing a raw MongoDB ID in the table.
      if (/^[a-f\d]{24}$/i.test(company)) return "Company name unavailable";
      return company;
    }

    return job?.companyName || application?.companyName || "Company name unavailable";
  };

  const getPosition = (application) => {
    const job = application?.job;
    return job?.title || job?.position || job?.jobTitle || application?.position || "Position not available";
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(parsedDate);
  };

  const getStatus = (status) => {
    const value = String(status || "pending").toLowerCase().replace(/[ _-]/g, "");
    if (["approved", "accepted", "hired", "offer"].includes(value)) {
      return { label: "Approved", className: "bg-green-100 text-green-700" };
    }
    if (["shortlisted", "shortlist"].includes(value)) {
      return { label: "Shortlisted", className: "bg-blue-100 text-blue-700" };
    }
    if (["rejected", "declined", "notselected"].includes(value)) {
      return { label: "Rejected", className: "bg-red-100 text-red-700" };
    }
    if (["underreview", "reviewing", "inreview"].includes(value)) {
      return { label: "Under Review", className: "bg-amber-100 text-amber-700" };
    }
    return { label: status || "Pending", className: "bg-slate-100 text-slate-700" };
  };

  return (
    <section data-aos="fade-up" className="w-full bg-slate-100 px-4 py-5 sm:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-5 shadow-lg sm:p-8 lg:p-10">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-green-600 sm:text-3xl">
            Recent Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track the status of the jobs you have applied for.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500" role="status">
            Loading your applications...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-700">No applications yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              When you apply for a job, it will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[650px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100 text-sm font-semibold text-slate-600">
                    <th className="rounded-l-lg px-4 py-3">Company</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Date Applied</th>
                    <th className="rounded-r-lg px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => {
                    const status = getStatus(application.status);
                    return (
                      <tr key={application._id || application.id} className="border-b last:border-b-0 hover:bg-slate-50">
                        <td className="px-4 py-5 font-semibold text-slate-800">{getCompanyName(application)}</td>
                        <td className="px-4 py-5 text-slate-600">{getPosition(application)}</td>
                        <td className="px-4 py-5 text-slate-500">{formatDate(application.createdAt || application.appliedAt || application.date)}</td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mt-5 space-y-4 md:hidden">
              {applications.map((application) => {
                const status = getStatus(application.status);
                return (
                  <article key={application._id || application.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-slate-800">{getCompanyName(application)}</h2>
                        <p className="mt-1 text-sm text-slate-600">{getPosition(application)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Applied: {formatDate(application.createdAt || application.appliedAt || application.date)}
                    </p>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RecentApplications;
