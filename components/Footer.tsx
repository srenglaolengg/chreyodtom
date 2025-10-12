import React from "react";
import { Language } from "../types";
import { Link } from "react-router-dom";

interface FooterProps {
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const year = new Date().getFullYear();

  const content = {
    en: {
      title: "Wat Serei Mongkol",
      about: "A beacon of spiritual heritage and tranquility, serving as a center for Buddhist teachings and cultural preservation.",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      address: "Chray Ut Dom village, Krang Tayong commune, Peam Chor district, Prey Veng province, Cambodia",
      phone: "+85512345678",
      email: "contact@watsereimongkol.org",
      copyright: `© ${year} Wat Serei Mongkol Hou Chray Ut Dom. All Rights Reserved.`,
    },
    km: {
      title: "វត្តសិរីមង្គល",
      about: "ជាប្រទីបនៃបេតិកភណ្ឌខាងវិញ្ញាណ និងភាពស្ងប់ស្ងាត់ បម្រើជាមជ្ឈមណ្ឌលអប់រំព្រះពុទ្ធសាសនា និងការអភិរក្សវប្បធម៌។",
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

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <section>
            <h3 className={language === "km" ? "font-khmer" : ""}>{currentContent.title}</h3>
            <p className={language === "km" ? "font-khmer" : ""}>{currentContent.about}</p>
          </section>

          <nav>
            <h3 className={language === "km" ? "font-khmer" : ""}>{currentContent.quickLinks}</h3>
            <ul style={{ listStyle: 'none' }}>
              {currentLinks.map((link) => (
                <li key={link.path} style={{ marginBottom: '0.5rem' }}>
                  <Link to={link.path} className={language === "km" ? "font-khmer" : ""}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address style={{ fontStyle: 'normal' }}>
            <h3 className={language === "km" ? "font-khmer" : ""}>{currentContent.contactUs}</h3>
            <ul style={{ listStyle: 'none' }}>
              <li className={language === 'km' ? 'font-khmer' : ''} style={{ marginBottom: '0.5rem' }}>
                {currentContent.address}
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href={`tel:${currentContent.phone}`}>{currentContent.phone}</a>
              </li>
              <li>
                <a href={`mailto:${currentContent.email}`}>{currentContent.email}</a>
              </li>
            </ul>
          </address>
        </div>

        <div className="footer-copyright">
          <p className={language === "km" ? "font-khmer" : ""}>
            {currentContent.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;