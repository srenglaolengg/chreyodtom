import React, { useState, useEffect, FormEvent } from 'react';
import { FirebaseUser, Post, Comment as CommentType, GalleryAlbum, Event as EventType, Teaching, AboutContent, ContactInfo } from '../types';
import { auth, db, githubProvider, storage } from '../firebase';
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
    getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import PageMeta from '../components/PageMeta';
import { Newspaper, MessageSquare, Image as ImageIcon, Calendar, BookOpen, Info, Phone, Menu, X, LogOut, Edit, Trash2, Languages, Wand2, UploadCloud } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- AI TRANSLATION COMPONENT ---
const AiTranslateButton: React.FC<{
  sourceText: string;
  sourceLang: 'English';
  targetLang: 'Khmer';
  onTranslated: (translatedText: string) => void;
  className?: string;
}> = ({ sourceText, onTranslated, sourceLang, targetLang, className }) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      alert('Please enter some text to translate.');
      return;
    }
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Translate the following ${sourceLang} text to ${targetLang}. Return ONLY the translated text, without any additional introductory phrases, formatting, or explanations.\n\nText: "${sourceText}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const translatedText = response.text.trim();
      onTranslated(translatedText);
    } catch (error) {
      console.error('AI Translation Error:', error);
      alert('Failed to translate text. Please check the console for details.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={isTranslating}
      className={`inline-flex items-center justify-center p-2 text-stone-500 hover:text-amber-600 bg-stone-100 hover:bg-amber-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait ${className}`}
      title={`Translate from ${sourceLang} to ${targetLang}`}
    >
      {isTranslating ? (
        <Wand2 className="w-4 h-4 animate-spin" />
      ) : (
        <Languages className="w-4 h-4" />
      )}
    </button>
  );
};


// FORM TYPES
type PostFormState = Omit<Post, 'id' | 'timestamp' | 'author'> & { id?: string };
type GalleryFormState = Omit<GalleryAlbum, 'id'> & { id?: string };
type EventFormState = Omit<EventType, 'id'> & { id?: string };
type TeachingFormState = Omit<Teaching, 'id'> & { id?: string };

const initialPostFormState: PostFormState = { title: '', content: '', imageUrl: '' };
const initialGalleryFormState: GalleryFormState = { order: 0, title_en: '', title_km: '', description_en: '', description_km: '', content_en: '', content_km: '', thumbnailUrl: '', imageUrls: [] };
const initialEventFormState: EventFormState = { order: 0, imgSrc: '', date_en: '', title_en: '', description_en: '', content_en: '', date_km: '', title_km: '', description_km: '', content_km: '', imageUrls: [] };
const initialTeachingFormState: TeachingFormState = { order: 0, title_en: '', content_en: '', title_km: '', content_km: '', excerpt_en: '', excerpt_km: '', thumbnailUrl: '', imageUrls: [] };


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
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'contact', label: 'Contact Page', icon: Phone },
];


