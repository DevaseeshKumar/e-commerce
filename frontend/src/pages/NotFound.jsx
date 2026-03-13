import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useCallback, useState } from "react";
import Navbar from "../components/Navbar";
import UserNavbar from "../components/UserNavbar";
import { injectCustomFonts, FONT_DISPLAY, FONT_BODY } from "../utils/fonts";

injectCustomFonts();
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";

const GRID_COLS = 38;
const GRID_ROWS = 22;
const DOT_R = 1.8;
const REPEL_DIST = 120;  // px
const REPEL_FORCE = 7;
const STIFFNESS = 0.12;
const DAMPING = 0.72;

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact" },
];

function useDotCanvas(containerRef, isDark) {
  const canvasRef = useRef(null);
  const cursorRef = useRef({ x: -999, y: -999 });
  const dotsRef = useRef([]);
  const rafRef = useRef(null);

  // Build dot grid whenever size changes
  const buildDots = useCallback((w, h) => {
    const dots = [];
    const gapX = w / GRID_COLS;
    const gapY = h / GRID_ROWS;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const rx = (c + 0.5) * gapX;
        const ry = (r + 0.5) * gapY;
        dots.push({ rx, ry, x: rx, y: ry, vx: 0, vy: 0 });
      }
    }
    dotsRef.current = dots;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w;
      canvas.height = h;
      buildDots(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      cursorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { cursorRef.current = { x: -999, y: -999 }; };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    const idleColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const activeColor = isDark ? "#ffffff" : "#0a0a0a";

    const tick = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = cursorRef.current.x;
      const cy = cursorRef.current.y;

      for (const dot of dotsRef.current) {
        // Spring back to rest
        dot.vx += -STIFFNESS * (dot.x - dot.rx);
        dot.vy += -STIFFNESS * (dot.y - dot.ry);

        // Repel from cursor
        const dx = dot.rx - cx;
        const dy = dot.ry - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_DIST && dist > 0.1) {
          const strength = (1 - dist / REPEL_DIST) * REPEL_FORCE;
          dot.vx += (dx / dist) * strength;
          dot.vy += (dy / dist) * strength;
        }

        // Damping
        dot.vx *= DAMPING;
        dot.vy *= DAMPING;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Color by proximity to current position
        const dCur = Math.hypot(dot.x - cx, dot.y - cy);
        const t = Math.max(0, 1.3 - dCur / REPEL_DIST);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_R + t * 2.2, 0, Math.PI * 2);

        if (t > 0.01) {
          ctx.fillStyle = activeColor;
          ctx.globalAlpha = 0.1 + t * 0.9;
        } else {
          ctx.fillStyle = idleColor;
          ctx.globalAlpha = 1;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [buildDots, containerRef, isDark]);

  return canvasRef;
}

const NotFound = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  let NavBar;
  if (!token) NavBar = Navbar;
  else if (role === "admin") NavBar = AdminNavbar;
  else NavBar = UserNavbar;

  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const containerRef = useRef(null);
  const canvasRef = useDotCanvas(containerRef, isDark);

  // 404 tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const rotateY = useTransform(springX, [0, 1], [-14, 14]);
  const rotateX = useTransform(springY, [0, 1], [10, -10]);
  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX / globalThis.innerWidth);
      mouseY.set(e.clientY / globalThis.innerHeight);
    };
    globalThis.addEventListener("mousemove", onMove);
    return () => globalThis.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a]">
      <NavBar />

      <div ref={containerRef} className="relative flex-1 flex flex-col items-center justify-center overflow-hidden pt-16">

        {/* Single canvas — all dots rendered here */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Central content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">

          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 110 }}
            style={{ rotateY, rotateX, perspective: 900 }}
            className="select-none pointer-events-none"
          >
            <span className="text-[100px] sm:text-[160px] font-black leading-none text-gray-900 dark:text-white drop-shadow-2xl">
              404
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white -mt-3 mb-2 pointer-events-none"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-9 pointer-events-none"
          >
            Looks like this page wandered off. Let&apos;s get you back on track.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm"
            >
              ← Go Back
            </motion.button>

            <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.94 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Go Home
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600"
          >
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
