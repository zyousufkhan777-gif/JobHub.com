import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import AOS from "aos";
import "aos/dist/aos.css";

const SearchJobs = () => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 50,
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (location.trim()) params.set("location", location.trim());

    // SearchJobs page reads these URL parameters and calls /api/jobs/search.
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      data-aos="fade-right"
      onSubmit={handleSearch}
      className="flex w-full flex-col gap-3 rounded-2xl bg-slate-100 p-3 shadow-xl md:flex-row"
    >
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4">
        <CiSearch className="shrink-0 text-2xl text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, skills or keywords"
          aria-label="Job title, skills or keywords"
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4">
        <IoLocationOutline className="shrink-0 text-2xl text-gray-400" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          aria-label="Location"
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-7 py-3 font-semibold text-white transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
      >
        <CiSearch className="text-2xl" />
        Search Jobs
      </button>
    </form>
  );
};

export default SearchJobs;
