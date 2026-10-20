
import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateCompany from "./pages/CreateCompany";
import Dashboard from "./pages/Dashboard";
import ManageJobs from "./pages/ManageJobs";
import CompanyLayout from "./pages/CompanyLayout";
import { companyContext } from "./context/companyContext";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyApllications from "./pages/CompanyApllications";
import PostJob from "./pages/PostJob";

const App = () => {
  const { token } = useContext(companyContext);

  return (
    <>
      <ToastContainer />

      <Routes>
        {!token ? (
          <>
            <Route
              path="/"
              element={<Navigate to="/register" replace />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={<Navigate to="/company" replace />}
            />

            <Route
              path="/create-company"
              element={<CreateCompany />}
            />

            <Route path="/company" element={<CompanyLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<ManageJobs />} />
              <Route path="job-post" element={<PostJob />} />
              <Route path="profile" element={<CompanyProfile />} />
              <Route path="applications" element={<CompanyApllications />} />
            </Route>

            <Route
              path="*"
              element={<Navigate to="/company" replace />}
            />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;
