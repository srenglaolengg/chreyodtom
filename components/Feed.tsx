
import React, { useMemo } from 'react';
import { Language, Post, FirebaseUser } from '../types';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import PostSkeleton from './skeletons/PostSkeleton';
import PageMeta from './PageMeta';
import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { Edit, Trash2 } from 'lucide-react';

interface FeedProps {
  language: Language;
  user: FirebaseUser | null;
  isAdmin: boolean;
}

const metaContent = {
  en: {
    title: 'News & Updates | Wat Serei Mongkol',
    description: 'Read the latest news, announcements, and updates from the Wat Serei Mongkol community.',
    keywords: 'Pagoda News, Community Updates, Wat Serei Mongkol Feed, Announcements',
  },
  km: {
    title: 'ព័ត៌មាន និងបច្ចុប្បន្នភាព | វត្តសិរីមង្គល',
    description: 'អានព័ត៌មាន សេចក្តីជូនដំណឹង និងបច្ចុប្បន្នភាពចុងក្រោយពីសហគមន៍វត្តសិរីមង្គល។',
    keywords: 'ព័ត៌មានវត្ត, បច្ចុប្បន្នភាពសហគមន៍, ព្រឹត្តិបត្រវត្តសិរីមង្គល, សេចក្តីជូនដំណឹង',
  }
};

const Feed: React.FC<FeedProps> = ({ language, user, isAdmin }) => {
    const collectionOptions = useMemo(() => ({ orderBy: { column: 'timestamp', ascending: false } }), []);
    const { data: posts, loading, error } = useCollection<Post>('posts', collectionOptions);

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') return '';
        return timestamp.toDate().toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់លុបប្រកាសនេះមែនទេ?' : 'Are you sure you want to delete this post?')) {
            try {
                await db.collection('posts').doc(id).delete();
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post.");
            }
        }
    };

    const content = {
        en: { title: "Latest News & Updates", noPosts: "No news or updates at the moment." },
        km: { title: "ព័ត៌មាន និងបច្ចុប្បន្នភាពចុងក្រោយ", noPosts: "មិនទាន់មានព័ត៌មាននៅឡើយទេ។" }
    };
    const currentContent = content[language];
    const currentMeta = metaContent[language];

    return (
        <>
            <PageMeta 
                title={currentMeta.title}
                description={currentMeta.description}
                keywords={currentMeta.keywords}
            />
            <section id="feed" className="py-20 md:py-28 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                            {currentContent.title}
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-12">
                        {loading && (
                            <>
                                <PostSkeleton />
                                <PostSkeleton />
                            </>
                        )}
                        {error && <p className="text-center text-red-500">{error}</p>}
                        {!loading && posts.length === 0 && (
                            <p className={`text-center text-gray-500 ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.noPosts}
                            </p>
                        )}
                        {!loading && posts.map(post => (
                            <article key={post.id} id={`post-${post.id}`} className="relative group scroll-mt-20 bg-white p-6 sm:p-8 md:p-10 rounded-lg border border-gray-200">
                                {post.imageUrl && (
                                    <img src={post.imageUrl} alt={post.title} className="w-full h-72 object-cover mb-6 rounded-md" />
                                )}
                                <div >
                                    <h3 className={`text-3xl font-bold text-gray-900 mb-3 ${language === 'km' ? 'font-khmer' : ''}`}>
                                        {post.title}
                                    </h3>
                                    <div className="text-sm text-gray-500 mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-x-2">
                                        <span className={`${language === 'km' ? 'font-khmer' : ''}`}>
                                            {language === 'km' ? `ដោយ ` : 'By '}<strong>{post.author}</strong>
                                        </span>
                                        <span className="hidden sm:inline">&bull;</span>
                                        <time dateTime={post.timestamp?.toDate().toISOString()}>
                                            {formatTimestamp(post.timestamp)}
                                        </time>
                                    </div>
                                    <div className={`prose max-w-none text-gray-800 leading-relaxed break-words ${language === 'km' ? 'font-khmer' : ''}`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            children={post.content}
                                            components={{
                                                a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                pre: ({node, ...props}) => <pre className="bg-gray-100 text-gray-900 p-4 rounded-md overflow-x-auto my-4 text-sm" {...props} />,
                                                // @ts-ignore
                                                code: ({node, inline, className, children, ...props}) => {
                                                    return !inline ? (
                                                      <code className={className} {...props}>{children}</code>
                                                    ) : (
                                                      <code className="bg-gray-100 text-gray-900 text-sm rounded px-1.5 py-1" {...props}>{children}</code>
                                                    );
                                                },
                                            }}
                                        />
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="absolute top-4 right-4 flex space-x-2 bg-black/50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                        <Link to="/admin" state={{ postToEdit: post }} className="p-2 text-white hover:text-yellow-300 transition-colors" aria-label="Edit Post">
                                          <Edit className="w-5 h-5" />
                                        </Link>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-white hover:text-red-400 transition-colors" aria-label="Delete Post">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Feed;