import { useRef, useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { injectCustomFonts, FONT_DISPLAY, FONT_BODY } from "../utils/fonts";

/* ── Initialize custom fonts ────────────────────────────────── */
injectCustomFonts();

/* ── Global normalised cursor (0-1) with spring ──────────────── */
function useGlobalCursor() {
  const rx = useMotionValue(0.5);
  const ry = useMotionValue(0.5);
  const sx = useSpring(rx, { stiffness: 60, damping: 18 });
  const sy = useSpring(ry, { stiffness: 60, damping: 18 });
  useEffect(() => {
    const onMove = (e) => {
      rx.set(e.clientX / window.innerWidth);
      ry.set(e.clientY / window.innerHeight);
    };
    globalThis.addEventListener("mousemove", onMove);
    return () => globalThis.removeEventListener("mousemove", onMove);
  }, [rx, ry]);
  return { sx, sy };
}

/* ── Canvas dot-grid with cursor repulsion (hero) ───────────── */
function drawShopParticle(ctx, type, s) {
  ctx.beginPath();
  if (type === 0) {
    ctx.moveTo(-s * 0.45, -s * 0.85);
    ctx.lineTo(-s * 0.85,  s * 0.15);
    ctx.lineTo( s * 0.75,  s * 0.15);
    ctx.lineTo( s * 0.4,  -s * 0.85);
    ctx.moveTo(-s * 0.25 + s * 0.22, s * 0.55);
    ctx.arc(-s * 0.25, s * 0.55, s * 0.22, 0, Math.PI * 2);
    ctx.moveTo( s * 0.35 + s * 0.22, s * 0.55);
    ctx.arc( s * 0.35, s * 0.55, s * 0.22, 0, Math.PI * 2);
  } else if (type === 1) {
    ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
    ctx.rect(-s * 0.25, -s,       s * 0.5, s * 0.5);
    ctx.rect(-s * 0.25,  s * 0.5, s * 0.5, s * 0.5);
  } else if (type === 2) {
    ctx.rect(-s * 0.8, -s * 0.9, s * 1.6, s * 1.1);
    ctx.rect(-s,        s * 0.2,  s * 2,   s * 0.3);
  } else if (type === 3) {
    ctx.rect(-s * 0.5, -s * 0.95, s, s * 1.9);
    ctx.moveTo(-s * 0.22, -s * 0.72);
    ctx.lineTo( s * 0.22, -s * 0.72);
  } else if (type === 4) {
    ctx.arc(0, s * 0.15, s * 0.75, -Math.PI, 0);
    ctx.rect(-s,        s * 0.15, s * 0.42, s * 0.65);
    ctx.rect( s * 0.58, s * 0.15, s * 0.42, s * 0.65);
  } else {
    ctx.rect(-s * 0.8, -s * 0.2, s * 1.6, s * 1.1);
    ctx.moveTo(0, -s * 0.2); ctx.lineTo(0, s * 0.9);
    ctx.moveTo(-s * 0.8, s * 0.25); ctx.lineTo(s * 0.8, s * 0.25);
    ctx.moveTo(-s * 0.45, -s * 0.2);
    ctx.arc(-s * 0.22, -s * 0.52, s * 0.32, Math.PI * 0.15, Math.PI);
    ctx.moveTo(s * 0.45, -s * 0.2);
    ctx.arc( s * 0.22, -s * 0.52, s * 0.32, 0, Math.PI * 0.85);
  }
}

function useHeroCanvas(containerRef, isDark) {
  const canvasRef = useRef(null);
  const cursorRef = useRef({ x: -999, y: -999 });
  const ptRef     = useRef([]);
  const rafRef    = useRef(null);
  const isDarkRef = useRef(isDark);

  const COLS    = 16;
  const REPEL_D = 130;
  const REPEL_F = 6.5;
  const STIFF   = 0.1;
  const DAMP    = 0.74;

  const buildParticles = useCallback((w, h) => {
    const rows = Math.round((h / w) * COLS);
    const px   = w / COLS;
    const py   = h / rows;
    const pts  = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < COLS; c++) {
        const rx = px * (c + 0.5) + (Math.random() - 0.5) * px * 0.35;
        const ry = py * (r + 0.5) + (Math.random() - 0.5) * py * 0.35;
        pts.push({
          rx, ry, x: rx, y: ry, vx: 0, vy: 0,
          type:  Math.floor(Math.random() * 6),
          angle: Math.random() * Math.PI * 2,
          spin:  (Math.random() - 0.5) * 0.007,
          size:  5 + Math.random() * 4,
        });
      }
    }
    ptRef.current = pts;
  }, []);

  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width  = width;
      canvas.height = height;
      buildParticles(width, height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMove  = (e) => {
      const r = container.getBoundingClientRect();
      cursorRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { cursorRef.current = { x: -999, y: -999 }; };
    container.addEventListener("pointermove",  onMove);
    container.addEventListener("pointerleave", onLeave);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const dark        = isDarkRef.current;
      const idleColor   = dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)";
      const activeColor = dark ? "#e8ff47" : "#111111";
      const { x: mx, y: my } = cursorRef.current;

      ctx.lineWidth   = 1.1;
      ctx.strokeStyle = idleColor;
      ctx.globalAlpha = 1;
      ctx.beginPath();

      for (const p of ptRef.current) {
        p.vx += -STIFF * (p.x - p.rx);
        p.vy += -STIFF * (p.y - p.ry);
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.hypot(dx, dy);
        let t = 0;
        if (dist < REPEL_D && dist > 0) {
          const strength = (1 - dist / REPEL_D) * REPEL_F;
          p.vx += (dx / dist) * strength;
          p.vy += (dy / dist) * strength;
          t = 1 - dist / REPEL_D;
        }
        p.vx *= DAMP; p.vy *= DAMP;
        p.x  += p.vx; p.y  += p.vy;
        p.angle += p.spin + t * 0.08;
        p.proximity = Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / REPEL_D);
      }

      // pass 1 — idle
      for (const p of ptRef.current) {
        if (p.proximity > 0.02) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        drawShopParticle(ctx, p.type, p.size);
        ctx.restore();
      }
      ctx.stroke();

      // pass 2 — active with glow
      ctx.lineWidth = 1.6;
      for (const p of ptRef.current) {
        if (p.proximity <= 0.02) continue;
        ctx.globalAlpha  = 0.18 + p.proximity * 0.82;
        ctx.strokeStyle  = activeColor;
        if (dark) {
          ctx.shadowColor = "#e8ff47";
          ctx.shadowBlur  = p.proximity * 18;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        drawShopParticle(ctx, p.type, p.size + p.proximity * 4.5);
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
    };

    const startRaf = () => { if (!rafRef.current) tick(); };
    const stopRaf  = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    const io = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? startRaf() : stopRaf(); },
      { threshold: 0 }
    );
    io.observe(container);
    startRaf();

    return () => {
      stopRaf();
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove",  onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [buildParticles, containerRef]);

  return canvasRef;
}

