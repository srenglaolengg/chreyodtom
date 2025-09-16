import React, { useMemo } from 'react';
import { Language, Post, FirebaseUser } from '../types';
import { db } from '../firebase';
import {
    collection,
    query,
    orderBy,
    deleteDoc,
    doc,
    Timestamp,
} from 'firebase/firestore';
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
    const q = useMemo(() => query(collection(db, "posts"), orderBy("timestamp", "desc")), []);
    const { data: posts, loading, error } = useCollection<Post>(q);

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
            <section id="feed" className="py-20 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-3xl md:text-4xl font-bold text-primary ${language === 'km' ? 'font-khmer' : ''}`}>
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
                        {error && <p className="text-center text-destructive">{error}</p>}
                        {!loading && posts.length === 0 && (
                            <p className={`text-center text-muted-foreground ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.noPosts}
                            </p>
                        )}
                        {!loading && posts.map(post => (
                            <article key={post.id} className="bg-card rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl border border-border relative group">
                                {post.imageUrl && (
                                    <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover" />
                                )}
                                <div className="p-4 sm:p-6 md:p-8">
                                    <h3 className={`text-2xl font-bold text-card-foreground mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                                        {post.title}
                                    </h3>
                                    <div className="text-sm text-muted-foreground mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-x-2">
                                        <span className={`${language === 'km' ? 'font-khmer' : ''}`}>
                                            {language === 'km' ? `ដោយ ` : 'By '}<strong>{post.author}</strong>
                                        </span>
                                        <span className="hidden sm:inline">&bull;</span>
                                        <time dateTime={post.timestamp ? post.timestamp.toDate().toISOString() : ''}>
                                            {formatTimestamp(post.timestamp)}
                                        </time>
                                    </div>
                                    <div className={`prose dark:prose-invert max-w-none text-foreground leading-relaxed break-words ${language === 'km' ? 'font-khmer' : ''}`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            children={post.content}
                                            components={{
                                                a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                pre: ({node, ...props}) => <pre className="bg-muted text-foreground p-4 rounded-md overflow-x-auto my-4 text-sm" {...props} />,
                                                // FIX: Property 'inline' does not exist on type. This is likely due to a type definition
                                                // mismatch for react-markdown's component props. We use @ts-ignore to
                                                // destructure the `inline` prop which is available at runtime.
                                                // @ts-ignore
                                                code: ({node, inline, className, children, ...props}) => {
                                                    return !inline ? (
                                                      <code className={className} {...props}>{children}</code>
                                                    ) : (
                                                      <code className="bg-muted text-foreground text-sm rounded px-1.5 py-1" {...props}>{children}</code>
                                                    );
                                                },
                                            }}
                                        />
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="absolute top-4 right-4 flex space-x-2 bg-black/40 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to="/admin" state={{ postToEdit: post }} className="p-2 text-white hover:text-yellow-300" aria-label="Edit Post">
                                          <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-white hover:text-red-400" aria-label="Delete Post">
                                            <Trash2 className="w-4 h-4" />
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