// --- FILE UPLOAD HELPERS ---
const ImageUploadInput: React.FC<{
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    folder: string;
    helperText?: string;
    required?: boolean;
}> = ({ name, label, value, onChange, folder, helperText, required }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            const syntheticEvent = {
                target: { name, value: downloadURL }
            } as React.ChangeEvent<HTMLInputElement>;
            
            onChange(syntheticEvent);

        } catch (error) {
            console.error("Upload error:", error);
            setUploadError("File upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center space-x-2">
                <input 
                    id={name} 
                    name={name} 
                    type="url"
                    value={value}
                    onChange={onChange}
                    placeholder="Enter image URL or upload"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required={required}
                />
                <label htmlFor={`${name}-file`} className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-md border border-slate-300 whitespace-nowrap inline-flex items-center space-x-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </label>
                <input 
                    id={`${name}-file`} 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
            </div>
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
            {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

const MultiImageUploadInput: React.FC<{
    name: string;
    label: string;
    value: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    folder: string;
    helperText?: string;
}> = ({ name, label, value, onChange, folder, helperText }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                return await getDownloadURL(snapshot.ref);
            });
            
            const downloadURLs = await Promise.all(uploadPromises);
            
            const newValue = [...value, ...downloadURLs].join('\n');

            const syntheticEvent = {
                target: { name, value: newValue }
            } as React.ChangeEvent<HTMLTextAreaElement>;
            
            onChange(syntheticEvent);

        } catch (error) {
            console.error("Upload error:", error);
            setUploadError("File upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea 
                id={name} 
                name={name}
                value={value.join('\n')}
                onChange={onChange}
                rows={6}
                placeholder="Enter one image URL per line, or upload multiple files."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
            />
             <label htmlFor={`${name}-file`} className="mt-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-md border border-slate-300 inline-flex items-center space-x-2">
                 <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
            </label>
            <input 
                id={`${name}-file`} 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
                multiple
            />
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
            {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};


const Admin: React.FC<AdminProps> = ({ user, isAdmin, authLoading }) => {
    const [view, setView] = useState<ViewType>('feed');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const postToEditFromState = (location.state as any)?.postToEdit as Post | undefined;
        if (postToEditFromState) {
            setView('feed');
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);
    
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
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
                    <h1 className="text-4xl font-serif text-slate-800 mb-4">Admin Access</h1>
                    <p className="text-slate-600 mb-8 max-w-sm">Please log in with an authorized GitHub account to access the content management dashboard.</p>
                    <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-slate-800 text-white px-6 py-3 rounded-full hover:bg-slate-900 transition-all duration-300 shadow-lg transform hover:scale-105">
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
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
                    <h1 className="text-3xl font-serif text-red-800 mb-4">Access Denied</h1>
                    <p className="text-slate-600 mb-8">You are not authorized to view this page.</p>
                    <button onClick={handleLogout} className="inline-flex items-center space-x-3 bg-slate-500 text-white px-6 py-2 rounded-full hover:bg-slate-600 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </>
        );
    }
    
    const SidebarNav = () => (
      <nav className="flex flex-col p-2 space-y-1">
          {navItems.map(item => (
              <button
                  key={item.id}
                  onClick={() => { setView(item.id); setIsMenuOpen(false); }}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 text-left w-full text-sm ${ view === item.id ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white' }`}
              >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
              </button>
          ))}
      </nav>
    );

    const renderView = () => {
        switch (view) {
            case 'feed': return <FeedManager user={user} postToEdit={(location.state as any)?.postToEdit} />;
            case 'comments': return <CommentManager />;
            case 'gallery': return <GalleryManager />;
            case 'events': return <EventManager />;
            case 'teachings': return <TeachingsManager />;
            case 'about': return <AboutManager />;
            case 'contact': return <ContactManager />;
            default: return <AdminSection title="Dashboard"><p>Select a section to manage.</p></AdminSection>;
        }
    }

    return (
        <>
            <PageMeta title="Admin Dashboard | Wat Serei Mongkol" description={metaDescription} robots={metaRobots} />
            <div className="min-h-screen bg-slate-100 lg:flex">
                <aside className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-4 border-b border-slate-700 h-16">
                        <h1 className="text-lg font-bold text-amber-400">Admin Panel</h1>
                         <button onClick={() => setIsMenuOpen(false)} className="lg:hidden text-slate-300 hover:text-white"> <X className="w-6 h-6" /> </button>
                    </div>
                    <SidebarNav />
                </aside>
                
                <div className="flex-1 flex flex-col">
                    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 lg:z-30 h-16 flex items-center">
                        <div className="w-full mx-auto px-6 flex justify-between items-center">
                            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-slate-700"> <Menu className="w-6 h-6" /> </button>
                            <div className="text-lg font-semibold text-slate-800 capitalize hidden sm:block">{navItems.find(i => i.id === view)?.label} Management</div>
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold text-slate-700 hidden sm:block">{user.displayName}</span>
                                {user.photoURL && <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full border-2 border-amber-400" />}
                                <button onClick={handleLogout} title="Logout" className="text-slate-600 hover:text-red-800 transition-colors"> <LogOut className="w-5 h-5"/> </button>
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
const AdminSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">{title}</h2>
        {children}
    </div>
);
const FormInput: React.FC<{ name: string; label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = ({ name, label, ...props }) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={name} name={name} {...props} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
    </div>
);
const FormTextarea: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; required?: boolean; helperText?: string }> = ({ name, label, helperText, ...props }) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={name} name={name} {...props} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"></textarea>
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
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
        const unsub = onSnapshot(q, snap => setPosts(snap.docs.map(d => Object.assign({ id: d.id }, d.data()) as Post)));
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
    const handleDelete = async (id: string) => { if (window.confirm('Are you sure you want to delete this post?')) await deleteDoc(doc(db, "posts", id)); };

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
                    <FormTextarea name="content" label="Content (Markdown supported)" value={formState.content} onChange={handleInputChange} required rows={10} />
                    <ImageUploadInput name="imageUrl" label="Header Image URL (Optional)" value={formState.imageUrl || ''} onChange={handleInputChange} folder="posts" />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:bg-amber-300 transition-colors">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-300 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Manage Posts">
                <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {posts.map(post => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-900">{post.title}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-500">{post.author}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-500">{post.timestamp?.toDate().toLocaleDateString()}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end space-x-2">
                                        <button onClick={() => handleEditClick(post)} className="p-2 text-slate-500 hover:text-amber-600 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-500 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
        </div>
    );
};

const CommentManager: React.FC = () => {
    const [comments, setComments] = useState<CommentType[]>([]);
    useEffect(() => {
        const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, snap => setComments(snap.docs.map(d => Object.assign({ id: d.id }, d.data()) as CommentType)));
        return () => unsub();
    }, []);

    const handleDelete = async (id: string) => { if (window.confirm('Delete this comment permanently?')) await deleteDoc(doc(db, "comments", id)); };

    return (
        <AdminSection title="Comment Moderation">
             <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Comment</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-slate-200">
                        {comments.length > 0 ? comments.map(comment => (
                            <tr key={comment.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {comment.user.photoURL && <img className="h-8 w-8 rounded-full mr-3" src={comment.user.photoURL} alt="" />}
                                        <div className="text-sm font-medium text-slate-900">{comment.user.displayName}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap max-w-lg">{comment.text}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-500">{comment.createdAt?.toDate().toLocaleString()}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(comment.id)} className="p-2 text-slate-500 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center py-8 text-slate-500">No comments found.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
        </AdminSection>
    );
};

const ContentManagerBase: React.FC<{
    collectionName: 'gallery' | 'events' | 'teachings';
    itemTypeLabel: string;
    initialFormState: any;
    formFields: (formState: any, handleInputChange: any, handleAiTranslate: any) => React.ReactNode;
    renderListItem: (item: any, handleEditClick: any, handleDelete: any) => React.ReactNode;
}> = ({ collectionName, itemTypeLabel, initialFormState, formFields, renderListItem }) => {
    const [items, setItems] = useState<any[]>([]);
    const [formState, setFormState] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, collectionName), orderBy("order", "asc"));
        const unsub = onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => unsub();
    }, [collectionName]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'imageUrls') {
            setFormState(p => ({ ...p, imageUrls: value.split('\n').filter(url => url.trim() !== '') }));
        } else {
            setFormState(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
        }
    };
    const handleAiTranslate = (fieldName: string, translatedText: string) => {
        setFormState(p => ({ ...p, [fieldName]: translatedText }));
    };

    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialFormState); };
    const handleEditClick = (item: any) => {
        setIsEditing(true);
        setFormState({ ...item, imageUrls: item.imageUrls || [] });
        window.scrollTo(0, 0);
    };
    const handleDelete = async (id: string) => { if (window.confirm(`Delete this ${itemTypeLabel}?`)) await deleteDoc(doc(db, collectionName, id)); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSave = { ...formState };
        delete dataToSave.id;

        try {
            if (isEditing && formState.id) {
                await updateDoc(doc(db, collectionName, formState.id), dataToSave);
            } else {
                await addDoc(collection(db, collectionName), dataToSave);
            }
            handleCancelEdit();
        } catch (err) { console.error(err); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="space-y-8">
            <AdminSection title={isEditing ? `Edit ${itemTypeLabel}` : `Create New ${itemTypeLabel}`}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formFields(formState, handleInputChange, handleAiTranslate)}
                    <div className="flex items-center space-x-4 pt-2">
                        <button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:bg-amber-300 transition-colors">
                            {isSubmitting ? 'Saving...' : (isEditing ? `Update ${itemTypeLabel}` : `Create ${itemTypeLabel}`)}
                        </button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-300 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title={`Manage ${itemTypeLabel}s`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => renderListItem(item, handleEditClick, handleDelete))}
                </div>
            </AdminSection>
        </div>
    );
};