/* ── Letter-by-letter split heading ─────────────────────────── */
const SplitHeading = ({ text, className, style }) => {
  const words = text.split(" ");
  let charIndex = 0;
  return (
    <span className={className} style={style} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((char) => {
            const delay = charIndex++ * 0.045;
            return (
              <motion.span
                key={char + delay}
                className="inline-block"
                initial={{ opacity: 0, y: 40, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {char}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
};

/* ── 3-D tilt card ───────────────────────────────────────────── */
const ProductCard = ({ image, name, price, isDark }) => {
  const cardRef = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 24 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 24 });
  const shadowX = useTransform(sRotY, [-14, 14], ["-8px", "8px"]);
  const shadowY = useTransform(sRotX, [10, -10], ["-8px", "8px"]);
  const shadowColor = isDark ? "rgba(232,255,71,0.12)" : "rgba(0,0,0,0.18)";
  const dropShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) => `drop-shadow(${sx} ${sy} 24px ${shadowColor})`
  );
  const onMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(-py * 18);
    rotY.set(px * 18);
  }, [rotX, rotY]);
  const onLeave = useCallback(() => { rotX.set(0); rotY.set(0); }, [rotX, rotY]);
  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: sRotX, rotateY: sRotY, perspective: 800, filter: dropShadow }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="flex flex-col items-center gap-4 w-full max-w-xs cursor-pointer"
    >
      <div className={`w-full rounded-2xl p-6 flex items-center justify-center border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
        <img src={image} alt={name} className="w-full max-w-[240px] sm:w-64 pointer-events-none" />
      </div>
      <p
        className="font-semibold text-xl text-gray-900 dark:text-gray-100"
        style={FONT_DISPLAY}
      >
        {name}
      </p>
      <p className="text-gray-600 dark:text-gray-300" style={FONT_BODY}>{price}</p>
    </motion.div>
  );
};

/* ── Magnetic button ─────────────────────────────────────────── */
const MagneticBtn = ({ to, children, isDark }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const onMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  }, [x, y]);
  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.div style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block">
      <Link
        to={to}
        style={{
          ...FONT_DISPLAY,
          fontWeight: 700,
          letterSpacing: "0.04em",
          ...(isDark
            ? { background: "#e8ff47", color: "#0a0a0a", boxShadow: "0 0 32px rgba(232,255,71,0.35)" }
            : { background: "#0a0a0a", color: "#ffffff" }
          )
        }}
        className="inline-block px-10 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
      >
        {children}
      </Link>
    </motion.div>
  );
};

/* ── Stat with animated count-up and font reveal ────────────── */
const Stat = ({ value, label, delay = 0 }) => {
  const [shown, setShown] = useState(false);
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
      } else {
        setShown(false);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!shown) return;
    const match = value.match(/(\d+)/);
    if (!match) { setDisplay(value); return; }
    const num = parseInt(match[1]);
    const prefix = value.replace(/[\d]+.*/, "");
    const suffix = value.replace(/.*\d/, "");
    const controls = animate(0, num, {
      duration: 1.2,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(prefix + Math.round(v) + suffix),
    });
    return () => controls.stop();
  }, [shown, value, delay]);

  return (
    <div ref={ref}>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={shown ? { opacity: 1, y: 0 } : {}}
        transition={{ delay, duration: 0.5 }}
        className="text-4xl font-bold text-blue-600 dark:text-yellow-300"
        style={FONT_DISPLAY}
      >
        {display}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={shown ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.3, duration: 0.5 }}
        className="text-sm mt-1 text-gray-600 dark:text-gray-300"
        style={FONT_BODY}
      >
        {label}
      </motion.p>
    </div>
  );
};

/* ── Marquee ticker ─────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "Free Shipping", "✦ Top Rated", "Easy Returns", "Secure Checkout",
  "24/7 Support", "New Arrivals Weekly", "Premium Brands", "Price Match",
];
const Marquee = ({ isDark }) => {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={`overflow-hidden py-3 border-y ${isDark ? "border-white/10" : "border-black/8"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear", paused }}
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className={`text-xs font-semibold tracking-[0.18em] uppercase flex-shrink-0 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
            style={FONT_DISPLAY}
          >
            {item}
            <span
              className="ml-10"
              style={{ color: isDark ? "#e8ff47" : "#6366f1", opacity: 0.7 }}
            >
              ✦
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/* ── Category SVG icons ─────────────────────────────────────── */
const IconLaptop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M1 21h22" />
  </svg>
);
const IconWatch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <circle cx="12" cy="12" r="5" /><path d="M12 7V3M12 21v-4" strokeWidth="2.2" /><path d="M9 3h6M9 21h6" />
  </svg>
);
const IconMobile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M10 6h4" /><circle cx="12" cy="17" r="1" />
  </svg>
);
const IconHeadphones = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M3 18v-6a9 9 0 0118 0v6" />
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
  </svg>
);
const IconBag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M16 11V7a4 4 0 00-8 0v4" /><rect x="3" y="11" width="18" height="11" rx="2" />
  </svg>
);
const IconGift = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <rect x="3" y="8" width="18" height="4" rx="1" /><rect x="5" y="12" width="14" height="9" rx="1" />
    <path d="M12 8v13M8 8a2 2 0 010-4c2 0 4 4 4 4zM16 8a2 2 0 000-4c-2 0-4 4-4 4z" />
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" />
  </svg>
);
const IconReturn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M3 12a9 9 0 109-9H7" /><polyline points="7 9 7 3 1 3" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const CATS = [
  { label: "Laptops",     Icon: IconLaptop,     to: "/products" },
  { label: "Watches",     Icon: IconWatch,      to: "/products" },
  { label: "Mobiles",     Icon: IconMobile,     to: "/products" },
  { label: "Headphones",  Icon: IconHeadphones, to: "/products" },
  { label: "Accessories", Icon: IconBag,        to: "/products" },
  { label: "Gifts",       Icon: IconGift,       to: "/products" },
];

const FEATS = [
  { Icon: IconTruck,  title: "Free Delivery",  desc: "On orders over $50"    },
  { Icon: IconReturn, title: "Easy Returns",   desc: "30-day hassle-free"    },
  { Icon: IconShield, title: "Secure Payment", desc: "256-bit SSL encrypted"  },
  { Icon: IconChat,   title: "24/7 Support",   desc: "We\u2019re always here" },
];

/* ── Home ────────────────────────────────────────────────────── */
const Home = () => {
  const ref = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { sx: gcx, sy: gcy } = useGlobalCursor();
  const heroRef      = useRef(null);
  const heroCanvasRef = useHeroCanvas(heroRef, isDark);

  const watchRef   = useRef(null);
  const watchRotX  = useMotionValue(0);
  const watchRotY  = useMotionValue(0);
  const sWatchRotX = useSpring(watchRotX, { stiffness: 80, damping: 20 });
  const sWatchRotY = useSpring(watchRotY, { stiffness: 80, damping: 20 });
  const handleWatchMove = useCallback((e) => {
    const rect = watchRef.current?.getBoundingClientRect();
    if (!rect) return;
    watchRotX.set(-((e.clientY - rect.top)  / rect.height - 0.5) * 12);
    watchRotY.set( ((e.clientX - rect.left) / rect.width  - 0.5) * 12);
  }, [watchRotX, watchRotY]);
  const handleWatchLeave = useCallback(() => { watchRotX.set(0); watchRotY.set(0); }, [watchRotX, watchRotY]);

  const h1X  = useTransform(gcx, [0, 1], [-18, 18]);
  const h1Y  = useTransform(gcy, [0, 1], [-10, 10]);
  const subX = useTransform(gcx, [0, 1], [10, -10]);
  const subY = useTransform(gcy, [0, 1], [6, -6]);
  const tagX = useTransform(gcx, [0, 1], [-8, 8]);
  const tagY = useTransform(gcy, [0, 1], [5, -5]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const desktopY      = useTransform(scrollYProgress, [0, 1.3], [550, 0]);
  const desktopRotate = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const desktopScale  = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const mobileY       = useTransform(scrollYProgress, [0, 1], [-60, 1000]);
  const mobileRotate  = useTransform(scrollYProgress, [1, 0], [0, 15]);
  const mobileScale   = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <div className="min-h-screen overflow-hidden" style={FONT_BODY}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[calc(100vh-64px)] flex items-center justify-center text-center px-6 overflow-hidden"
      >
        {/* Aurora background mesh */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99,102,241,0.13) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(139,92,246,0.10) 0%, transparent 60%)"
              : "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(167,139,250,0.15) 0%, transparent 60%)",
          }}
        />

        {/* Canvas particle grid */}
        <canvas ref={heroCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: isDark ? 0.035 : 0.025,
          }}
        />

        {/* Ambient gradient orbs */}
        <div className={`absolute top-1/4 left-[8%] w-72 h-72 rounded-full blur-[120px] pointer-events-none ${isDark ? "bg-blue-500/15" : "bg-blue-400/20"}`} />
        <div className={`absolute bottom-1/4 right-[8%] w-64 h-64 rounded-full blur-[100px] pointer-events-none ${isDark ? "bg-violet-500/12" : "bg-violet-400/18"}`} />

        {/* Hero text */}
        <div className="relative z-10 max-w-3xl -mt-8 sm:-mt-20 md:-mt-46 flex flex-col items-center">
          <motion.p
            style={{ x: tagX, y: tagY, ...FONT_DISPLAY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm uppercase tracking-[0.22em] mb-4 font-semibold text-gray-500 dark:text-gray-400"
          >
            Welcome to Zhop
          </motion.p>

          <motion.h1
            style={{ x: h1X, y: h1Y, ...FONT_DISPLAY, perspective: 600 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 text-blue-600 dark:text-yellow-300"
          >
            <SplitHeading text="Shop the Future" />
          </motion.h1>

          <motion.p
            style={{ x: subX, y: subY, ...FONT_BODY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-gray-600 dark:text-gray-300 font-light tracking-wide"
          >
            Scroll to explore.
          </motion.p>
        </div>

        {/* Scroll cue — mouse with bouncing dot */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <svg
            width="22" height="36" viewBox="0 0 22 36" fill="none"
            style={{ color: isDark ? "rgba(232,255,71,0.5)" : "#6366f1" }}
          >
            <rect x="1" y="1" width="20" height="34" rx="10" stroke="currentColor" strokeWidth="1.4" />
            <motion.rect
              x="9.5" y="6" width="3" height="9" rx="1.5"
              fill="currentColor"
              animate={{ y: [6, 16, 6], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────── */}
      <Marquee isDark={isDark} />

      {/* ── PRODUCT STORY ────────────────────────────────────── */}
      <section ref={ref} className="relative min-h-[190vh] md:min-h-[60vh]">

        {/* MOBILE */}
        <div className="md:hidden px-6 py-8 flex flex-col gap-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 dark:text-gray-400" style={FONT_DISPLAY}>New Drop</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2" style={FONT_DISPLAY}>SmartWatch Elite</h3>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 mt-3 font-light" style={FONT_BODY}>
              Precision-crafted for those who move fast. Health tracking, notifications, and style — all on your wrist.
            </p>
          </div>
          <div className="flex justify-center gap-8">
            <Stat value="50m" label="Water Resistance" />
            <Stat value="7d"  label="Battery Life" delay={0.1} />
            <Stat value="$399" label="Starting Price" delay={0.2} />
          </div>
        </div>

        {/* LEFT TEXT — desktop */}
        <div className="sticky top-[20vh] h-0 flex items-start z-40 pointer-events-none">
          <div className="hidden md:flex absolute left-[10%] flex-col gap-6 max-w-xs pt-10">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 dark:text-gray-400" style={FONT_DISPLAY}>New Drop</p>
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight" style={FONT_DISPLAY}>SmartWatch Elite</h3>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 font-light" style={FONT_BODY}>
              Precision-crafted for those who move fast.
              Health tracking, notifications, and style —
              all on your wrist.
            </p>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300 font-light" style={FONT_BODY}>
              <li>⟶ Heart rate &amp; sleep tracking</li>
              <li>⟶ 7-day battery life</li>
              <li>⟶ Water resistant up to 50m</li>
            </ul>
          </div>
          <div className="hidden md:flex absolute right-[10%] flex-col gap-8 max-w-xs pt-10">
            <Stat value="50m" label="Water Resistance" />
            <div className="w-10 h-px bg-gray-200 dark:bg-gray-800" />
            <Stat value="7d" label="Battery Life" delay={0.1} />
            <div className="w-10 h-px bg-gray-200 dark:bg-gray-800" />
            <Stat value="$399" label="Starting Price" delay={0.2} />
          </div>
        </div>

        {/* WATCH — MOBILE */}
        <div className="md:hidden w-full flex justify-center px-6">
          <div className="sticky top-[25vh] h-[300px] flex items-center justify-center z-50 w-full">
            <motion.img
              src="/images/watch-nobg.png"
              style={{ y: mobileY, rotate: mobileRotate, scale: mobileScale }}
              className="w-[330px] drop-shadow-2xl pointer-events-none"
            />
          </div>
        </div>

        {/* WATCH — DESKTOP */}
        <div ref={watchRef} onMouseMove={handleWatchMove} onMouseLeave={handleWatchLeave} className="hidden md:flex w-full justify-center px-6">
          <div className="sticky top-[20vh] h-[450px] flex items-start justify-center z-50 w-full">
            <motion.img
              src="/images/watch-nobg.png"
              style={{ y: desktopY, rotate: desktopRotate, scale: desktopScale, rotateX: sWatchRotX, rotateY: sWatchRotY, perspective: 800 }}
              className="w-[380px] drop-shadow-2xl pointer-events-none"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
      <section className="py-8 px-6 relative z-10 -mt-[90vh] md:mt-0">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-extrabold text-center mb-12 text-gray-900 dark:text-gray-100"
          style={FONT_DISPLAY}
        >
          Featured Products
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 px-4 sm:px-10 md:px-20 justify-items-center">
          {[
            { image: "/images/laptop.png",    name: "UltraBook Pro",    price: "$1299", delay: 0   },
            { image: "/images/watch.png",      name: "SmartWatch Elite", price: "$399",  delay: 0.1 },
            { image: "/images/headphones.png", name: "Headphones",       price: "$399",  delay: 0.2 },
          ].map(({ image, name, price, delay }) => (
            <motion.div key={name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay, duration: 0.55 }}
              className="w-full max-w-xs"
            >
              <ProductCard image={image} name={name} price={price} isDark={isDark} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ─────────────────────────────────── */}
      <section className="py-16 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl font-extrabold text-center mb-10 text-gray-900 dark:text-gray-100"
          style={FONT_DISPLAY}
        >
          Shop by Category
        </motion.h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-3xl mx-auto">
          {CATS.map(({ label, Icon, to }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ y: -5, scale: 1.04 }}
            >
              <Link
                to={to}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 group ${
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <span className={`transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-6 inline-block ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  <Icon />
                </span>
                <span className={`text-xs font-semibold tracking-wide ${isDark ? "text-gray-300" : "text-gray-700"}`} style={FONT_DISPLAY}>
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────── */}
      <section className={`py-14 px-6 ${isDark ? "bg-white/3" : "bg-gray-50"}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {FEATS.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.09, duration: 0.45 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <span className={isDark ? "text-blue-400" : "text-blue-600"}><Icon /></span>
              <p className="font-bold text-sm text-gray-900 dark:text-gray-100" style={FONT_DISPLAY}>{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light" style={FONT_BODY}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA — always dark, dramatic finale ───────────────── */}
      <section
        className="py-12 sm:py-24 text-center px-6 relative overflow-hidden"
        style={{ background: "#07070f" }}
      >
        {/* Aurora glow behind CTA */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)" }}
          />
        </div>
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white"
            style={FONT_DISPLAY}
          >
            Ready to experience the future?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 sm:mb-14 text-lg font-light text-gray-400"
            style={FONT_BODY}
          >
            Create your account in seconds and start exploring.
          </motion.p>
          <MagneticBtn to="/signup" isDark={true}>
            Get Started — It&apos;s Free
          </MagneticBtn>
        </div>
      </section>

    </div>
  );
};

export default Home;