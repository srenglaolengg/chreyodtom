import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Language, Post, Event, Teaching, GalleryAlbum } from '../types';
import { useCollection } from '../hooks/useCollection';
import PageMeta from '../components/PageMeta';
import { Newspaper, Calendar, BookOpen, ImageIcon, Search as SearchIcon } from 'lucide-react';

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
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
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
            .filter(p => 
                p.title.toLowerCase().includes(lowerCaseQuery) ||
                p.content.toLowerCase().includes(lowerCaseQuery)
            )
            .map(p => ({
                id: p.id,
                type: 'post',
                title: p.title,
                description: p.content.substring(0, 150) + '...',
                link: `/feed#post-${p.id}`,
                imageUrl: p.imageUrl
            }));

        const filteredEvents: SearchResult[] = events
            .filter(e =>
                (e.title_en.toLowerCase().includes(lowerCaseQuery) ||
                e.title_km.toLowerCase().includes(lowerCaseQuery) ||
                e.content_en.toLowerCase().includes(lowerCaseQuery) ||
                e.content_km.toLowerCase().includes(lowerCaseQuery))
            )
            .map(e => ({
                id: e.id,
                type: 'event',
                title: language === 'km' ? e.title_km : e.title_en,
                description: (language === 'km' ? e.description_km : e.description_en).substring(0, 150) + '...',
                link: `/events/${e.id}`,
                imageUrl: e.imgSrc
            }));

        const filteredTeachings: SearchResult[] = teachings
            .filter(t =>
                (t.title_en.toLowerCase().includes(lowerCaseQuery) ||
                t.title_km.toLowerCase().includes(lowerCaseQuery) ||
                t.content_en.toLowerCase().includes(lowerCaseQuery) ||
                t.content_km.toLowerCase().includes(lowerCaseQuery))
            )
            .map(t => ({
                id: t.id,
                type: 'teaching',
                title: language === 'km' ? t.title_km : t.title_en,
                description: (language === 'km' ? t.excerpt_km : t.excerpt_en).substring(0, 150) + '...',
                link: `/teachings/${t.id}`,
                imageUrl: t.thumbnailUrl
            }));

        const filteredAlbums: SearchResult[] = albums
            .filter(a =>
                (a.title_en.toLowerCase().includes(lowerCaseQuery) ||
                a.title_km.toLowerCase().includes(lowerCaseQuery) ||
                a.content_en.toLowerCase().includes(lowerCaseQuery) ||
                a.content_km.toLowerCase().includes(lowerCaseQuery))
            )
            .map(a => ({
                id: a.id,
                type: 'album',
                title: language === 'km' ? a.title_km : a.title_en,
                description: (language === 'km' ? a.description_km : a.description_en).substring(0, 150) + '...',
                link: `/gallery/${a.id}`,
                imageUrl: a.thumbnailUrl
            }));
            
        setResults([...filteredPosts, ...filteredEvents, ...filteredTeachings, ...filteredAlbums]);

    }, [query, posts, events, teachings, albums, loading, language]);

    const content = {
        en: {
            title: `Search Results for "${query}"`,
            pageTitle: 'Search | Wat Serei Mongkol',
            noResults: 'No results found for your search.',
            placeholder: 'Start a new search to see results.',
            typePost: 'News',
            typeEvent: 'Event',
            typeTeaching: 'Teaching',
            typeAlbum: 'Gallery Album',
        },
        km: {
            title: `លទ្ធផលស្វែងរកសម្រាប់ «${query}»`,
            pageTitle: 'ស្វែងរក | វត្តសិរីមង្គល',
            noResults: 'រកមិនឃើញលទ្ធផលសម្រាប់ការស្វែងរករបស់អ្នកទេ។',
            placeholder: 'ចាប់ផ្តើមការស្វែងរកថ្មីដើម្បីមើលលទ្ធផល។',
            typePost: 'ព័ត៌មាន',
            typeEvent: 'ពិធីបុណ្យ',
            typeTeaching: 'ព្រះធម៌',
            typeAlbum: 'អាល់ប៊ុមរូបភាព',
        }
    };
    const currentContent = content[language];
    
    const getTypeLabel = (type: SearchResult['type']) => {
        switch (type) {
            case 'post': return { label: currentContent.typePost, Icon: Newspaper, color: 'bg-sky-100 text-sky-800' };
            case 'event': return { label: currentContent.typeEvent, Icon: Calendar, color: 'bg-rose-100 text-rose-800' };
            case 'teaching': return { label: currentContent.typeTeaching, Icon: BookOpen, color: 'bg-amber-100 text-amber-800' };
            case 'album': return { label: currentContent.typeAlbum, Icon: ImageIcon, color: 'bg-emerald-100 text-emerald-800' };
        }
    }

    return (
        <>
            <PageMeta title={currentContent.pageTitle} description={`Search results for ${query}`} />
            <section className="py-20 md:py-28 bg-gray-50 min-h-[60vh]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center space-x-4">
                            <SearchIcon className="w-10 h-10 text-amber-600/80" />
                            <h1 className={`text-3xl md:text-4xl font-bold text-amber-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                                {query ? currentContent.title : (language === 'km' ? 'ស្វែងរក' : 'Search')}
                            </h1>
                        </div>
                    </div>
                    
                    <div className="max-w-4xl mx-auto">
                        {loading && (
                             <div className="grid grid-cols-1 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 animate-pulse flex space-x-4">
                                        <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
                                        <div className="flex-1 space-y-3 py-1">
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="space-y-6">
                                {results.map(result => {
                                    const { label, Icon, color } = getTypeLabel(result.type);
                                    return (
                                        <Link key={`${result.type}-${result.id}`} to={result.link} className="block bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-transparent hover:border-amber-400 hover:shadow-md transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                                {result.imageUrl && (
                                                    <img src={result.imageUrl} alt={result.title} className="w-full sm:w-32 h-32 sm:h-auto object-cover rounded-md flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${language === 'km' ? 'font-khmer' : ''}`}>
                                                            <Icon className="w-3 h-3 mr-1.5" />
                                                            {label}
                                                        </span>
                                                    </div>
                                                    <h3 className={`text-xl font-bold text-gray-800 hover:text-amber-700 truncate ${language === 'km' ? 'font-khmer' : ''}`}>
                                                        {result.title}
                                                    </h3>
                                                    <p className={`mt-2 text-gray-600 line-clamp-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                                                        {result.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                        
                        {!loading && results.length === 0 && query && (
                             <div className="text-center py-10">
                                <p className={`text-lg text-gray-500 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentContent.noResults}
                                </p>
                             </div>
                        )}

                         {!loading && !query && (
                             <div className="text-center py-10">
                                <p className={`text-lg text-gray-500 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentContent.placeholder}
                                </p>
                             </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Search;
