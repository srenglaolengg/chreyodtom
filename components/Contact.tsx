import React from 'react';
import { Language, ContactInfo } from '../types';
import PageMeta from './PageMeta';
import { useDocument } from '../hooks/useDocument';

interface ContactProps {
  language: Language;
}

// FIX: Defined the missing metaContent constant.
const metaContent = {
  en: {
    title: 'Contact Us | Wat Serei Mongkol',
    description: 'Get in touch with Wat Serei Mongkol. Find our address, phone number, email, and location on Google Maps.',
    keywords: 'Contact Wat Serei Mongkol, Pagoda Address, Phone Number, Email, Map',
  },
  km: {
    title: 'ទំនាក់ទំនង | វត្តសិរីមង្គល',
    description: 'ទាក់ទងមកកាន់វត្តសិរីមង្គល។ ស្វែងរកអាសយដ្ឋាន លេខទូរស័ព្ទ អ៊ីមែល និងទីតាំងនៅលើផែនទី Google។',
    keywords: 'ទំនាក់ទំនងវត្តសិរីមង្គល, អាសយដ្ឋានវត្ត, លេខទូរស័ព្ទ, អ៊ីមែល, ផែនទី',
  }
};

const Contact: React.FC<ContactProps> = ({ language }) => {
    const { data: info, loading } = useDocument<ContactInfo & { id: string }>('pages', 'contact');
    
    // FIX: Replace with your actual Google Maps share link
    const mapUrl = `https://www.google.com/maps/place/YOUR_PLACE_HERE`; 

    // FIX: Replace with your actual Google Maps embed (iframe) src URL
    const mapEmbedUrl = `https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE_HERE`;

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
                      src={mapEmbedUrl} // Use the correct embed URL variable here
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