import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="px-8 py-20">
      <div
        data-aos="zoom-in"
        className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-3xl bg-green-600 px-8 py-14 text-center md:flex-row md:px-16 md:text-left"
      >
        <div>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Find Your Dream Job?
          </h2>

          <p className="mt-4 max-w-xl text-green-50">
            Discover thousands of opportunities and take the next step toward
            your career.
          </p>
        </div>

        <button
          onClick={() => {
            (navigate("/jobs"), scrollTo(0, 0));
          }}
          className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-7 py-3 font-semibold text-green-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          Find Jobs
          <FaArrowRight />
        </button>
      </div>
    </section>
  );
};

export default CTA;
