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

  // ✅ SSR-safe share URL
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

  // Content dictionary
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

  // ✅ Shared link styles (focus + hover)
  const linkClass =
    "text-muted-foreground hover:text-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm";

  return (
    <footer
      /* Styling Change: Updated footer background and text colors to match the new palette. */
      className="bg-secondary/50 border-t border-border text-foreground"
      aria-label="Website Footer"
    >
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 text-left">
          {/* Column 1: About */}
          <section aria-labelledby="footer-about" className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-start space-x-3">
              <DharmaWheelIcon className="w-8 h-8 text-primary" />
              <Link
                to="/"
                className={`font-bold text-xl text-foreground ${
                  language === "km" ? "font-khmer" : ""
                }`}
              >
                {currentContent.title}
              </Link>
            </div>
            <p
              id="footer-about"
              className={`text-muted-foreground mt-4 leading-relaxed ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.about}
            </p>
          </section>

          {/* Column 2: Quick Links */}
          <nav aria-labelledby="footer-links">
            <h3
              id="footer-links"
              className={`text-lg font-semibold text-foreground mb-4 ${
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

          {/* Column 3: Contact Us */}
          <address aria-labelledby="footer-contact" className="not-italic lg:col-span-2">
            <h3
              id="footer-contact"
              className={`text-lg font-semibold text-foreground mb-4 ${
                language === "km" ? "font-khmer" : ""
              }`}
            >
              {currentContent.contactUs}
            </h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start space-x-3">
                <LocationPinIcon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span
                  className={`${language === "km" ? "font-khmer" : ""}`}
                  aria-label="Address"
                >
                  {currentContent.address}
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <a
                  href={`tel:${currentContent.phone}`}
                  className={linkClass}
                  aria-label="Phone number"
                >
                  {currentContent.phone}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <EmailIcon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <a
                  href={`mailto:${currentContent.email}`}
                  className={linkClass}
                  aria-label="Email address"
                >
                  {currentContent.email}
                </a>
              </li>
            </ul>
          </address>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-y-6">
          <p
            className={`text-sm text-muted-foreground text-center sm:text-left ${
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
              className="text-muted-foreground hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
            >
              <FacebookIcon className="w-6 h-6" />
            </a>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Telegram"
              className="text-muted-foreground hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full transition-colors"
            >
              <TelegramIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;