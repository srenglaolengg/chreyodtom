
import React, { useState, useMemo } from 'react';
import { Language, FirebaseUser, Comment as CommentType } from '../types';
import { auth, db, githubProvider } from '../firebase';
import { 
    signInWithPopup, 
    signOut,
} from 'firebase/auth';
import { 
    collection, 
    query, 
    orderBy, 
    addDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { GitHubIcon } from './icons/GitHubIcon';
import CommentSkeleton from './skeletons/CommentSkeleton';
import PageMeta from './PageMeta';
import { useCollection } from '../hooks/useCollection';

interface CommentsProps {
  language: Language;
  user: FirebaseUser | null;
}

const metaContent = {
  en: {
    title: 'Community Comments | Wat Serei Mongkol',
    description: 'Read and share comments with the Wat Serei Mongkol community. Engage in respectful discussion and share your thoughts.',
    keywords: 'Community Feedback, Comments, Discussion, Wat Serei Mongkol Community',
  },
  km: {
    title: 'មតិយោបល់សហគមន៍ | វត្តសិរីមង្គល',
    description: 'អាន និងចែករំលែកមតិយោបល់ជាមួយសហគមន៍វត្តសិរីមង្គល។ ចូលរួមក្នុងការពិភាក្សាប្រកបដោយការគោរព និងចែករំលែកគំនិតរបស់អ្នក។',
    keywords: 'មតិយោបល់, ការពិភាក្សា, សហគមន៍វត្តសិរីមង្គល',
  }
};

const Comments: React.FC<CommentsProps> = ({ language, user }) => {
    const [newComment, setNewComment] = useState('');
    
    const q = useMemo(() => query(collection(db, "comments"), orderBy("createdAt", "desc")), []);
    const { data: comments, loading, error } = useCollection<CommentType>(q);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, githubProvider);
        } catch (error) {
            console.error("Authentication error: ", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error: ", error);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '' || !user) return;

        try {
            const commentsCollection = collection(db, "comments");
            await addDoc(commentsCollection, {
                text: newComment,
                createdAt: serverTimestamp(),
                user: {
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                }
            });
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment: ", error);
        }
    };

    const content = {
        en: {
            title: "Community Comments",
            login: "Login with GitHub to comment",
            logout: "Logout",
            placeholder: "Write your comment...",
            submit: "Submit Comment",
            loading: "Loading comments...",
            noComments: "No comments yet. Be the first to share your thoughts!"
        },
        km: {
            title: "មតិយោបល់សហគមន៍",
            login: "ចូលដោយប្រើ GitHub ដើម្បីបញ្ចេញមតិ",
            logout: "ចាកចេញ",
            placeholder: "សរសេរមតិយោបល់របស់អ្នក...",
            submit: "បញ្ជូនមតិ",
            loading: "កំពុងផ្ទុកមតិយោបល់...",
            noComments: "មិនទាន់មានមតិយោបល់នៅឡើយទេ។ សូមធ្វើជាអ្នកដំបូងដែលចែករំលែកគំនិតរបស់អ្នក!"
        }
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
            <section id="comments" className="py-20 bg-amber-50/30">
                <div className="container mx-auto px-6">
                    <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 text-center mb-12 ${language === 'km' ? 'font-khmer' : ''}`}>
                        {currentContent.title}
                    </h2>
                    <div className="max-w-3xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
                        {user ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full flex-shrink-0" />
                                    <span className="font-semibold text-stone-700 truncate">{user.displayName}</span>
                                </div>
                                <button onClick={handleLogout} className="bg-stone-500 text-white px-4 py-2 rounded-full hover:bg-stone-600 transition-colors text-sm font-semibold self-start sm:self-center flex-shrink-0">
                                    {currentContent.logout}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center mb-6">
                                <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors shadow-md font-semibold">
                                    <GitHubIcon className="w-6 h-6" />
                                    <span>{currentContent.login}</span>
                                </button>
                            </div>
                        )}

                        {user && (
                            <form onSubmit={handleSubmitComment} className="mb-8">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={currentContent.placeholder}
                                    className={`w-full p-4 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                                    rows={4}
                                    aria-label="New comment"
                                />
                                <button type="submit" className={`mt-4 w-full bg-amber-500 text-white px-6 py-3 rounded-full hover:bg-amber-600 transition-colors shadow-md font-semibold ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentContent.submit}
                                </button>
                            </form>
                        )}

                        <div className="space-y-6">
                            {loading && (
                                <>
                                    <CommentSkeleton />
                                    <CommentSkeleton />
                                    <CommentSkeleton />
                                </>
                            )}
                            {error && <p className="text-center text-red-500">{error}</p>}
                            {!loading && comments.length === 0 && <p className="text-center text-stone-500">{currentContent.noComments}</p>}
                            {!loading && comments.map(comment => (
                                <article key={comment.id} className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg" aria-label={`Comment by ${comment.user.displayName}`}>
                                    <img src={comment.user.photoURL || ''} alt={`${comment.user.displayName}'s avatar`} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline space-x-2">
                                            <p className="font-bold text-stone-800">{comment.user.displayName}</p>
                                            <p className="text-xs text-stone-400">
                                                <time dateTime={comment.createdAt ? comment.createdAt.toDate().toISOString() : ''}>
                                                    {comment.createdAt ? comment.createdAt.toDate().toLocaleString() : '...'}
                                                </time>
                                            </p>
                                        </div>
                                        <p className={`text-stone-700 whitespace-pre-line break-words ${language === 'km' ? 'font-khmer' : ''}`}>{comment.text}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Comments;