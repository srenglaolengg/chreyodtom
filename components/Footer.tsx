import React from "react";
import { Language } from "../types";
import { DharmaWheelIcon } from "./icons/DharmaWheelIcon";
import { Link, useLocation } from "react-router-dom";
import { FacebookIcon } from "./icons/FacebookIcon";
import { TelegramIcon } from "./icons/TelegramIcon";
import { LocationPinIcon } from "./icons/LocationPinIcon";
import { PhoneIcon } from "./icons/PhoneIcon";
import { EmailIcon } from "./icons/EmailIcon";

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

  const linkClass =
    "text-gray-600 hover:text-amber-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 rounded-sm";

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-800 text-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {/* Column 1: About */}
          <section aria-labelledby="footer-about" className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <DharmaWheelIcon className="w-6 h-6 text-amber-600" />
              <Link
                to="/"
                className={`font-bold text-lg text-gray-900 ${
                  language === "km" ? "font-khmer" : ""
                }`}
              >
                {currentContent.title}
              </Link>
            </div>
            <p
              id="footer-about"
              className={`text-gray-600 mt-2 leading-relaxed text-center sm:text-left ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.about}
            </p>
          </section>

          {/* Column 2: Quick Links */}
          <nav aria-labelledby="footer-links" className="w-full">
            <h3
              id="footer-links"
              className={`text-md font-semibold text-gray-900 mb-3 text-center sm:text-left ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.quickLinks}
            </h3>
            <ul className="flex flex-wrap justify-center sm:justify-start gap-3">
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

          {/* Column 3: Contact Us */}
          <address aria-labelledby="footer-contact" className="not-italic lg:col-span-2">
            <h3
              id="footer-contact"
              className={`text-md font-semibold text-gray-900 mb-3 ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.contactUs}
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-2">
                <LocationPinIcon className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                <span className={`${language === "km" ? "font-khmer" : ""}`} aria-label="Address">
                  {currentContent.address}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <PhoneIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                <a href={`tel:${currentContent.phone}`} className={linkClass} aria-label="Phone number">
                  {currentContent.phone}
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <EmailIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                <a href={`mailto:${currentContent.email}`} className={linkClass} aria-label="Email address">
                  {currentContent.email}
                </a>
              </li>
            </ul>
          </address>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-y-4">
          <p className={`text-gray-500 text-center sm:text-left ${language === "km" ? "font-khmer" : ""}`}>
            {currentContent.copyright}
          </p>
          <div className="flex items-center space-x-4">
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              className="text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Telegram"
              className="text-gray-500 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full transition-colors"
            >
              <TelegramIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;