
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

import {
  BsSend,
  BsClock,
  BsCheckCircle,
  BsXCircle,
} from "react-icons/bs";

import { userContext } from "../../context/UserContext";

const ApplicationCard = () => {
  const context = useContext(userContext);

  const backendUrl =
    context?.backendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:3000";

  const token = context?.token;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setApplications([]);
        setLoading(false);
        setError("Please log in to view your applications.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${backendUrl}/api/applications/my-applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        if (data?.success === false) {
          throw new Error(
            data.message || "Failed to load applications."
          );
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.applications)
            ? data.applications
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setApplications(list);
      } catch (err) {
        console.error("Fetch applications error:", err);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [backendUrl, token]);

  const normalizeStatus = (status) =>
    String(status || "")
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, "");

  const isUnderReview = (status) =>
    ["underreview", "inreview", "pending", "review"].includes(
      normalizeStatus(status)
    );

  const isShortlisted = (status) =>
    ["shortlisted", "accepted", "selected"].includes(
      normalizeStatus(status)
    );

  const isRejected = (status) =>
    ["rejected", "declined"].includes(normalizeStatus(status));

  const cards = [
    {
      title: "Total Applications",
      value: applications.length,
      icon: BsSend,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Under Review",
      value: applications.filter((app) =>
        isUnderReview(app.status)
      ).length,
      icon: BsClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Shortlisted",
      value: applications.filter((app) =>
        isShortlisted(app.status)
      ).length,
      icon: BsCheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Rejected",
      value: applications.filter((app) =>
        isRejected(app.status)
      ).length,
      icon: BsXCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <section className="mx-auto w-full bg-slate-100 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            My Applications
          </h1>

          <p className="mt-3 text-base font-medium text-green-600 sm:text-lg">
            Track all your job applications and manage your resumes.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-600">
            Loading your applications...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="rounded-2xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
                >
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${card.bg}`}
                  >
                    <Icon className={`text-2xl ${card.color}`} />
                  </div>

                  <p className="text-sm font-semibold text-gray-500 sm:text-base">
                    {card.title}
                  </p>

                  <h2 className={`mt-2 text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </h2>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <p className="mt-8 text-center text-gray-500">
            You haven't applied for any jobs yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default ApplicationCard;
