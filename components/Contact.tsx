import React from 'react';
import { Language, ContactInfo } from '../types';
import { LotusIcon } from './icons/LotusIcon';
import PageMeta from './PageMeta';
import { useDocument } from '../hooks/useDocument';
import { MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

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
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=Wat+Serei+Mongkol+Hou+Chray+Ut+Dom,Prey+Veng,Cambodia`;

    const content = {
        en: {
            title: "Visit & Contact Us",
            address: info?.address_en,
            phone: info?.phone,
            email: info?.email,
            button: "View on Google Maps"
        },
        km: {
            title: "ទំនាក់ទំនង",
            address: info?.address_km,
            phone: info?.phone,
            email: info?.email,
            button: "មើលនៅលើផែនទី"
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
      {/* UI UPGRADE: Standardized vertical padding for consistent spacing. */}
      <motion.section 
        id="contact" 
        className="py-20 md:py-28 bg-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold text-amber-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {currentContent.title}
              </h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/2">
                  {/* Styling Change: Updated info box to match new card styling. */}
                  <div className="p-8 space-y-8 h-full">
                      {loading ? (
                        <div className="space-y-6 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ) : info ? (
                        <>
                          <div className="flex items-start space-x-4">
                              <MapPin className="w-7 h-7 text-amber-600 flex-shrink-0 mt-1" />
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">Address</h3>
                                <p className={`text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>{currentContent.address}</p>
                              </div>
                          </div>
                          <div className="flex items-start space-x-4">
                              <Phone className="w-7 h-7 text-amber-600 flex-shrink-0 mt-1" />
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">Phone</h3>
                                <a href={`tel:${currentContent.phone}`} className="hover:text-amber-600 transition-colors text-gray-600">{currentContent.phone}</a>
                              </div>
                          </div>
                          <div className="flex items-start space-x-4">
                              <Mail className="w-7 h-7 text-amber-600 flex-shrink-0 mt-1" />
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">Email</h3>
                                <a href={`mailto:${currentContent.email}`} className="hover:text-amber-600 transition-colors text-gray-600">{currentContent.email}</a>
                              </div>
                          </div>
                          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center space-x-2 w-full mt-6 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-all duration-300 shadow-lg transform hover:scale-105 text-lg font-semibold ${language === 'km' ? 'font-khmer' : ''}`}>
                              <MapPin className="w-5 h-5" />
                              <span>{currentContent.button}</span>
                          </a>
                        </>
                      ) : <p>Contact info could not be loaded.</p>}
                  </div>
              </div>
              {/* Styling Change: Added a subtle border to the map container. */}
              <div className="lg:w-1/2 h-80 lg:h-auto rounded-lg shadow-lg overflow-hidden border border-gray-200">
                  <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2448517.3097365843!2d106.81625760642393!3d15.909701021967841!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310bcf0006805b1b%3A0xea9539e131d76908!2z4Z6c4Z6P4Z-S4Z6P4Z6f4Z634Z6a4Z644Z6Y4Z6E4Z-S4Z6C4Z6bIOGeoOGfheGeh-GfkuGemuGfg-Gep-Gej-GfkuGej-GemA!5e1!3m2!1skm!2skh!4v1757831086635!5m2!1skm!2skh"
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen
                      loading="lazy"
                      title="Pagoda Location Map"
                  ></iframe>
              </div>
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default Contact;