
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import FloatingHelp from "../components/FloatingHelp";

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">

      {/* Navbar */}
      <UserNavbar />

      {/* Page Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
      
      <FloatingHelp />

    </div>
  );
};

export default UserLayout;
