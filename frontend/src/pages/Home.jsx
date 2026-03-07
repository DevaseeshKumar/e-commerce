import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const Home = () => {

  const { theme } = useTheme();

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  /* smoother drop distance */
  const headphoneY = useTransform(scrollYProgress, [0, 1], [550, 0])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 15])
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1])

  return (
    <div className="min-h-screen overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center text-center px-6">

        <div className="relative z-10 max-w-3xl -mt-46">

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm uppercase tracking-widest mb-4 text-gray-500 dark:text-gray-400"
          >
            Welcome to ShopEasy
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-7xl font-bold leading-tight mb-6 text-gray-900 dark:text-gray-100"
          >
            Shop the Future
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            Scroll to explore.
          </motion.p>

        </div>
      </section>


      {/* PRODUCT STORY */}
      <section ref={ref} className="relative min-h-[60vh]">

        {/* LEFT TEXT */}
        <div className="sticky top-[20vh] h-0 flex items-start z-40 pointer-events-none">

          <div className="absolute left-[10%] flex flex-col gap-6 max-w-xs pt-10">

            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
              New Drop
            </p>

            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              SmartWatch Elite
            </h3>

            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
              Precision-crafted for those who move fast.
              Health tracking, notifications, and style —
              all on your wrist.
            </p>

            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li>⟶ Heart rate & sleep tracking</li>
              <li>⟶ 7-day battery life</li>
              <li>⟶ Water resistant up to 50m</li>
            </ul>

          </div>


          {/* RIGHT STATS */}
          <div className="absolute right-[10%] flex flex-col gap-8 max-w-xs pt-10">

            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">50m</p>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                Water Resistance
              </p>
            </div>

            <div className="w-10 h-px bg-gray-200 dark:bg-gray-800" />

            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">7d</p>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                Battery Life
              </p>
            </div>

            <div className="w-10 h-px bg-gray-200 dark:bg-gray-800" />

            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">$399</p>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                Starting Price
              </p>
            </div>

          </div>

        </div>


        {/* WATCH */}
        <div className="w-full flex justify-center px-6">

          <div className="sticky top-[20vh] h-[450px] flex items-start justify-center z-50 w-full">

            <motion.img
              src="/images/watch-nobg.png"
              style={{ y: headphoneY, rotate, scale }}
              className="w-[380px] drop-shadow-2xl pointer-events-none"
            />

          </div>

        </div>

      </section>


      {/* PRODUCTS */}
      <section className="py-8 px-6 relative z-10">

        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          Featured Products
        </h2>

        <div className="flex justify-center items-end gap-12 px-20">

          <ProductCard
            image="/images/laptop.png"
            name="UltraBook Pro"
            price="$1299"
          />

          <ProductCard
            image="/images/watch.png"
            name="SmartWatch Elite"
            price="$399"
          />

          <ProductCard
            image="/images/headphones.png"
            name="Headphones"
            price="$399"
          />

        </div>
      </section>


      {/* CTA */}
      <section className="py-24 text-center">

        <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Ready to experience the future?
        </h2>

        <p className="mb-14 text-lg text-gray-600 dark:text-gray-300">
          Create your account in seconds and start exploring.
        </p>

        <Link 
          to="/signup"
          className="inline-block px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Get Started — It's Free
        </Link>

      </section>

    </div>
  );
};


const ProductCard = ({ image, name, price }) => (
  <div className="flex flex-col items-center gap-6">
    <img src={image} className="w-80 drop-shadow-2xl" />
    <p className="font-semibold text-xl text-gray-900 dark:text-gray-100">{name}</p>
    <p className="text-gray-600 dark:text-gray-300">{price}</p>
  </div>
);




export default Home;