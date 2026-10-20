
import { useContext } from "react";
import {
  FaCode,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/UserContext";

const FeaturedJobs = () => {
  const navigate = useNavigate();
  const { jobs = [], jobsLoading } = useContext(userContext);

  // Display up to 4 most recent jobs
  const featuredJobs = jobs.slice(0, 4);

  const getCompanyName = (company) => {
    if (company && typeof company === "object") {
      return company.name || "Company";
    }

    return "Company";
  };

  if (jobsLoading) {
    return (
      <section className="bg-slate-50 px-6 py-20 text-center md:px-8">
        <p className="text-gray-500">Loading featured jobs...</p>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 px-6 py-20 md:px-8">
      {/* Heading */}
      <div
        data-aos="fade-up"
        className="mx-auto mb-12 max-w-7xl text-center"
      >
        <p className="font-semibold text-green-500">
          Latest Opportunities
        </p>

        <h2 className="mt-2 text-4xl font-bold text-gray-900">
          Featured Jobs
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          Discover the latest job opportunities from top companies.
        </p>
      </div>

      {/* Jobs */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
        {featuredJobs.length > 0 ? (
          featuredJobs.map((job, index) => {
            const companyName = getCompanyName(job.company);

            const companyLogo =
              job.company && typeof job.company === "object"
                ? job.company.logo
                : null;

            return (
              <article
                key={job._id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Company and Job Title */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-50">
                        <FaCode className="text-2xl text-green-500" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-bold text-gray-800">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-gray-500">
                        {companyName}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                    Featured
                  </span>
                </div>

                {/* Job Information */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                  {job.location && (
                    <span className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-500" />
                      {job.location}
                    </span>
                  )}

                  {job.jobType && (
                    <span className="flex items-center gap-2">
                      <FaClock className="text-green-500" />
                      {job.jobType}
                    </span>
                  )}

                  {job.salary && (
                    <span className="flex items-center gap-2">
                      <FaDollarSign className="text-green-500" />
                      {job.salary}
                    </span>
                  )}
                </div>

                {/* Work Mode and Category */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.category && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {job.category}
                    </span>
                  )}

                  {job.workMode && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      {job.workMode}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="text-sm text-gray-400">
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "Recently posted"}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/jobDetails/${job._id}`);
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="cursor-pointer rounded-xl bg-green-500 px-5 py-2.5 font-semibold text-white transition hover:bg-green-600"
                  >
                    View Job
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              No featured jobs available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Please check back later for new opportunities.
            </p>
          </div>
        )}
      </div>

      {/* View All Jobs */}
      {jobs.length > 4 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => {
              navigate("/jobs");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-xl border border-green-500 px-6 py-3 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
          >
            View All Jobs
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedJobs;
