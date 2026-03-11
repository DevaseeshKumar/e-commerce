import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ShopEasy
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your premium e-commerce destination. Shop smarter and discover
              products with a seamless experience.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">

            {/* Shop */}
            <div>
              <h3 className="text-xs font-semibold uppercase mb-3 text-gray-500 dark:text-gray-400">
                Shop
              </h3>

              <div className="space-y-2 text-sm flex flex-col">
                <Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  All Products
                </Link>

                <Link to="/wishlist" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  Wishlist
                </Link>

                <Link to="/orders" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  My Orders
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              

              <div className="space-y-2 text-sm flex flex-col">
                <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  Contact
                </Link>

                <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  Privacy Policy
                </Link>

                <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-200 dark:border-white/10">

          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {year} ShopEasy. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm">

            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Twitter
            </a>

            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Instagram
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;