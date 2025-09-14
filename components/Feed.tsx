
import React, { useState, useEffect } from 'react';
import { Language, Post, FirebaseUser } from '../types';
import { db } from '../firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    Timestamp,
} from 'firebase/firestore';
import { ADMIN_U_IDS } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import PostSkeleton from './skeletons/PostSkeleton';
import PageMeta from './PageMeta';
import { Link } from 'react-router-dom';

interface FeedProps {
  language: Language;
  user: FirebaseUser | null;      // pass from App/Header
  isAdmin: boolean;               // pass from App/Header
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
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const postsCollection = collection(db, "posts");
        const q = query(postsCollection, orderBy("timestamp", "desc"));

        const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
            const postsData: Post[] = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() } as Post);
            });
            setPosts(postsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching posts: ", err);
            setError(language === 'km' ? 'មិនអាចផ្ទុកព័ត៌មានបានទេ' : 'Could not load the feed.');
            setLoading(false);
        });

        return () => unsubscribePosts();
    }, [language]);

    const formatTimestamp = (timestamp: Timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់លុបប្រកាសនេះមែនទេ?' : 'Are you sure you want to delete this post?')) {
            const postDoc = doc(db, "posts", id);
            await deleteDoc(postDoc);
        }
    };

    const content = {
        en: { title: "Latest News & Updates", loading: "Loading posts...", noPosts: "No news or updates at the moment." },
        km: { title: "ព័ត៌មាន និងបច្ចុប្បន្នភាពចុងក្រោយ", loading: "កំពុងផ្ទុកព័ត៌មាន...", noPosts: "មិនទាន់មានព័ត៌មាននៅឡើយទេ។" }
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
            <section id="feed" className="py-20 bg-amber-50/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-6">
                        <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
                            {currentContent.title}
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-8">
                        {loading && (
                            <>
                                <PostSkeleton />
                                <PostSkeleton />
                            </>
                        )}
                        {error && <p className="text-center text-red-500">{error}</p>}
                        {!loading && posts.length === 0 && (
                            <p className={`text-center text-stone-500 ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.noPosts}
                            </p>
                        )}
                        {!loading && posts.map(post => (
                            <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl relative">
                                {post.imageUrl && (
                                    <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover" />
                                )}
                                <div className="p-4 sm:p-6 md:p-8">
                                    <h3 className={`text-2xl font-bold text-stone-800 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                                        {post.title}
                                    </h3>
                                    <div className="text-sm text-stone-500 mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-x-2">
                                        <span className={`${language === 'km' ? 'font-khmer' : ''}`}>
                                            {language === 'km' ? `ដោយ ` : 'By '}<strong>{post.author}</strong>
                                        </span>
                                        <span className="hidden sm:inline">&bull;</span>
                                        <time dateTime={post.timestamp ? post.timestamp.toDate().toISOString() : ''}>
                                            {formatTimestamp(post.timestamp)}
                                        </time>
                                    </div>
                                    <div className={`text-stone-600 leading-relaxed break-words ${language === 'km' ? 'font-khmer' : ''}`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            children={post.content}
                                            components={{
                                                h1: ({node, ...props}) => <h1 className="text-3xl font-bold my-4" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-2xl font-bold my-3" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-xl font-bold my-2" {...props} />,
                                                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                                                a: ({node, ...props}) => <a className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                                                li: ({node, ...props}) => <li className="pl-2" {...props} />,
                                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-200 pl-4 italic my-4 text-stone-500" {...props} />,
                                                pre: ({node, ...props}) => <pre className="bg-stone-800 text-white p-4 rounded-md overflow-x-auto my-4 text-sm" {...props} />,
                                                code: ({node, className, children, ...props}) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !match ? (
                                                      <code className="bg-stone-200 text-stone-800 text-sm rounded px-1.5 py-1" {...props}>
                                                        {children}
                                                      </code>
                                                    ) : (
                                                      <code className={className} {...props}>
                                                        {children}
                                                      </code>
                                                    );
                                                },
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* ADMIN EDIT/DELETE */}
                                {isAdmin && (
                                    <div className="absolute top-4 right-4 flex space-x-2 bg-black/30 p-2 rounded-lg">
                                        <Link to="/admin" state={{ postToEdit: post }}>
                                          <span className="text-xs font-bold text-white hover:text-yellow-300 px-1">EDIT</span>
                                        </Link>
                                        <button onClick={() => handleDelete(post.id)} className="text-xs font-bold text-white hover:text-red-400">DELETE</button>
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