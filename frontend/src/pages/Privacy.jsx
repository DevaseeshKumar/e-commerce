import { injectCustomFonts, FONT_DISPLAY, FONT_BODY } from "../utils/fonts";

injectCustomFonts();

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, shipping address, and payment information. We also automatically collect certain information when you use our services, including log data, device information, and cookies.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to process transactions, send order confirmations and updates, provide customer support, send promotional communications (with your consent), improve our services, and comply with legal obligations. We do not sell your personal information to third parties.`,
  },
  {
    title: "Information Sharing",
    content: `We may share your information with trusted third-party service providers who assist us in operating our platform — such as payment processors and shipping partners — under strict confidentiality agreements. We may also disclose information if required by law or to protect the rights and safety of Zhop and its users.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal information, including SSL encryption for data transmission and secure storage. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "Cookies",
    content: `We use cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features may not function properly without cookies.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to access, update, or delete your personal information at any time through your account settings. You may also opt out of promotional emails by clicking "unsubscribe" in any marketing email. For any privacy-related requests, contact us at privacy@zhop.com.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date. Your continued use of our services after such changes constitutes acceptance of the updated policy.`,
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Effective date: January 1, 2025</p>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            At Zhop, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-bold shrink-0">
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
          Questions about this policy? Email us at{" "}
          <a href="mailto:privacy@zhop.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            privacy@zhop.com
          </a>
        </div>

      </div>
    </div>
  );
};

export default Privacy;
