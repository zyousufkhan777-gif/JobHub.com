import React from "react";
import { FaSearch, FaFileAlt, FaBuilding, FaCheckCircle } from "react-icons/fa";

const steps = [
  {
    id: 1,
    title: "Search Jobs",
    description:
      "Find jobs that match your skills, experience, and career goals.",
    icon: FaSearch,
  },
  {
    id: 2,
    title: "Apply Easily",
    description:
      "Create your profile and apply for your favorite jobs with ease.",
    icon: FaFileAlt,
  },
  {
    id: 3,
    title: "Connect with Companies",
    description:
      "Connect with companies and communicate with potential employers.",
    icon: FaBuilding,
  },
  {
    id: 4,
    title: "Get Hired",
    description:
      "Take the next step in your career and get hired for your dream job.",
    icon: FaCheckCircle,
  },
];

const HowJobHubWorks = () => {
  return (
    <section className="bg-slate-50 px-8 py-20">
      {/* Heading */}
      <div data-aos="fade-up" className="mx-auto mb-14 max-w-2xl text-center">
        <p className="font-semibold text-green-500">Simple & Easy</p>

        <h2 className="mt-2 text-4xl font-bold text-gray-900">
          How JobHub Works
        </h2>

        <p className="mt-4 text-gray-500">
          Find your next opportunity in just a few simple steps.
        </p>
      </div>

      {/* Steps */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="relative rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Number */}
              <span className="absolute right-4 top-4 text-4xl font-bold text-green-100">
                0{step.id}
              </span>

              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                <Icon className="text-2xl text-green-500" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-800">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-500">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowJobHubWorks;
