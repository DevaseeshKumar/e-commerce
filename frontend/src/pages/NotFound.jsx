import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import UserNavbar from "../components/UserNavbar";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";

const DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 3,
  depth: Math.random() * 0.8 + 0.2, // parallax strength 0.2–1
}));

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact" },
];

const NotFound = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const NavBar = !token ? Navbar : role === "admin" ? AdminNavbar : UserNavbar;

  // Raw mouse position (0–1)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth spring followers
  const springX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18 });

  // 404 tilt — maps 0-1 to -12deg/+12deg
  const rotateY = useTransform(springX, [0, 1], [-12, 12]);
  const rotateX = useTransform(springY, [0, 1], [10, -10]);

  // Shadow moves opposite to cursor for depth illusion
  const shadowX = useTransform(springX, [0, 1], [12, -12]);
  const shadowY = useTransform(springY, [0, 1], [12, -12]);
  const textShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) => `${sx}px ${sy}px 0px rgba(0,0,0,0.12)`
  );

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0e0e0e]">
      <NavBar />
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-16">

      {/* Parallax dots that drift with the cursor */}
      {DOTS.map((dot) => (
        <motion.span
          key={dot.id}
          className="absolute rounded-full bg-gray-300 dark:bg-white/10 pointer-events-none"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            x: useTransform(springX, [0, 1], [-30 * dot.depth, 30 * dot.depth]),
            y: useTransform(springY, [0, 1], [-20 * dot.depth, 20 * dot.depth]),
          }}
        />
      ))}

      {/* 404 — tilts with cursor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        style={{ rotateY, rotateX, textShadow, perspective: 800 }}
        className="select-none cursor-default"
      >
        <span className="text-[120px] sm:text-[180px] font-black leading-none text-gray-900 dark:text-white">
          404
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white -mt-4 mb-3"
      >
        Page Not Found
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-10"
      >
        Looks like this page wandered off. Let's get you back on track.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-3 mb-12"
      >
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm transition-colors"
        >
          ← Go Back
        </motion.button>

        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600"
      >
        <span>Quick links:</span>
        {LINKS.map((link, i) => (
          <span key={link.to} className="flex items-center gap-2">
            <Link
              to={link.to}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
            {i < LINKS.length - 1 && <span>·</span>}
          </span>
        ))}
      </motion.div>

      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
