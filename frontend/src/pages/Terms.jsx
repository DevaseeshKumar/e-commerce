const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using Zhop, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. These terms apply to all users of the site, including browsers, vendors, customers, and contributors of content.`,
  },
  {
    title: "Use of the Platform",
    content: `You may use Zhop only for lawful purposes and in accordance with these Terms. You agree not to use the platform in any way that violates applicable laws, transmits unsolicited or unauthorized advertising, impersonates any person or entity, or interferes with the normal operation of the site. We reserve the right to terminate access to users who violate these terms.`,
  },
  {
    title: "Account Registration",
    content: `To access certain features, you must register for an account. You agree to provide accurate, current, and complete information and to keep your account credentials secure. You are responsible for all activities that occur under your account. Notify us immediately at support@zhop.com if you suspect unauthorized use of your account.`,
  },
  {
    title: "Orders and Payments",
    content: `By placing an order, you represent that you are of legal age to enter a binding contract. All prices are listed in Indian Rupees (INR) and are subject to change without notice. We reserve the right to refuse or cancel any order at our discretion. Payment must be received in full before an order is processed and dispatched.`,
  },
  {
    title: "Shipping and Returns",
    content: `We aim to dispatch orders within 2–3 business days. Delivery timelines may vary based on location. If you receive a damaged or incorrect item, contact us within 48 hours of delivery. Eligible returns will be processed within 7–10 business days of receiving the returned item in its original condition.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on Zhop — including text, graphics, logos, images, and software — is the property of Zhop or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit written permission.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by law, Zhop shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the platform. Our total liability for any claims arising from your use of the service shall not exceed the amount you paid for the specific product or service in question.`,
  },
  {
    title: "Changes to Terms",
    content: `We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the platform after any modifications constitutes your acceptance of the new Terms. We encourage you to review this page periodically.`,
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: January 1, 2025</p>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Please read these Terms of Service carefully before using Zhop. These terms govern your access to and use of our platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500">
          Questions about these terms? Email us at{" "}
          <a href="mailto:legal@zhop.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            legal@zhop.com
          </a>
        </div>

      </div>
    </div>
  );
};

export default Terms;
