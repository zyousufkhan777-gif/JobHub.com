import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/jobhub-logo.png";

import {
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-green-400 px-8 pt-12">
      {/* Footer Content */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 pb-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Logo & Description */}
        <div className="flex flex-col gap-5">
          <img src={Logo} alt="JobHub Logo" className="w-60" />

          <p className="max-w-sm font-medium leading-7 text-white">
            JobHub is a modern job platform that connects talented job seekers
            with top companies and helps people find the right opportunities to
            grow their careers.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-2xl text-white transition hover:-translate-y-1 hover:text-gray-200"
            >
              <FaLinkedin />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="text-2xl text-white transition hover:-translate-y-1 hover:text-gray-200"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              aria-label="GitHub"
              className="text-2xl text-white transition hover:-translate-y-1 hover:text-gray-200"
            >
              <FaGithub />
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="text-2xl text-white transition hover:-translate-y-1 hover:text-gray-200"
            >
              <FaTwitter />
            </a>

            <a
              href="#"
              aria-label="YouTube"
              className="text-2xl text-white transition hover:-translate-y-1 hover:text-gray-200"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* For Job Seekers */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">For Job Seekers</h3>

          <Link
            to="/jobs"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Browse Jobs
          </Link>

          <Link
            to="/companies"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Companies
          </Link>

          <Link
            to="/saved-jobs"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Saved Jobs
          </Link>
        </div>

        {/* For Companies */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">For Companies</h3>

          <Link
            to="/company/post-job"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Post a Job
          </Link>

          <Link
            to="/company/candidates"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Find Candidates
          </Link>

          <Link
            to="/company/dashboard"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Company Dashboard
          </Link>
        </div>

        {/* Company */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Company</h3>

          <Link
            to="/about"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            About Us
          </Link>

          <Link
            to="/contact"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Contact
          </Link>

          <Link
            to="/help"
            className="block font-medium text-white transition hover:text-gray-200"
          >
            Help Center
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-green-400 py-6">
        <p className="text-center text-sm font-medium text-white">
          © 2026 JobHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
