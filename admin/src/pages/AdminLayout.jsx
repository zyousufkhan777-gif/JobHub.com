import { Outlet } from "react-router-dom";
import Navbar from "../components/common/navbar";

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation bar */}
            <Navbar />

            {/* Page content */}
            <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
