import React from "react";
import {
  FaCode,
  FaPaintBrush,
  FaBullhorn,
  FaBriefcase,
  FaMobileAlt,
  FaMoneyBillWave,
  FaHeadset,
  FaBug,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Development",
    jobs: 120,
    icon: FaCode,
  },
  {
    id: 2,
    name: "UI/UX Design",
    jobs: 85,
    icon: FaPaintBrush,
  },
  {
    id: 3,
    name: "Marketing",
    jobs: 64,
    icon: FaBullhorn,
  },
  {
    id: 4,
    name: "Business",
    jobs: 52,
    icon: FaBriefcase,
  },
  {
    id: 5,
    name: "Mobile Development",
    jobs: 48,
    icon: FaMobileAlt,
  },
  {
    id: 6,
    name: "Finance",
    jobs: 37,
    icon: FaMoneyBillWave,
  },
  {
    id: 7,
    name: "Customer Service",
    jobs: 31,
    icon: FaHeadset,
  },
  {
    id: 8,
    name: "QA & Testing",
    jobs: 26,
    icon: FaBug,
  },
];

const Jobcategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/jobs/${encodeURIComponent(category.name)}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-8 py-20">
      {/* Title */}
      <div data-aos="fade-up" className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Browse <span className="text-green-500">Job Category</span>
        </h1>

        <p className="mt-3 text-gray-500">
          Explore jobs by category and find your next opportunity.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => {
          const Icon = category.icon;

          return (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="flex cursor-pointer flex-col items-center gap-5 rounded-2xl bg-white p-10 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="rounded-xl bg-green-50 p-4">
                <Icon className="text-3xl text-green-500" />
              </div>

              <h3 className="text-lg font-bold text-gray-700">
                {category.name}
              </h3>

              <p className="font-semibold text-gray-500">
                {category.jobs} Jobs Vacancy
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Jobcategories;
