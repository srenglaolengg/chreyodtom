import React, { useState, useMemo } from 'react';
import { Language, FirebaseUser, Comment as CommentType } from '../types';
import { auth, githubProvider, db } from '../firebase';
import { 
    signInWithPopup, 
    signOut,
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
    
    const collectionOptions = useMemo(() => ({ orderBy: { column: 'createdAt', ascending: false } }), []);
    const { data: comments, loading, error } = useCollection<CommentType>('comments', collectionOptions);

    const handleLogin = async () => await signInWithPopup(auth, githubProvider).catch(error => console.error("Authentication error: ", error));
    const handleLogout = async () => await signOut(auth).catch(error => console.error("Sign out error: ", error));

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '' || !user) return;

        try {
            const commentsCollection = collection(db, 'comments');
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
            placeholder: "Share your thoughts respectfully...",
            submit: "Submit Comment",
            noComments: "No comments yet. Be the first to share your thoughts!"
        },
        km: {
            title: "មតិយោបល់សហគមន៍",
            login: "ចូលដោយប្រើ GitHub ដើម្បីបញ្ចេញមតិ",
            logout: "ចាកចេញ",
            placeholder: "សរសេរមតិយោបល់របស់អ្នក...",
            submit: "បញ្ជូនមតិ",
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
            {/* UI UPGRADE: Standardized vertical padding and background. */}
            <section id="comments" className="py-20 md:py-28 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                      <h2 className={`text-4xl md:text-5xl font-bold text-amber-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {currentContent.title}
                      </h2>
                    </div>
                    {/* UI UPGRADE: Polished the main container card with static light theme styles. */}
                    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
                        {user ? (
                             <form onSubmit={handleSubmitComment} className="mb-8">
                                <div className="flex items-start space-x-4">
                                  <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-11 h-11 rounded-full flex-shrink-0 border-2 border-amber-600/50" />
                                  <div className="flex-1">
                                      <textarea
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                          placeholder={currentContent.placeholder}
                                          className={`w-full p-4 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                                          rows={4}
                                          aria-label="New comment"
                                      />
                                      <div className="flex justify-end items-center mt-4 gap-4">
                                         <button type="button" onClick={handleLogout} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-semibold">
                                            {currentContent.logout}
                                        </button>
                                        <button type="submit" className={`bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${language === 'km' ? 'font-khmer' : ''}`} disabled={!newComment.trim()}>
                                            {currentContent.submit}
                                        </button>
                                      </div>
                                  </div>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center mb-8 p-6 bg-gray-100 rounded-lg">
                                <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors shadow-lg font-semibold">
                                    <GitHubIcon className="w-6 h-6" />
                                    <span>{currentContent.login}</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-6">
                            {loading && Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)}
                            {error && <p className="text-center text-red-500">{error}</p>}
                            {!loading && comments.length === 0 && <p className="text-center text-gray-500 py-8">{currentContent.noComments}</p>}
                            {!loading && comments.map(comment => (
                                /* UI UPGRADE: Refined individual comment appearance for better readability. */
                                <article key={comment.id} className="flex items-start space-x-4 p-4" aria-label={`Comment by ${comment.user.displayName}`}>
                                    <img src={comment.user.photoURL || ''} alt={`${comment.user.displayName}'s avatar`} className="w-10 h-10 rounded-full flex-shrink-0 mt-1 border-2 border-gray-200" />
                                    <div className="flex-1 min-w-0 p-4">
                                        <div className="flex items-baseline space-x-2">
                                            <p className="font-bold text-gray-900">{comment.user.displayName}</p>
                                            <p className="text-xs text-gray-500">
                                                <time dateTime={comment.createdAt?.toDate().toISOString()}>
                                                    {comment.createdAt?.toDate().toLocaleString() || '...'}
                                                </time>
                                            </p>
                                        </div>
                                        <p className={`text-gray-800 whitespace-pre-line break-words mt-1 ${language === 'km' ? 'font-khmer' : ''}`}>{comment.text}</p>
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