const TranslationFieldGroup: React.FC<{
    formState: any; handleInputChange: any; handleAiTranslate: any;
    nameEn: string; nameKm: string; labelEn: string; labelKm: string; type?: 'input' | 'textarea'; rows?: number
}> = ({formState, handleInputChange, handleAiTranslate, nameEn, nameKm, labelEn, labelKm, type = 'input', rows }) => (
     <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-x-2 items-center">
        {type === 'input' ? 
            <FormInput name={nameEn} label={labelEn} value={formState[nameEn]} onChange={handleInputChange} /> : 
            <FormTextarea name={nameEn} label={labelEn} value={formState[nameEn]} onChange={handleInputChange} rows={rows} />
        }
        <div className="mt-6 self-start"><AiTranslateButton sourceText={formState[nameEn]} onTranslated={(text) => handleAiTranslate(nameKm, text)} sourceLang="English" targetLang="Khmer" /></div>
        {type === 'input' ? 
            <FormInput name={nameKm} label={labelKm} value={formState[nameKm]} onChange={handleInputChange} /> : 
            <FormTextarea name={nameKm} label={labelKm} value={formState[nameKm]} onChange={handleInputChange} rows={rows} />
        }
    </div>
);

const ListItemCard: React.FC<{item: any, title: string, subtitle: string, imageUrl: string, onEdit: () => void, onDelete: () => void}> = ({item, title, subtitle, imageUrl, onEdit, onDelete}) => (
    <div key={item.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <img src={imageUrl} alt={title} className="w-full h-32 object-cover" />
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="font-bold text-slate-800 flex-grow">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="p-2 border-t border-slate-200 bg-slate-50 flex justify-end items-center space-x-1">
            <button onClick={onEdit} className="p-2 text-slate-500 hover:text-amber-600 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
    </div>
)

const GalleryManager = () => <ContentManagerBase
    collectionName="gallery"
    itemTypeLabel="Album"
    initialFormState={initialGalleryFormState}
    formFields={(formState, handleInputChange, handleAiTranslate) => (
        <>
            <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" required />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="title_en" nameKm="title_km" labelEn="Title (English)" labelKm="Title (Khmer)" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="description_en" nameKm="description_km" labelEn="Short Description (English)" labelKm="Short Description (Khmer)" type="textarea" rows={3}/>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="content_en" nameKm="content_km" labelEn="Full Content (English)" labelKm="Full Content (Khmer)" type="textarea" rows={6}/>
            <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={formState.thumbnailUrl} onChange={handleInputChange} folder="gallery/thumbnails" required />
            <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls} onChange={handleInputChange} folder="gallery/details" helperText="Enter one URL per line or upload files." />
        </>
    )}
    renderListItem={(item, handleEditClick, handleDelete) => (
        <ListItemCard item={item} title={item.title_en} subtitle={`Order: ${item.order}`} imageUrl={item.thumbnailUrl} onEdit={() => handleEditClick(item)} onDelete={() => handleDelete(item.id)} />
    )}
