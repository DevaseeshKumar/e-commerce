
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingHelp from "../components/FloatingHelp";
import { injectCustomFonts, FONT_DISPLAY, FONT_BODY } from "../utils/fonts";

injectCustomFonts();

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">

        <Navbar />

      <main className="flex-1 mt-16">
        <Outlet />
      </main>

      <Footer />
      <FloatingHelp />

    </div>
  );
};

export default MainLayout;