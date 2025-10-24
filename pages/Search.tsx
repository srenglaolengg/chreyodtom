import React, { useState, useEffect } from 'react';
// FIX: Replaced useSearchParams with useLocation for react-router-dom v5 compatibility.
import { useLocation, Link } from 'react-router-dom';
import { Language, Post, Event, Teaching, GalleryAlbum } from '../types';
import { useCollection } from '../hooks/useCollection';
import PageMeta from '../components/PageMeta';

interface SearchProps {
    language: Language;
}

type SearchResult = {
    id: string;
    type: 'post' | 'event' | 'teaching' | 'album';
    title: string;
    description: string;
    link: string;
    imageUrl?: string;
};

const Search: React.FC<SearchProps> = ({ language }) => {
    // FIX: Use useLocation and URLSearchParams to get search query for v5 compatibility.
    const { search } = useLocation();
    const query = new URLSearchParams(search).get('q') || '';
    const [results, setResults] = useState<SearchResult[]>([]);

    const { data: posts, loading: loadingPosts } = useCollection<Post>('posts');
    const { data: events, loading: loadingEvents } = useCollection<Event>('events');
    const { data: teachings, loading: loadingTeachings } = useCollection<Teaching>('teachings');
    const { data: albums, loading: loadingAlbums } = useCollection<GalleryAlbum>('gallery');

    const loading = loadingPosts || loadingEvents || loadingTeachings || loadingAlbums;

    useEffect(() => {
        if (loading || !query) {
            setResults([]);
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        
        const filteredPosts: SearchResult[] = posts
            .filter(p => p.title.toLowerCase().includes(lowerCaseQuery) || p.content.toLowerCase().includes(lowerCaseQuery))
            .map(p => ({
                id: p.id, type: 'post', title: p.title, description: p.content.substring(0, 150) + '...', link: `/feed#post-${p.id}`, imageUrl: p.imageUrl
            }));

        const filteredEvents: SearchResult[] = events
            .filter(e => (e.title_en.toLowerCase().includes(lowerCaseQuery) || e.title_km.toLowerCase().includes(lowerCaseQuery) || e.content_en.toLowerCase().includes(lowerCaseQuery) || e.content_km.toLowerCase().includes(lowerCaseQuery)))
            .map(e => ({
                id: e.id, type: 'event', title: language === 'km' ? e.title_km : e.title_en, description: (language === 'km' ? e.description_km : e.description_en).substring(0, 150) + '...', link: `/events/${e.id}`, imageUrl: e.imgSrc
            }));

        const filteredTeachings: SearchResult[] = teachings
            .filter(t => (t.title_en.toLowerCase().includes(lowerCaseQuery) || t.title_km.toLowerCase().includes(lowerCaseQuery) || t.content_en.toLowerCase().includes(lowerCaseQuery) || t.content_km.toLowerCase().includes(lowerCaseQuery)))
            .map(t => ({
                id: t.id, type: 'teaching', title: language === 'km' ? t.title_km : t.title_en, description: (language === 'km' ? t.excerpt_km : t.excerpt_en).substring(0, 150) + '...', link: `/teachings/${t.id}`, imageUrl: t.thumbnailUrl
            }));

        const filteredAlbums: SearchResult[] = albums
            .filter(a => (a.title_en.toLowerCase().includes(lowerCaseQuery) || a.title_km.toLowerCase().includes(lowerCaseQuery) || a.content_en.toLowerCase().includes(lowerCaseQuery) || a.content_km.toLowerCase().includes(lowerCaseQuery)))
            .map(a => ({
                id: a.id, type: 'album', title: language === 'km' ? a.title_km : a.title_en, description: (language === 'km' ? a.description_km : a.description_en).substring(0, 150) + '...', link: `/gallery/${a.id}`, imageUrl: a.thumbnailUrl
            }));
            
        setResults([...filteredPosts, ...filteredEvents, ...filteredTeachings, ...filteredAlbums]);

    }, [query, posts, events, teachings, albums, loading, language]);

    const content = {
        en: {
            title: `Search Results for "${query}"`, pageTitle: 'Search | Wat Serei Mongkol', noResults: 'No results found for your search.', placeholder: 'Start a new search to see results.', typePost: 'News', typeEvent: 'Event', typeTeaching: 'Teaching', typeAlbum: 'Gallery Album',
        },
        km: {
            title: `លទ្ធផលស្វែងរកសម្រាប់ «${query}»`, pageTitle: 'ស្វែងរក | វត្តសិរីមង្គល', noResults: 'រកមិនឃើញលទ្ធផលសម្រាប់ការស្វែងរករបស់អ្នកទេ។', placeholder: 'ចាប់ផ្តើមការស្វែងរកថ្មីដើម្បីមើលលទ្ធផល។', typePost: 'ព័ត៌មាន', typeEvent: 'ពិធីបុណ្យ', typeTeaching: 'ព្រះធម៌', typeAlbum: 'អាល់ប៊ុមរូបភាព',
        }
    };
    const currentContent = content[language];
    
    const getTypeLabel = (type: SearchResult['type']) => {
        switch (type) {
            case 'post': return currentContent.typePost;
            case 'event': return currentContent.typeEvent;
            case 'teaching': return currentContent.typeTeaching;
            case 'album': return currentContent.typeAlbum;
        }
    }

    return (
        <>
            <PageMeta title={currentContent.pageTitle} description={`Search results for ${query}`} />
            <section style={{ backgroundColor: 'var(--surface-color)', minHeight: '60vh' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '3rem' }}>
                        <h1 className={language === 'km' ? 'font-khmer' : ''}>
                            {query ? currentContent.title : (language === 'km' ? 'ស្វែងរក' : 'Search')}
                        </h1>
                    </div>
                    
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {loading && <p>Loading results...</p>}

                        {!loading && results.length > 0 && (
                            <div>
                                {results.map(result => (
                                    <Link key={`${result.type}-${result.id}`} to={result.link} className="card" style={{ marginBottom: '1.5rem', display: 'block' }}>
                                        <div className="card-content" style={{ display: 'flex', alignItems: 'center' }}>
                                            {result.imageUrl && <img src={result.imageUrl} alt={result.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.25rem', marginRight: '1.5rem', flexShrink: 0 }} />}
                                            <div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} className={language === 'km' ? 'font-khmer' : ''}>{getTypeLabel(result.type)}</p>
                                                <h3 className={language === 'km' ? 'font-khmer' : ''} style={{ marginBottom: '0.25rem' }}>{result.title}</h3>
                                                <p className={language === 'km' ? 'font-khmer' : ''}>{result.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                        
                        {!loading && results.length === 0 && query && (
                             <div className="text-center" style={{ padding: '2rem 0' }}>
                                <p className={language === 'km' ? 'font-khmer' : ''}>{currentContent.noResults}</p>
                             </div>
                        )}

                         {!loading && !query && (
                             <div className="text-center" style={{ padding: '2rem 0' }}>
                                <p className={language === 'km' ? 'font-khmer' : ''}>{currentContent.placeholder}</p>
                             </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Search;