/>;

const EventManager = () => <ContentManagerBase
    collectionName="events"
    itemTypeLabel="Event"
    initialFormState={initialEventFormState}
    formFields={(formState, handleInputChange, handleAiTranslate) => (
        <>
            <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormInput name="date_en" label="Date (English)" value={formState.date_en} onChange={handleInputChange} />
                 <FormInput name="date_km" label="Date (Khmer)" value={formState.date_km} onChange={handleInputChange} />
            </div>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="title_en" nameKm="title_km" labelEn="Title (English)" labelKm="Title (Khmer)" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="description_en" nameKm="description_km" labelEn="Short Description (English)" labelKm="Short Description (Khmer)" type="textarea" rows={3}/>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="content_en" nameKm="content_km" labelEn="Full Content (English)" labelKm="Full Content (Khmer)" type="textarea" rows={6}/>
            <ImageUploadInput name="imgSrc" label="Thumbnail Image URL" value={formState.imgSrc} onChange={handleInputChange} folder="events/thumbnails" required />
            <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls || []} onChange={handleInputChange} folder="events/details" helperText="Optional. One URL per line or upload files." />
        </>
    )}
    renderListItem={(item, handleEditClick, handleDelete) => (
        <ListItemCard item={item} title={item.title_en} subtitle={item.date_en} imageUrl={item.imgSrc} onEdit={() => handleEditClick(item)} onDelete={() => handleDelete(item.id)} />
    )}
