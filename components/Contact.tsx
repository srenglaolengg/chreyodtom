
import React from 'react';
import { Language, ContactInfo } from '../types';
import { LocationPinIcon } from './icons/LocationPinIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { EmailIcon } from './icons/EmailIcon';
import { LotusIcon } from './icons/LotusIcon';
import PageMeta from './PageMeta';
import { useDocument } from '../hooks/useDocument';

interface ContactProps {
  language: Language;
}

const metaContent = {
  en: {
    title: 'Contact Us | Wat Serei Mongkol',
    description: 'Find our location, contact information, and a map to plan your visit to Wat Serei Mongkol Hou Chray Ut Dom in Prey Veng, Cambodia.',
    keywords: 'Contact Wat Serei Mongkol, Pagoda Address, Visit Pagoda, Map',
  },
  km: {
    title: 'ទំនាក់ទំនង | វត្តសិរីមង្គល',
    description: 'ស្វែងរកទីតាំង ព័ត៌មានទំនាក់ទំនង និងផែនទីដើម្បីរៀបចំគម្រោងទស្សនកិច្ចរបស់អ្នកមកកាន់វត្តសិរីមង្គលហៅជ្រៃឧត្តម នៅខេត្តព្រៃវែង។',
    keywords: 'ទំនាក់ទំនងវត្ត, អាសយដ្ឋានវត្ត, ទស្សនាវត្ត, ផែនទី',
  }
};

const Contact: React.FC<ContactProps> = ({ language }) => {
    const { data: info, loading } = useDocument<ContactInfo & { id: string }>('pages', 'contact');

    const content = {
        en: {
            title: "Visit Us",
            address: info?.address_en,
            phone: info?.phone,
            email: info?.email,
            button: "Plan Your Visit"
        },
        km: {
            title: "ទំនាក់ទំនង",
            address: info?.address_km,
            phone: info?.phone, // Assuming phone and email are language-agnostic
            email: info?.email,
            button: "រៀបចំផែនការទស្សនកិច្ចរបស់អ្នក"
        }
    }
    const currentContent = content[language];
    const currentMeta = metaContent[language];
  return (
    <>
      <PageMeta 
        title={currentMeta.title}
        description={currentMeta.description}
        keywords={currentMeta.keywords}
      />
      <section id="contact" className="py-20 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {currentContent.title}
              </h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/2">
                  <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                      {loading ? <p>Loading contact info...</p> : info ? (
                        <>
                          <div className="flex items-start space-x-4">
                              <LocationPinIcon className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                              <p className={`${language === 'km' ? 'font-khmer' : ''}`}>{currentContent.address}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                              <PhoneIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                              <a href={`tel:${currentContent.phone}`} className="hover:text-amber-700">{currentContent.phone}</a>
                          </div>
                          <div className="flex items-center space-x-4">
                              <EmailIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                              <a href={`mailto:${currentContent.email}`} className="hover:text-amber-700">{currentContent.email}</a>
                          </div>
                          <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center space-x-2 w-full mt-6 bg-amber-500 text-white px-6 py-3 rounded-full hover:bg-amber-600 transition-colors shadow-md text-lg font-semibold ${language === 'km' ? 'font-khmer' : ''}`}>
                              <LotusIcon className="w-5 h-5" />
                              <span>{currentContent.button}</span>
                          </a>
                        </>
                      ) : <p>Contact info could not be loaded.</p>}
                  </div>
              </div>
              <div className="lg:w-1/2 h-80 lg:h-auto rounded-lg shadow-lg overflow-hidden">
                  <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2448517.3097365843!2d106.81625760642393!3d15.909701021967841!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310bcf0006805b1b%3A0xea9539e131d76908!2z4Z6c4Z6P4Z-S4Z6P4Z6f4Z634Z6a4Z644Z6Y4Z6E4Z-S4Z6C4Z6bIOGeoOGfheGeh-GfkuGemuGfg-Gep-Gej-GfkuGej-GemA!5e1!3m2!1skm!2skh!4v1757831086635!5m2!1skm!2skh"
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={true}
                      loading="lazy"
                      title="Pagoda Location Map"
                  ></iframe>
              </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;