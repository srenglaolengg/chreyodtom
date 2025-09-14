
import React, { useState, useEffect } from 'react';
import { Language, Post, FirebaseUser } from '../types';
import { db, auth, githubProvider } from '../firebase';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User as FirebaseUserType
} from 'firebase/auth';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { ADMIN_U_IDS } from '../constants';
import { GitHubIcon } from './icons/GitHubIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import PostSkeleton from './skeletons/PostSkeleton';

type FormState = Omit<Post, 'id' | 'timestamp' | 'author'> & { id?: string };

const initialFormState: FormState = {
    title: '',
    content: '',
    imageUrl: '',
};

interface FeedProps {
  language: Language;
}

const Feed: React.FC<FeedProps> = ({ language }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Admin state
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [adminLoading, setAdminLoading] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser: FirebaseUserType | null) => {
            if (currentUser) {
                const userIsAdmin = ADMIN_U_IDS.includes(currentUser.uid);
                setIsAdmin(userIsAdmin);
                setUser({
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                });
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });

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

        return () => {
            unsubscribeAuth();
            unsubscribePosts();
        };
    }, [language]);

    const formatTimestamp = (timestamp: Timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Admin handlers
    const handleLogin = async () => await signInWithPopup(auth, githubProvider);
    const handleLogout = async () => {
        await signOut(auth);
        setFormVisible(false);
        setIsEditing(false);
        setFormState(initialFormState);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormState(initialFormState);
        setFormVisible(false);
    };

    const handleEditClick = (post: Post) => {
        setIsEditing(true);
        setFormState({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl || '',
        });
        setFormVisible(true);
        const feedElement = document.getElementById('feed');
        feedElement?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const postDoc = doc(db, "posts", id);
            await deleteDoc(postDoc);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.title || !formState.content || !user) return;

        setAdminLoading(true);
        setError(null);

        try {
            if (isEditing && formState.id) {
                const postDoc = doc(db, "posts", formState.id);
                await updateDoc(postDoc, {
                    title: formState.title,
                    content: formState.content,
                    imageUrl: formState.imageUrl || '',
                });
            } else {
                const postsCollection = collection(db, "posts");
                await addDoc(postsCollection, {
                    title: formState.title,
                    content: formState.content,
                    imageUrl: formState.imageUrl || '',
                    author: user.displayName || 'Admin',
                    timestamp: serverTimestamp(),
                });
            }
            handleCancelEdit();
        } catch (err) {
            console.error(err);
        } finally {
            setAdminLoading(false);
        }
    };


    const content = {
        en: { title: "Latest News & Updates", loading: "Loading posts...", noPosts: "No news or updates at the moment. Please check back later." },
        km: { title: "ព័ត៌មាន និងបច្ចុប្បន្នភាពចុងក្រោយ", loading: "កំពុងផ្ទុកព័ត៌មាន...", noPosts: "មិនទាន់មានព័ត៌មាន ឬបច្ចុប្បន្នភាពនៅឡើយទេ។ សូមពិនិត្យមើលម្តងទៀតនៅពេលក្រោយ។" }
    };
    const currentContent = content[language];

    const adminContent = {
        en: { createBtn: "Create New Post", adminPanel: "Admin Panel", editPost: "Edit Post", createPost: "Create New Post", title: "Title", content: "Content (Markdown supported)", imgUrl: "Image URL (Optional)", save: "Save Post", update: "Update Post", saving: "Saving...", cancel: "Cancel", login: "Admin Login"},
        km: { createBtn: "បង្កើតโพสต์ថ្មី", adminPanel: "ផ្ទាំងគ្រប់គ្រង", editPost: "កែសម្រួលโพสต์", createPost: "បង្កើតโพสต์ថ្មី", title: "ចំណងជើង", content: "เนื้อหา (គាំទ្រ Markdown)", imgUrl: "URL រូបភាព (ស្រេចចិត្ត)", save: "រក្សាទុកโพสต์", update: "ធ្វើបច្ចុប្បន្នភាពโพสต์", saving: "កំពុងរក្សាទុក...", cancel: "បោះបង់", login: "ចូលគ្រប់គ្រង" }
    }
    const currentAdminContent = adminContent[language];

    return (
        <section id="feed" className="py-20 bg-amber-50/30">
            <div className="container mx-auto px-6">
                <div className="text-center mb-6">
                    <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
                        {currentContent.title}
                    </h2>
                </div>
                
                {/* ADMIN SECTION */}
                <div className="max-w-3xl mx-auto mb-8">
                    {user ? (
                         isAdmin ? (
                            <div className="bg-white/60 p-4 rounded-lg shadow-md border border-amber-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <span className="font-semibold text-stone-700">{user.displayName}</span>
                                            <p className="text-xs text-amber-700 font-bold">{currentAdminContent.adminPanel}</p>
                                        </div>
                                    </div>
                                     <button onClick={handleLogout} className="text-sm font-semibold text-stone-600 hover:text-red-600 transition-colors">Logout</button>
                                </div>
                                <div className="mt-4">
                                     {!formVisible && (
                                        <button onClick={() => setFormVisible(true)} className={`w-full bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>
                                            {currentAdminContent.createBtn}
                                        </button>
                                     )}
                                </div>
                                {formVisible && (
                                    <div className="mt-6 border-t border-amber-200 pt-6">
                                        <h3 className="text-xl font-bold text-stone-700 mb-4">{isEditing ? currentAdminContent.editPost : currentAdminContent.createPost}</h3>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-stone-600 mb-1">{currentAdminContent.title}</label>
                                                <input type="text" name="title" id="title" value={formState.title} onChange={handleInputChange} required className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"/>
                                            </div>
                                            <div>
                                                <label htmlFor="content" className="block text-sm font-medium text-stone-600 mb-1">{currentAdminContent.content}</label>
                                                <textarea name="content" id="content" value={formState.content} onChange={handleInputChange} required rows={8} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-sm"></textarea>
                                            </div>
                                            <div>
                                                <label htmlFor="imageUrl" className="block text-sm font-medium text-stone-600 mb-1">{currentAdminContent.imgUrl}</label>
                                                <input type="url" name="imageUrl" id="imageUrl" value={formState.imageUrl} onChange={handleInputChange} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"/>
                                            </div>
                                            <div className="flex items-center space-x-4 pt-2">
                                                 <button type="submit" disabled={adminLoading} className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-md font-semibold disabled:bg-amber-300">
                                                    {adminLoading ? currentAdminContent.saving : (isEditing ? currentAdminContent.update : currentAdminContent.save)}
                                                </button>
                                                <button type="button" onClick={handleCancelEdit} className="bg-stone-200 text-stone-700 px-6 py-2 rounded-full hover:bg-stone-300 transition-colors font-semibold">
                                                    {currentAdminContent.cancel}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                         ) : (
                            <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
                                <p>Welcome, {user.displayName}. You are not an authorized admin.</p>
                                <button onClick={handleLogout} className="mt-2 text-sm font-semibold text-stone-600 hover:text-red-600 transition-colors">Logout</button>
                            </div>
                         )
                    ) : (
                        <div className="text-center">
                            <button onClick={handleLogin} className="inline-flex items-center space-x-2 text-sm font-semibold text-stone-600 hover:text-amber-700 transition-colors">
                                <GitHubIcon className="w-5 h-5" />
                                <span>{currentAdminContent.login}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* POSTS LIST */}
                <div className="max-w-3xl mx-auto space-y-8">
                    {loading && (
                        <>
                            <PostSkeleton />
                            <PostSkeleton />
                        </>
                    )}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && posts.length === 0 && (
                        <p className={`text-center text-stone-500 ${language === 'km' ? 'font-khmer' : ''}`}>{currentContent.noPosts}</p>
                    )}
                    {!loading && posts.map(post => (
                        <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl relative">
                            {post.imageUrl && (
                                <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover" />
                            )}
                            <div className="p-6 md:p-8">
                                <h3 className={`text-2xl font-bold text-stone-800 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{post.title}</h3>
                                <div className="text-sm text-stone-500 mb-4">
                                    <span className={`${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? `ដោយ ` : 'By '}<strong>{post.author}</strong></span>
                                    <span className="mx-2">&bull;</span>
                                    <time dateTime={post.timestamp ? post.timestamp.toDate().toISOString() : ''}>{formatTimestamp(post.timestamp)}</time>
                                </div>
                                <div className={`text-stone-600 leading-relaxed break-words ${language === 'km' ? 'font-khmer' : ''}`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkBreaks]}
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
                                            table: ({node, ...props}) => <div className="overflow-x-auto"><table className="table-auto w-full my-4 border-collapse border border-amber-200" {...props} /></div>,
                                            thead: ({node, ...props}) => <thead className="bg-amber-100" {...props} />,
                                            th: ({node, ...props}) => <th className="border border-amber-200 px-4 py-2 text-left font-bold text-amber-800" {...props} />,
                                            td: ({node, ...props}) => <td className="border border-amber-200 px-4 py-2" {...props} />,
                                            hr: ({node, ...props}) => <hr className="border-amber-200 my-8" {...props} />
                                        }}
                                    >
                                        {post.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                             {isAdmin && (
                                <div className="absolute top-4 right-4 flex space-x-2 bg-black/30 p-2 rounded-lg">
                                    <button onClick={() => handleEditClick(post)} className="text-xs font-bold text-white hover:text-yellow-300">EDIT</button>
                                    <button onClick={() => handleDelete(post.id)} className="text-xs font-bold text-white hover:text-red-400">DELETE</button>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Feed;