/>;

const TeachingsManager = () => <ContentManagerBase
    collectionName="teachings"
    itemTypeLabel="Teaching"
    initialFormState={initialTeachingFormState}
    formFields={(formState, handleInputChange, handleAiTranslate) => (
         <>
            <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" required />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="title_en" nameKm="title_km" labelEn="Title (English)" labelKm="Title (Khmer)" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="excerpt_en" nameKm="excerpt_km" labelEn="Excerpt (English)" labelKm="Excerpt (Khmer)" type="textarea" rows={3}/>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} handleAiTranslate={handleAiTranslate} nameEn="content_en" nameKm="content_km" labelEn="Full Content (English)" labelKm="Full Content (Khmer)" type="textarea" rows={8}/>
            <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={formState.thumbnailUrl} onChange={handleInputChange} folder="teachings/thumbnails" required />
            <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls || []} onChange={handleInputChange} folder="teachings/details" helperText="Optional. One URL per line or upload files." />
        </>
    )}
     renderListItem={(item, handleEditClick, handleDelete) => (
        <ListItemCard item={item} title={item.title_en} subtitle={`Order: ${item.order}`} imageUrl={item.thumbnailUrl} onEdit={() => handleEditClick(item)} onDelete={() => handleDelete(item.id)} />
    )}
/>;


const PageContentManager: React.FC<{pageId: 'about' | 'contact', fields: Record<string, { label: string; type: string; }>, initialState: any}> = ({ pageId, fields, initialState }) => {
    const [formState, setFormState] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, 'pages', pageId);
        const unsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) setFormState(docSnap.data());
            setIsLoading(false);
        });
        return () => unsub();
    }, [pageId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await setDoc(doc(db, 'pages', pageId), formState);
        setIsSubmitting(false);
        alert('Content updated successfully!');
    };

    if (isLoading) {
        return <AdminSection title={`Edit ${pageId} Page`}><div className="text-slate-500">Loading content...</div></AdminSection>
    }

    return (
        <AdminSection title={`Edit ${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Page Content`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {Object.entries(fields).map(([name, { label, type }]) => 
                    type === 'textarea' ? 
                    <FormTextarea key={name} name={name} label={label} value={formState[name] || ''} onChange={handleInputChange} rows={5} /> :
                    <FormInput key={name} name={name} label={label} value={formState[name] || ''} onChange={handleInputChange} />
                )}
                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:bg-amber-300 transition-colors">
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

export default Admin;