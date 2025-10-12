
import React from "react";
import { Language } from "../types";
import { Link, useLocation } from "react-router-dom";

interface FooterProps {
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const year = new Date().getFullYear();
  const location = useLocation();

  const siteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const shareText =
    language === "km"
      ? "សូមទស្សនាគេហទំព័រវត្តសិរីមង្គល"
      : "Visit the Wat Serei Mongkol Website";

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    siteUrl
  )}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    siteUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const content = {
    en: {
      title: "Wat Serei Mongkol",
      about:
        "A beacon of spiritual heritage and tranquility, serving as a center for Buddhist teachings and cultural preservation.",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      address:
        "Chray Ut Dom village, Krang Tayong commune, Peam Chor district, Prey Veng province, Cambodia",
      phone: "+85512345678",
      email: "contact@watsereimongkol.org",
      copyright: `© ${year} Wat Serei Mongkol Hou Chray Ut Dom. All Rights Reserved.`,
    },
    km: {
      title: "វត្តសិរីមង្គល",
      about:
        "ជាប្រទីបនៃបេតិកភណ្ឌខាងវិញ្ញាណ និងភាពស្ងប់ស្ងាត់ បម្រើជាមជ្ឈមណ្ឌលអប់រំព្រះពុទ្ធសាសនា និងការអភិរក្សវប្បធម៌។",
      quickLinks: "តំណររហ័ស",
      contactUs: "ទំនាក់ទំនង",
      address: "ភូមិជ្រៃឧត្តម ឃុំក្រាំងតាយ៉ង ស្រុកពាមជរ ខេត្តព្រៃវែង",
      phone: "+៨៥៥១២៣៤៥៦៧៨",
      email: "contact@watsereimongkol.org",
      copyright: `© ${year} វត្តសិរីមង្គលហៅជ្រៃឧត្តម. រក្សាសិទ្ធិគ្រប់យ៉ាង។`,
    },
  } as const;

  const currentContent = content[language];

  const navLinks = {
    en: [
      { label: "About", path: "/about" },
      { label: "Feed", path: "/feed" },
      { label: "Events", path: "/events" },
      { label: "Gallery", path: "/gallery" },
      { label: "Teachings", path: "/teachings" },
      { label: "Comments", path: "/comments" },
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" },
      { label: "ព័ត៌មាន", path: "/feed" },
      { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "រូបភាព", path: "/gallery" },
      { label: "ព្រះធម៌", path: "/teachings" },
      { label: "មតិយោបល់", path: "/comments" },
    ],
  };

  const currentLinks = navLinks[language];

  const linkClass = "text-sm text-gray-600 hover:text-gray-900 transition-colors";

  return (
    <footer
      className="bg-gray-50 border-t border-gray-200"
      aria-label="Website Footer"
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-8 text-left">
          <section aria-labelledby="footer-about">
            <Link
              to="/"
              className={`font-bold text-lg text-gray-900 ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.title}
            </Link>
            <p
              id="footer-about"
              className={`text-sm mt-3 leading-relaxed text-gray-600 ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.about}
            </p>
          </section>

          <nav aria-labelledby="footer-links">
            <h3
              id="footer-links"
              className={`text-base font-semibold text-gray-900 mb-4 ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.quickLinks}
            </h3>
            <ul className="space-y-2">
              {currentLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`${language === "km" ? "font-khmer" : ""} ${linkClass}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address aria-labelledby="footer-contact" className="not-italic">
            <h3
              id="footer-contact"
              className={`text-base font-semibold text-gray-900 mb-4 ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.contactUs}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className={`${language === 'km' ? 'font-khmer' : ''} text-gray-600`}>
                  {currentContent.address}
                </span>
              </li>
              <li>
                <a href={`tel:${currentContent.phone}`} className={linkClass}>
                  {currentContent.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${currentContent.email}`} className={linkClass}>
                  {currentContent.email}
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-y-6">
          <p
            className={`text-xs text-gray-500 text-center sm:text-left ${
              language === "km" ? "font-khmer" : ""
            }`}
          >
            {currentContent.copyright}
          </p>
          <div className="flex items-center space-x-5">
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              className={linkClass}
            >
              Facebook
            </a>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Telegram"
              className={linkClass}
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;