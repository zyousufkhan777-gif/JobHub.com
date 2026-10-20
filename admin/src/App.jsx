import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { adminContext } from "./context/AdminContext";

import LoginAdmin from "./pages/LoginAdmin";
import AdminLayout from "./pages/AdminLayout";
import DasboardAdmin from "./pages/DasboardAdmin";
import UsersAdmin from "./pages/UsersAdmin";
import JobsAdmin from "./pages/JobsAdmin";
import CompaniesAdmin from "./pages/CompaniesAdmin";
import ApplicationsAdmin from "./pages/ApplicationsAdmin";

const App = () => {
  const { token } = useContext(adminContext);

  return (
    <Routes>
      {!token ? (
        <>
          <Route path="/login" element={<LoginAdmin />} />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </>
      ) : (
        <>
          <Route
            path="/admin-panel"
            element={<AdminLayout />}
          >
            <Route index element={<DasboardAdmin />} />

            <Route path="users" element={<UsersAdmin />} />

            <Route path="jobs" element={<JobsAdmin />} />

            <Route
              path="companies"
              element={<CompaniesAdmin />}
            />

            <Route
              path="applications"
              element={<ApplicationsAdmin />}
            />
          </Route>

          <Route
            path="/"
            element={<Navigate to="/admin-panel" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/admin-panel" replace />}
          />
        </>
      )}
    </Routes>
  );
};

export default App;