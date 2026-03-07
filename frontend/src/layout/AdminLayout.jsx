import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950">

      {/* Fixed Navbar */}
      <AdminNavbar />

      {/* Page Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default AdminLayout;