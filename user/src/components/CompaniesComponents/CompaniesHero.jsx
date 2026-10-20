import React from "react";
import companies from "../../assets/companies.jpg";
import aos from 'aos'
const CompaniesHero = () => {
  return (
    <section data-aos="fade-right" className="relative h-[280px] overflow-hidden">
      {/* Background Image */}
      <img
        src={companies}
        alt="Companies"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-green-900/60"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-10">
        <div className="text-white">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider">
            Explore
          </p>

          <h1 className="text-5xl font-bold">Companies</h1>

          <p className="mt-3 text-lg text-white/90">
            Discover top companies and find the best place to grow your career.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CompaniesHero;
