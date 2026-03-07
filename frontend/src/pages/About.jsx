const About = () => {
  return (
    <div className="min-h-screen px-6 py-12 bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
            About ShopEase
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            ShopEase is a modern e-commerce platform that allows users to
            explore, search, review, and purchase products seamlessly.  
            The system provides powerful product management, intelligent
            search capabilities, and a secure user experience.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Product Management */}
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E]">
            <h2 className="text-xl font-semibold mb-2">
              Product Management
            </h2>

            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• View all available products</li>
              <li>• Add new products with images</li>
              <li>• Update product details</li>
              <li>• Delete products</li>
              <li>• Track product stock</li>
            </ul>
          </div>

          {/* Search & Filtering */}
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E]">
            <h2 className="text-xl font-semibold mb-2">
              Smart Product Search
            </h2>

            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• Search products by name</li>
              <li>• Filter by category</li>
              <li>• Filter by price range</li>
              <li>• Sort by latest products</li>
            </ul>
          </div>

          {/* Reviews */}
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E]">
            <h2 className="text-xl font-semibold mb-2">
              Product Reviews
            </h2>

            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• Users can rate products (1–5 stars)</li>
              <li>• Leave comments on products</li>
              <li>• Update existing reviews</li>
              <li>• View all reviews for each product</li>
            </ul>
          </div>

          {/* Shopping Features */}
          <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E]">
            <h2 className="text-xl font-semibold mb-2">
              Shopping Experience
            </h2>

            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• Add products to cart</li>
              <li>• Add products to wishlist</li>
              <li>• View product details</li>
              <li>• Track product availability</li>
            </ul>
          </div>

        </div>

        {/* Footer Section */}
        <div className="pt-6 border-t border-gray-200 dark:border-white/10">
          <p className="text-gray-500 dark:text-gray-400">
            ShopEase is designed with scalability and user experience in mind,
            combining modern web technologies with a clean interface to deliver
            a seamless online shopping platform.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;