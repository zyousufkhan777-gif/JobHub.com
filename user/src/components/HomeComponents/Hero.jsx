import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaBuilding,
  FaArrowRight,
} from "react-icons/fa";

import woman from "../../assets/woman.jpg";
import { userContext } from "../../context/UserContext.jsx";

const Hero = () => {
  const navigate = useNavigate();
  const context = useContext(userContext);

  const token = context?.token;
  const user = context?.user;

  // Applicant button
  const handleApplicantClick = () => {
    if (token && user) {
      navigate("/jobs");
    } else {
      navigate("/login");
    }
  };

  // Company button
  const handleCompanyClick = () => {
    window.location.href = "http://localhost:5174/register";
  };

  return (
    <section className="overflow-hidden bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          {/* Left Content */}
          <div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              🚀 Find Your Next Opportunity
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Your{" "}
              <span className="text-green-600">
                Dream Job
              </span>{" "}
              Is Waiting Here
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
              Welcome to JobHub! Explore exciting job
              opportunities, connect with great companies,
              submit your resume, and take the next step
              in your career.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleApplicantClick}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-4 font-semibold text-white shadow-lg shadow-green-600/20 transition duration-300 hover:-translate-y-1 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                <FaUserTie className="text-xl" />

                <span>I'm an Applicant</span>

                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={handleCompanyClick}
                className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 font-semibold text-gray-800 transition duration-300 hover:-translate-y-1 hover:border-green-600 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
              >
                <FaBuilding className="text-xl" />

                <span>I'm a Company</span>
              </button>
            </div>

            {/* Features */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <span>✓ Explore job opportunities</span>
              <span>✓ Connect with companies</span>
              <span>✓ Build your career</span>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center">
            {/* Background Decoration */}
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/70 blur-3xl sm:h-80 sm:w-80" />

            {/* Main Image */}
            <div className="relative h-[320px] w-[320px] overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl sm:h-[420px] sm:w-[420px]">
              <img
                src={woman}
                alt="Job seeker exploring career opportunities"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>

            {/* Floating Information Card */}
            <div className="absolute -bottom-5 left-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:-left-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <FaBuilding className="text-xl" />
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    Your Next Opportunity
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Start with JobHub
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
