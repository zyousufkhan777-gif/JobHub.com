import React, { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Common/Navbar";
import Sidebar from "../components/Common/Sidebar";
import { companyContext } from "../context/companyContext";

const CompanyLayout = () => {
    const { token, getCompany, companyInfo } = useContext(companyContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (token) {
            getCompany();
        }
    }, [token, getCompany]);

  

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="min-h-screen lg:ml-64">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CompanyLayout;