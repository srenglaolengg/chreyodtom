import React, { useState, useEffect } from 'react';
import { FirebaseUser, Post } from '../types';
import { auth, db, githubProvider } from '../firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    signInWithPopup,
    signOut,
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
import { GitHubIcon } from '../components/icons/GitHubIcon';
import PageMeta from '../components/PageMeta';
import { Newspaper, MessageSquare, Image as ImageIcon, Calendar, BookOpen, Info, Phone, Menu, X, LogOut } from 'lucide-react';

type FormState = Omit<Post, 'id' | 'timestamp' | 'author'> & { id?: string };

const initialFormState: FormState = {
    title: '',
    content: '',
    imageUrl: '',
};

interface AdminProps {
    user: FirebaseUser | null;
    isAdmin: boolean;
    authLoading: boolean;
}

type ViewType = 'feed' | 'comments' | 'gallery' | 'events' | 'teachings' | 'about' | 'contact';

const navItems: { id: ViewType; label: string; icon: React.FC<any> }[] = [
    { id: 'feed', label: 'Feed', icon: Newspaper },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'teachings', label: 'Teachings', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Phone },
];

const Admin: React.FC<AdminProps> = ({ user, isAdmin, authLoading }) => {
    const [view, setView] = useState<ViewType>('feed');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Effect to handle navigation from Feed page 'EDIT' button
    useEffect(() => {
        const postToEditFromState = location.state?.postToEdit as Post | undefined;
        if (postToEditFromState) {
            setView('feed');
            // We pass the post data to the FeedManager component via props now
            // The state is cleared to prevent re-triggering
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);
    
    const handleLogin = async () => await signInWithPopup(auth, githubProvider);
    const handleLogout = async () => await signOut(auth);

    const metaDescription = "Content management system for the Wat Serei Mongkol website.";
    const metaRobots = "noindex, nofollow";

    if (authLoading) {
        return (
            <>
                <PageMeta title="Authenticating..." description="" robots={metaRobots} />
                <div className="min-h-screen flex items-center justify-center bg-yellow-50 text-stone-700">Authenticating...</div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <PageMeta title="Admin Login" description={metaDescription} robots={metaRobots} />
                <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-4 text-center">
                    <h1 className="text-4xl font-serif text-stone-800 mb-4">Admin Access</h1>
                    <p className="text-stone-600 mb-8 max-w-sm">Please log in with an authorized GitHub account to access the content management dashboard.</p>
                    <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-stone-800 text-white px-6 py-3 rounded-full hover:bg-stone-900 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <GitHubIcon className="w-6 h-6" />
                        <span className="font-semibold">Login with GitHub</span>
                    </button>
                </div>
            </>
        );
    }
    
    if (!isAdmin) {
         return (
            <>
                <PageMeta title="Access Denied" description={metaDescription} robots={metaRobots} />
                <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-4 text-center">
                    <h1 className="text-3xl font-serif text-red-800 mb-4">Access Denied</h1>
                    <p className="text-stone-600 mb-8">You are not authorized to view this page.</p>
                    <button onClick={handleLogout} className="inline-flex items-center space-x-3 bg-stone-500 text-white px-6 py-2 rounded-full hover:bg-stone-600 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </>
        );
    }
    
    const SidebarNav = () => (
      <nav className="flex flex-col p-4 space-y-2">
          {navItems.map(item => (
              <button
                  key={item.id}
                  onClick={() => {
                      setView(item.id);
                      setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left w-full ${
                      view === item.id 
                      ? 'bg-amber-400 text-red-900 shadow-inner' 
                      : 'text-yellow-50 hover:bg-stone-700'
                  }`}
              >
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  <span className="font-semibold">{item.label}</span>
              </button>
          ))}
      </nav>
    );

    return (
        <>
            <PageMeta title="Admin Dashboard | Wat Serei Mongkol" description={metaDescription} robots={metaRobots} />
            <div className="min-h-screen bg-yellow-50 lg:flex">
                {/* Sidebar */}
                <aside className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-64 bg-stone-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-4 border-b border-stone-700">
                        <h1 className="text-xl font-bold text-amber-400">Admin Panel</h1>
                         <button onClick={() => setIsMenuOpen(false)} className="lg:hidden text-yellow-50 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <SidebarNav />
                </aside>
                
                <div className="flex-1 flex flex-col">
                     {/* Header */}
                    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 lg:z-30">
                        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-stone-700">
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="text-lg font-semibold text-stone-700 capitalize hidden sm:block">{view} Management</div>
                            <div className="flex items-center space-x-4">
                                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-amber-400" />
                                <span className="font-semibold text-stone-700 hidden sm:block">{user.displayName}</span>
                                <button onClick={handleLogout} title="Logout" className="text-stone-600 hover:text-red-800 transition-colors">
                                    <LogOut className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                      {view === 'feed' && <FeedManager user={user} postToEdit={location.state?.postToEdit} />}
                      {view !== 'feed' && <ComingSoon title={`${view.charAt(0).toUpperCase() + view.slice(1)} Management`} />}
                    </main>
                </div>
            </div>
        </>
    );
};

const FeedManager: React.FC<{user: FirebaseUser, postToEdit?: Post}> = ({ user, postToEdit }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const postsCollection = collection(db, "posts");
        const q = query(postsCollection, orderBy("timestamp", "desc"));
        const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
            const postsData: Post[] = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() } as Post);
            });
            setPosts(postsData);
        }, (err) => {
            console.error("Error fetching posts: ", err);
            setError('Could not load posts.');
        });
        return () => unsubscribeFirestore();
    }, []);
    
     useEffect(() => {
        if (postToEdit) {
            handleEditClick(postToEdit);
        }
    }, [postToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormState(initialFormState);
    };

    const handleEditClick = (post: Post) => {
        setIsEditing(true);
        setFormState({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl || '',
        });
        window.scrollTo(0, 0);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDoc(doc(db, "posts", id));
            } catch (error) {
                console.error("Error deleting document: ", error);
                setError('Failed to delete post.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.title || !formState.content || !user) return;
        setIsSubmitting(true);
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
                await addDoc(collection(db, "posts"), {
                    ...formState,
                    author: user.displayName || 'Admin',
                    timestamp: serverTimestamp(),
                });
            }
            handleCancelEdit();
        } catch (err) {
            console.error(err);
            setError('An error occurred while saving the post.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const formatTimestamp = (timestamp: Timestamp) => {
        if (!timestamp) return '...';
        return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-8">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}
            
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-amber-400/50">
                <h2 className="text-2xl font-serif text-stone-700 mb-6">{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-stone-600 mb-1">Title</label>
                        <input type="text" name="title" id="title" value={formState.title} onChange={handleInputChange} required className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"/>
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-stone-600 mb-1">Content (Markdown supported)</label>
                        <textarea name="content" id="content" value={formState.content} onChange={handleInputChange} required rows={8} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-sm"></textarea>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-stone-600 mb-1">Image URL (Optional)</label>
                        <input type="url" name="imageUrl" id="imageUrl" value={formState.imageUrl} onChange={handleInputChange} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"/>
                    </div>
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-md font-semibold disabled:bg-amber-300 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={handleCancelEdit} className="bg-stone-200 text-stone-700 px-6 py-2 rounded-full hover:bg-stone-300 transition-colors font-semibold">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-amber-400/50">
                <h2 className="text-2xl font-serif text-stone-700 mb-6">Manage Posts</h2>
                <div className="space-y-4">
                    {posts.length > 0 ? posts.map(post => (
                        <div key={post.id} className="p-4 border border-stone-200 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-stone-800">{post.title}</h3>
                                <p className="text-sm text-stone-500">
                                    By {post.author} on {formatTimestamp(post.timestamp)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => handleEditClick(post)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                                <button onClick={() => handleDelete(post.id)} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">Delete</button>
                            </div>
                        </div>
                    )) : <p className="text-stone-500">No posts found.</p>}
                </div>
            </div>
        </div>
    );
};

const ComingSoon: React.FC<{title: string}> = ({ title }) => (
    <div className="bg-white p-8 rounded-lg shadow-md border border-amber-400/50 text-center">
        <h2 className="text-2xl font-serif text-stone-700 mb-4">{title}</h2>
        <p className="text-stone-500">This feature is currently under development. Please check back later!</p>
    </div>
);


export default Admin;
