
import React, { useState, useEffect, FormEvent } from 'react';
import { FirebaseUser, Post, Comment as CommentType, GalleryImage, Event as EventType, Teaching, AboutContent, ContactInfo } from '../types';
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
    setDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    getDoc,
} from 'firebase/firestore';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import PageMeta from '../components/PageMeta';
import { Newspaper, MessageSquare, Image as ImageIcon, Calendar, BookOpen, Info, Phone, Menu, X, LogOut } from 'lucide-react';

// FORM TYPES
type PostFormState = Omit<Post, 'id' | 'timestamp' | 'author'> & { id?: string };
type GalleryFormState = Omit<GalleryImage, 'id'> & { id?: string };
type EventFormState = Omit<EventType, 'id'> & { id?: string };
type TeachingFormState = Omit<Teaching, 'id'> & { id?: string };

const initialPostFormState: PostFormState = { title: '', content: '', imageUrl: '' };

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

    useEffect(() => {
        const postToEditFromState = location.state?.postToEdit as Post | undefined;
        if (postToEditFromState) {
            setView('feed');
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);
    
    const handleLogin = async () => await signInWithPopup(auth, githubProvider);
    const handleLogout = async () => await signOut(auth);

    const metaDescription = "Content management system for the Wat Serei Mongkol website.";
    const metaRobots = "noindex, nofollow";

    if (authLoading) {
        return <PageMeta title="Authenticating..." description="" robots={metaRobots} />;
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
                  // FIX: Corrected typo from setIsMenuOpe to setIsMenuOpen.
                  onClick={() => { setView(item.id); setIsMenuOpen(false); }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left w-full ${ view === item.id ? 'bg-amber-400 text-red-900 shadow-inner' : 'text-yellow-50 hover:bg-stone-700' }`}
              >
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  <span className="font-semibold">{item.label}</span>
              </button>
          ))}
      </nav>
    );

    const renderView = () => {
        switch (view) {
            case 'feed': return <FeedManager user={user} postToEdit={location.state?.postToEdit} />;
            case 'comments': return <CommentManager />;
            case 'gallery': return <GalleryManager />;
            case 'events': return <EventManager />;
            case 'teachings': return <TeachingsManager />;
            case 'about': return <AboutManager />;
            case 'contact': return <ContactManager />;
            default: return <ComingSoon title="Dashboard" />;
        }
    }

    return (
        <>
            <PageMeta title="Admin Dashboard | Wat Serei Mongkol" description={metaDescription} robots={metaRobots} />
            <div className="min-h-screen bg-yellow-50 lg:flex">
                <aside className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-64 bg-stone-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-4 border-b border-stone-700">
                        <h1 className="text-xl font-bold text-amber-400">Admin Panel</h1>
                         <button onClick={() => setIsMenuOpen(false)} className="lg:hidden text-yellow-50 hover:text-white"> <X className="w-6 h-6" /> </button>
                    </div>
                    <SidebarNav />
                </aside>
                
                <div className="flex-1 flex flex-col">
                    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 lg:z-30">
                        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-stone-700"> <Menu className="w-6 h-6" /> </button>
                            <div className="text-lg font-semibold text-stone-700 capitalize hidden sm:block">{view} Management</div>
                            <div className="flex items-center space-x-4">
                                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-amber-400" />
                                <span className="font-semibold text-stone-700 hidden sm:block">{user.displayName}</span>
                                <button onClick={handleLogout} title="Logout" className="text-stone-600 hover:text-red-800 transition-colors"> <LogOut className="w-6 h-6"/> </button>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8"> {renderView()} </main>
                </div>
            </div>
        </>
    );
};

// --- GENERIC HELPER ---
const AdminSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-amber-400/50">
        <h2 className="text-2xl font-serif text-stone-700 mb-6">{title}</h2>
        {children}
    </div>
);
const FormInput: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = ({ name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
        <input id={name} name={name} {...props} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"/>
    </div>
);
const FormTextarea: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; required?: boolean }> = ({ name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
        <textarea id={name} name={name} {...props} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-sm"></textarea>
    </div>
);

// --- MANAGER COMPONENTS ---
const FeedManager: React.FC<{user: FirebaseUser, postToEdit?: Post}> = ({ user, postToEdit }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [formState, setFormState] = useState<PostFormState>(initialPostFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const unsub = onSnapshot(q, snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))));
        return () => unsub();
    }, []);
    
     useEffect(() => { if (postToEdit) handleEditClick(postToEdit); }, [postToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialPostFormState); };
    const handleEditClick = (post: Post) => {
        setIsEditing(true);
        setFormState({ id: post.id, title: post.title, content: post.content, imageUrl: post.imageUrl || '' });
        window.scrollTo(0, 0);
    };
    const handleDelete = async (id: string) => { if (window.confirm('Delete post?')) await deleteDoc(doc(db, "posts", id)); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.title || !formState.content) return;
        setIsSubmitting(true);
        try {
            if (isEditing && formState.id) {
                await updateDoc(doc(db, "posts", formState.id), { title: formState.title, content: formState.content, imageUrl: formState.imageUrl || '' });
            } else {
                await addDoc(collection(db, "posts"), { ...formState, author: user.displayName || 'Admin', timestamp: serverTimestamp() });
            }
            handleCancelEdit();
        } catch (err) { console.error(err); } 
        finally { setIsSubmitting(false); }
    };
    
    return (
        <div className="space-y-8">
            <AdminSection title={isEditing ? 'Edit Post' : 'Create New Post'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput name="title" label="Title" value={formState.title} onChange={handleInputChange} required />
                    <FormTextarea name="content" label="Content (Markdown supported)" value={formState.content} onChange={handleInputChange} required rows={8} />
                    <FormInput name="imageUrl" label="Image URL (Optional)" value={formState.imageUrl || ''} onChange={handleInputChange} type="url" />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 font-semibold disabled:bg-amber-300">{isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-stone-200 text-stone-700 px-6 py-2 rounded-full hover:bg-stone-300 font-semibold">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Manage Posts">
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="p-4 border rounded-md flex justify-between items-center gap-4">
                            <div>
                                <h3 className="font-bold">{post.title}</h3>
                                <p className="text-sm text-stone-500">By {post.author} on {post.timestamp?.toDate().toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => handleEditClick(post)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(post.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminSection>
        </div>
    );
};

const CommentManager: React.FC = () => {
    const [comments, setComments] = useState<CommentType[]>([]);
    useEffect(() => {
        const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentType))));
        return () => unsub();
    }, []);

    const handleDelete = async (id: string) => { if (window.confirm('Delete this comment?')) await deleteDoc(doc(db, "comments", id)); };

    return (
        <AdminSection title="Comment Moderation">
            <div className="space-y-4">
                {comments.length > 0 ? comments.map(comment => (
                    <div key={comment.id} className="p-4 border border-stone-200 rounded-md">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="font-bold">{comment.user.displayName}</p>
                                <p className="text-xs text-stone-400 mb-2">{comment.createdAt?.toDate().toLocaleString()}</p>
                                <p className="text-stone-700 whitespace-pre-wrap">{comment.text}</p>
                            </div>
                            <button onClick={() => handleDelete(comment.id)} className="text-sm font-semibold text-red-600 hover:underline ml-4">Delete</button>
                        </div>
                    </div>
                )) : <p className="text-stone-500">No comments found.</p>}
            </div>
        </AdminSection>
    );
};

// FIX: Changed `fields: any` to a specific Record type to fix destructuring error in the map function.
const PageContentManager: React.FC<{pageId: 'about' | 'contact', fields: Record<string, { label: string; type: string; }>, initialState: any}> = ({ pageId, fields, initialState }) => {
    const [formState, setFormState] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const docRef = doc(db, 'pages', pageId);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormState(docSnap.data());
        });
    }, [pageId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await setDoc(doc(db, 'pages', pageId), formState);
        setIsSubmitting(false);
        alert('Content updated!');
    };

    return (
        <AdminSection title={`Edit ${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Page`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {Object.entries(fields).map(([name, { label, type }]) => 
                    type === 'textarea' ? 
                    <FormTextarea key={name} name={name} label={label} value={formState[name] || ''} onChange={handleInputChange} rows={5} /> :
                    <FormInput key={name} name={name} label={label} value={formState[name] || ''} onChange={handleInputChange} />
                )}
                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 font-semibold disabled:bg-amber-300">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </AdminSection>
    );
};

const AboutManager = () => <PageContentManager 
    pageId="about"
    initialState={{ paragraph1_en: '', paragraph2_en: '', paragraph1_km: '', paragraph2_km: '' }}
    fields={{
        paragraph1_en: { label: 'Paragraph 1 (English)', type: 'textarea' },
        paragraph1_km: { label: 'Paragraph 1 (Khmer)', type: 'textarea' },
        paragraph2_en: { label: 'Paragraph 2 (English)', type: 'textarea' },
        paragraph2_km: { label: 'Paragraph 2 (Khmer)', type: 'textarea' },
    }} 
/>;

const ContactManager = () => <PageContentManager 
    pageId="contact"
    initialState={{ address_en: '', address_km: '', phone: '', email: '' }}
    fields={{
        address_en: { label: 'Address (English)', type: 'input' },
        address_km: { label: 'Address (Khmer)', type: 'input' },
        phone: { label: 'Phone Number', type: 'input' },
        email: { label: 'Email Address', type: 'input' },
    }} 
/>;

// All other managers will be placeholders for now.
const ComingSoon: React.FC<{title: string}> = ({ title }) => (
    <AdminSection title={title}>
        <p className="text-stone-500 text-center">This feature is currently under development. Please check back later!</p>
    </AdminSection>
);

const GalleryManager = () => <ComingSoon title="Gallery Management" />;
const EventManager = () => <ComingSoon title="Events Management" />;
const TeachingsManager = () => <ComingSoon title="Teachings Management" />;


export default Admin;
