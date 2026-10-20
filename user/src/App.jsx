import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Home from "./pages/Home.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Jobs from "./pages/Jobs.jsx";
import Footer from "./components/common/Footer.jsx";
import Companies from "./pages/Companies.jsx";
import Saved from "./pages/Saved.jsx";
import Profile from "./pages/Profile.jsx";
import MyResume from "./pages/MyResume.jsx";
import MyApllication from "./pages/MyApllication.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import CompanyDetails from "./pages/CompanyDetails.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Otpverify from "./pages/Otpverify.jsx";
import { ToastContainer, toast } from "react-toastify";


const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:category" element={<Jobs />} />
        <Route path="/jobDetails/:id" element={<JobDetails />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetails />} />{" "}
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-resume" element={<MyResume />} />
        <Route path="/applications" element={<MyApllication />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<Otpverify />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
