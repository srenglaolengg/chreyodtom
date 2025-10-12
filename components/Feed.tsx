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
            year: 'numeric', month: 'long', day: 'numeric'
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
            <section id="feed" style={{ backgroundColor: 'var(--surface-color)' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '3rem' }}>
                        <h2 className={language === 'km' ? 'font-khmer' : ''}>
                            {currentContent.title}
                        </h2>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {loading && ( <> <PostSkeleton /> <PostSkeleton /> </> )}
                        {error && <p className="text-center">{error}</p>}
                        {!loading && posts.length === 0 && (
                            <p className={`text-center ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.noPosts}
                            </p>
                        )}
                        {!loading && posts.map(post => (
                            <article key={post.id} id={`post-${post.id}`} className="feed-article">
                                {isAdmin && (
                                    <div style={{ float: 'right', marginLeft: '1rem' }}>
                                        <Link to="/admin" state={{ postToEdit: post }} className="btn btn-secondary btn-sm">Edit</Link>
                                        <button onClick={() => handleDelete(post.id)} className="btn btn-secondary btn-sm" style={{ marginLeft: '0.5rem' }}>Delete</button>
                                    </div>
                                )}
                                {post.imageUrl && (
                                    <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 'auto', marginBottom: '1.5rem', borderRadius: '0.25rem' }}/>
                                )}
                                
                                <h3 className={language === 'km' ? 'font-khmer' : ''}>{post.title}</h3>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    <span className={language === 'km' ? 'font-khmer' : ''}>
                                        {language === 'km' ? `ដោយ ` : 'By '}<strong>{post.author}</strong>
                                    </span>
                                    <span style={{ margin: '0 0.5rem' }}>&bull;</span>
                                    <time dateTime={post.timestamp?.toDate().toISOString()}>
                                        {formatTimestamp(post.timestamp)}
                                    </time>
                                </div>
                                <div className={`prose ${language === 'km' ? 'font-khmer' : ''}`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkBreaks]}
                                        children={post.content}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Feed;