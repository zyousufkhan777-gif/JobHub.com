
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { HiOutlineLocationMarker } from "react-icons/hi";
import job from "../../assets/job.png";
import AOS from "aos";
import "aos/dist/aos.css";

const HeroJob = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const query = params.toString();

    navigate(query ? `/jobs?${query}` : "/jobs");
  };

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <section data-aos="fade-up" className="bg-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-6 py-20 lg:flex-row lg:px-10">
        {/* Content */}
        <div className="flex w-full flex-col gap-5 lg:w-1/2">
          <p className="w-fit rounded-full bg-green-100 px-4 py-2 font-medium text-green-700">
            Find Your Next Opportunity
          </p>

          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Find the Perfect Job
          </h1>

          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            For <span className="text-green-600">Your Future</span>
          </h1>

          <p className="text-base font-medium leading-7 text-gray-600 md:text-lg">
            Explore thousands of job opportunities from top companies
            <br className="hidden md:block" />
            and take the next step in your career.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-3 flex w-full flex-col gap-3 rounded-3xl bg-white p-3 shadow-xl md:flex-row md:items-center md:p-4"
          >
            {/* Job title, skills or company */}
            <div className="flex flex-1 items-center gap-3 border-b border-gray-200 px-3 py-2 md:border-b-0 md:border-r-2">
              <CiSearch className="shrink-0 text-2xl text-gray-400" />

              <input
                className="w-full border-none outline-none"
                type="text"
                placeholder="Job title, skills or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="flex flex-1 items-center gap-3 px-3 py-2">
              <HiOutlineLocationMarker className="shrink-0 text-2xl text-gray-400" />

              <input
                className="w-full border-none outline-none"
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="cursor-pointer rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Image */}
        <div className="flex w-full justify-center lg:w-1/2">
          <img
            className="w-full max-w-lg object-contain"
            src={job}
            alt="Job search illustration"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroJob;
