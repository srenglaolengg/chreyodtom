import React, { useState, useMemo } from 'react';
import { Language, FirebaseUser, Comment as CommentType } from '../types';
import { auth, githubProvider, db } from '../firebase';
import firebase from 'firebase/compat/app';
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

    const handleLogin = async () => await auth.signInWithPopup(githubProvider).catch(error => console.error("Authentication error: ", error));
    const handleLogout = async () => await auth.signOut().catch(error => console.error("Sign out error: ", error));

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '' || !user) return;

        try {
            await db.collection('comments').add({
                text: newComment,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
            <section id="comments" style={{backgroundColor: 'var(--surface-color)'}}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '3rem' }}>
                      <h2 className={language === 'km' ? 'font-khmer' : ''}>
                          {currentContent.title}
                      </h2>
                    </div>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        {user ? (
                             <form onSubmit={handleSubmitComment} style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                  {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} style={{ width: '44px', height: '44px', borderRadius: '50%', marginRight: '1rem' }} />}
                                  <div style={{ flex: 1 }}>
                                      <textarea
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                          placeholder={currentContent.placeholder}
                                          className={`form-textarea ${language === 'km' ? 'font-khmer' : ''}`}
                                          rows={4}
                                          aria-label="New comment"
                                      />
                                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                         <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
                                            {currentContent.logout}
                                        </button>
                                        <button type="submit" className={`btn btn-primary btn-sm ${language === 'km' ? 'font-khmer' : ''}`} disabled={!newComment.trim()} style={{ marginLeft: '0.5rem' }}>
                                            {currentContent.submit}
                                        </button>
                                      </div>
                                  </div>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '0.25rem' }}>
                                <button onClick={handleLogin} className="btn btn-primary">
                                    {currentContent.login}
                                </button>
                            </div>
                        )}

                        <div>
                            {loading && Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)}
                            {error && <p className="text-center">{error}</p>}
                            {!loading && comments.length === 0 && <p className="text-center" style={{ padding: '2rem 0' }}>{currentContent.noComments}</p>}
                            {!loading && comments.map(comment => (
                                <article key={comment.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                    {comment.user.photoURL && <img src={comment.user.photoURL} alt={`${comment.user.displayName}'s avatar`} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '1rem' }} />}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                            <p style={{ fontWeight: 'bold' }}>{comment.user.displayName}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                                <time dateTime={comment.createdAt?.toDate().toISOString()}>
                                                    {comment.createdAt?.toDate().toLocaleString() || '...'}
                                                </time>
                                            </p>
                                        </div>
                                        <p style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', marginTop: '0.25rem' }} className={language === 'km' ? 'font-khmer' : ''}>{comment.text}</p>
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