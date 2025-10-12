import React from 'react';
import { Language, ContactInfo } from '../types';
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
      <section id="contact">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
              <h2 className={language === 'km' ? 'font-khmer' : ''}>
                  {currentContent.title}
              </h2>
          </div>
          <div className="grid grid-cols-2" style={{alignItems: 'center'}}>
              <div>
                  <div style={{ padding: '1rem' }}>
                      {loading ? (
                        <div>Loading...</div>
                      ) : info ? (
                        <>
                          <div>
                              <h3>Address</h3>
                              <p className={language === 'km' ? 'font-khmer' : ''}>{currentContent.address}</p>
                          </div>
                          <div style={{marginTop: '1.5rem'}}>
                              <h3>Phone</h3>
                              <a href={`tel:${currentContent.phone}`}>{currentContent.phone}</a>
                          </div>
                          <div style={{marginTop: '1.5rem'}}>
                              <h3>Email</h3>
                              <a href={`mailto:${currentContent.email}`}>{currentContent.email}</a>
                          </div>
                          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`btn btn-primary ${language === 'km' ? 'font-khmer' : ''}`} style={{marginTop: '2rem'}}>
                              {currentContent.button}
                          </a>
                        </>
                      ) : <p>Contact info could not be loaded.</p>}
                  </div>
              </div>
              <div style={{border: '1px solid var(--border-color)', borderRadius: '0.25rem', overflow: 'hidden', height: '400px'}}>
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
      </section>
    </>
  );
};

export default Contact;