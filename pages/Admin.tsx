import React, { useState, useEffect, FormEvent, useMemo } from 'react';
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
    addDoc,
    updateDoc,
    setDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    getDoc,
    limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import PageMeta from '../components/PageMeta';
import { Newspaper, MessageSquare, Image as ImageIcon, Calendar, BookOpen, Info, Phone, Menu, X, LogOut, UploadCloud, LayoutDashboard } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';

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

type ViewType = 'dashboard' | 'feed' | 'comments' | 'gallery' | 'events' | 'teachings' | 'about' | 'contact';

const navItems: { id: ViewType; label: string; icon: React.FC<any> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feed', label: 'Feed', icon: Newspaper },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'teachings', label: 'Teachings', icon: BookOpen },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'contact', label: 'Contact Page', icon: Phone },
];


// --- FILE UPLOAD HELPERS ---
const ImageUploadInput: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; folder: string; helperText?: string; required?: boolean; }> = ({ name, label, value, onChange, folder, helperText, required }) => {
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
            
            onChange({ target: { name, value: downloadURL } } as React.ChangeEvent<HTMLInputElement>);

        } catch (error) { console.error("Upload error:", error); setUploadError("File upload failed."); } 
        finally { setIsUploading(false); }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center space-x-2">
                <input id={name} name={name} type="url" value={value} onChange={onChange} placeholder="Enter image URL or upload" className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500" required={required} />
                <label htmlFor={`${name}-file`} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md border border-gray-300 whitespace-nowrap transition-colors inline-flex items-center space-x-2">
                    <UploadCloud className="w-4 h-4"/>
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </label>
                <input id={`${name}-file`} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
            </div>
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
            {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

const MultiImageUploadInput: React.FC<{ name: string; label: string; value: string[]; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; folder: string; helperText?: string; }> = ({ name, label, value, onChange, folder, helperText }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadCount, setUploadCount] = useState(0);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadCount(files.length);
        setUploadError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                return getDownloadURL(snapshot.ref);
            });
            const downloadURLs = await Promise.all(uploadPromises);
            onChange({ target: { name, value: [...value, ...downloadURLs].join('\n') } } as React.ChangeEvent<HTMLTextAreaElement>);
        } catch (error) { console.error("Upload error:", error); setUploadError("File upload failed."); } 
        finally { setIsUploading(false); setUploadCount(0); }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea id={name} name={name} value={value.join('\n')} onChange={onChange} rows={6} placeholder="Enter one image URL per line, or upload files." className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-sm" />
             <label htmlFor={`${name}-file`} className="mt-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md border border-gray-300 inline-flex items-center space-x-2 transition-colors">
                <UploadCloud className="w-4 h-4"/>
                <span>{isUploading ? `Uploading ${uploadCount}...` : 'Upload Files'}</span>
            </label>
            <input id={`${name}-file`} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} multiple />
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
            {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

// --- GENERIC HELPER COMPONENTS ---
const AdminSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        {children}
    </div>
);
const FormInput: React.FC<{ name: string; label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = ({ name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={name} name={name} {...props} className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500"/>
    </div>
);
const FormTextarea: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; required?: boolean; helperText?: string }> = ({ name, label, helperText, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={name} name={name} {...props} className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500"></textarea>
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
);


// --- MANAGER COMPONENTS ---
const FeedManager: React.FC<{user: FirebaseUser, postToEdit?: Post}> = ({ user, postToEdit }) => {
    const q = useMemo(() => query(collection(db, "posts"), orderBy("timestamp", "desc")), []);
    const { data: posts } = useCollection<Post>(q);

    const [formState, setFormState] = useState<PostFormState>(initialPostFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
            const data = { title: formState.title, content: formState.content, imageUrl: formState.imageUrl || '' };
            if (isEditing && formState.id) {
                await updateDoc(doc(db, "posts", formState.id), data);
            } else {
                await addDoc(collection(db, "posts"), { ...data, author: user.displayName || 'Admin', timestamp: serverTimestamp() });
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
                    <ImageUploadInput name="imageUrl" label="Image URL (Optional)" value={formState.imageUrl || ''} onChange={handleInputChange} folder="posts" />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Manage Posts">
                <div className="space-y-3">
                    {posts.map(post => (
                        <div key={post.id} className="p-4 border border-gray-200 rounded-md flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                            <div>
                                <h3 className="font-bold text-gray-900">{post.title}</h3>
                                <p className="text-sm text-gray-500">By {post.author} on {post.timestamp?.toDate().toLocaleDateString()}</p>
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
    const q = useMemo(() => query(collection(db, "comments"), orderBy("createdAt", "desc")), []);
    const { data: comments } = useCollection<CommentType>(q);

    const handleDelete = async (id: string) => { if (window.confirm('Delete this comment?')) await deleteDoc(doc(db, "comments", id)); };

    return (
        <AdminSection title="Comment Moderation">
            <div className="space-y-4">
                {comments && comments.length > 0 ? comments.map(comment => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <img src={comment.user.photoURL || ''} alt="" className="w-6 h-6 rounded-full"/>
                                    <p className="font-bold text-gray-900">{comment.user.displayName}</p>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{comment.createdAt?.toDate().toLocaleString()}</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                            </div>
                            <button onClick={() => handleDelete(comment.id)} className="text-sm font-semibold text-red-600 hover:underline ml-4">Delete</button>
                        </div>
                    </div>
                )) : <p className="text-gray-500">No comments found.</p>}
            </div>
        </AdminSection>
    );
};

const useCmsManager = <T extends {id: string}, F extends Omit<T, 'id'> & {id?: string}>(collectionName: string, orderByField: string, initialState: F) => {
    const q = useMemo(() => query(collection(db, collectionName), orderBy(orderByField, "asc")), [collectionName, orderByField]);
    const { data: items } = useCollection<T>(q);

    const [formState, setFormState] = useState<F>(initialState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'imageUrls') {
            setFormState(p => ({ ...p, imageUrls: value.split('\n').filter(url => url.trim() !== '') } as F));
        } else {
            setFormState(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
        }
    };

    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialState); };
    const handleEditClick = (item: T) => {
        setIsEditing(true);
        // @ts-ignore
        setFormState({ ...item, imageUrls: item.imageUrls || [] });
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(`Delete this item from ${collectionName}?`)) {
            await deleteDoc(doc(db, collectionName, id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { id, ...dataToSave } = formState;

        try {
            if (isEditing && id) {
                await updateDoc(doc(db, collectionName, id), dataToSave);
            } else {
                await addDoc(collection(db, collectionName), dataToSave);
            }
            handleCancelEdit();
        } catch (err) { console.error(err); } 
        finally { setIsSubmitting(false); }
    };

    return { items, formState, isEditing, isSubmitting, handleInputChange, handleSubmit, handleEditClick, handleDelete, handleCancelEdit };
};


const GalleryManager: React.FC = () => {
    const manager = useCmsManager<GalleryAlbum, GalleryFormState>("gallery", "order", initialGalleryFormState);
    return (
        <div className="space-y-8">
            <AdminSection title={manager.isEditing ? 'Edit Album' : 'Create New Album'}>
                <form onSubmit={manager.handleSubmit} className="space-y-4">
                    <FormInput name="order" label="Order" value={manager.formState.order} onChange={manager.handleInputChange} type="number" required />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormInput name="title_en" label="Title (English)" value={manager.formState.title_en} onChange={manager.handleInputChange} required />
                      <FormInput name="title_km" label="Title (Khmer)" value={manager.formState.title_km} onChange={manager.handleInputChange} required />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormTextarea name="description_en" label="Short Description (English)" value={manager.formState.description_en} onChange={manager.handleInputChange} rows={3} />
                        <FormTextarea name="description_km" label="Short Description (Khmer)" value={manager.formState.description_km} onChange={manager.handleInputChange} rows={3} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormTextarea name="content_en" label="Full Content (English)" value={manager.formState.content_en} onChange={manager.handleInputChange} rows={6} />
                        <FormTextarea name="content_km" label="Full Content (Khmer)" value={manager.formState.content_km} onChange={manager.handleInputChange} rows={6} />
                    </div>
                    <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={manager.formState.thumbnailUrl} onChange={manager.handleInputChange} folder="gallery/thumbnails" required />
                    <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={manager.formState.imageUrls} onChange={manager.handleInputChange} folder="gallery/details" helperText="Enter one image URL per line, or upload files." />
                    <div className="flex items-center space-x-4 pt-2">
                        <button type="submit" disabled={manager.isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors">{manager.isSubmitting ? 'Saving...' : (manager.isEditing ? 'Update Album' : 'Create Album')}</button>
                        {manager.isEditing && <button type="button" onClick={manager.handleCancelEdit} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Manage Gallery Albums">
                 <div className="space-y-3">
                    {manager.items.map(item => (
                        <div key={item.id} className="p-3 border border-gray-200 rounded-md flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                             <div className="flex items-center gap-4 min-w-0">
                                <img src={item.thumbnailUrl} alt={item.title_en} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{item.title_en} / {item.title_km}</h3>
                                    <p className="text-sm text-gray-500">Order: {item.order}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => manager.handleEditClick(item)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => manager.handleDelete(item.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminSection>
        </div>
    );
};

const EventManager: React.FC = () => {
    const manager = useCmsManager<EventType, EventFormState>("events", "order", initialEventFormState);
    return (
        <div className="space-y-8">
            <AdminSection title={manager.isEditing ? 'Edit Event' : 'Create New Event'}>
                <form onSubmit={manager.handleSubmit} className="space-y-4">
                    <FormInput name="order" label="Order" value={manager.formState.order} onChange={manager.handleInputChange} type="number" required />
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormInput name="title_en" label="Title (English)" value={manager.formState.title_en} onChange={manager.handleInputChange} required />
                        <FormInput name="title_km" label="Title (Khmer)" value={manager.formState.title_km} onChange={manager.handleInputChange} required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormInput name="date_en" label="Date (English)" value={manager.formState.date_en} onChange={manager.handleInputChange} />
                        <FormInput name="date_km" label="Date (Khmer)" value={manager.formState.date_km} onChange={manager.handleInputChange} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormTextarea name="description_en" label="Short Description (English)" value={manager.formState.description_en} onChange={manager.handleInputChange} rows={3} />
                        <FormTextarea name="description_km" label="Short Description (Khmer)" value={manager.formState.description_km} onChange={manager.handleInputChange} rows={3} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormTextarea name="content_en" label="Full Content (English)" value={manager.formState.content_en} onChange={manager.handleInputChange} rows={6} />
                        <FormTextarea name="content_km" label="Full Content (Khmer)" value={manager.formState.content_km} onChange={manager.handleInputChange} rows={6} />
                    </div>
                    <ImageUploadInput name="imgSrc" label="Thumbnail Image URL" value={manager.formState.imgSrc} onChange={manager.handleInputChange} folder="events/thumbnails" required />
                    <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={manager.formState.imageUrls || []} onChange={manager.handleInputChange} folder="events/details" helperText="Optional. Enter one image URL per line, or upload files." />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={manager.isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors">{manager.isSubmitting ? 'Saving...' : (manager.isEditing ? 'Update Event' : 'Create Event')}</button>
                        {manager.isEditing && <button type="button" onClick={manager.handleCancelEdit} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
             <AdminSection title="Manage Events">
                <div className="space-y-3">
                    {manager.items.map(item => (
                        <div key={item.id} className="p-3 border border-gray-200 rounded-md flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                             <div className="flex items-center gap-4 min-w-0">
                                <img src={item.imgSrc} alt={item.title_en} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{item.title_en}</h3>
                                    <p className="text-sm text-gray-500 truncate">{item.date_en}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => manager.handleEditClick(item)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => manager.handleDelete(item.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminSection>
        </div>
    );
};

const TeachingsManager: React.FC = () => {
    const manager = useCmsManager<Teaching, TeachingFormState>("teachings", "order", initialTeachingFormState);
    return (
        <div className="space-y-8">
            <AdminSection title={manager.isEditing ? 'Edit Teaching' : 'Create New Teaching'}>
                <form onSubmit={manager.handleSubmit} className="space-y-4">
                    <FormInput name="order" label="Order" value={manager.formState.order} onChange={manager.handleInputChange} type="number" required />
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormInput name="title_en" label="Title (English)" value={manager.formState.title_en} onChange={manager.handleInputChange} required />
                        <FormInput name="title_km" label="Title (Khmer)" value={manager.formState.title_km} onChange={manager.handleInputChange} required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormTextarea name="excerpt_en" label="Excerpt (English)" value={manager.formState.excerpt_en} onChange={manager.handleInputChange} rows={3} />
                        <FormTextarea name="excerpt_km" label="Excerpt (Khmer)" value={manager.formState.excerpt_km} onChange={manager.handleInputChange} rows={3} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormTextarea name="content_en" label="Full Content (English)" value={manager.formState.content_en} onChange={manager.handleInputChange} rows={8} />
                        <FormTextarea name="content_km" label="Full Content (Khmer)" value={manager.formState.content_km} onChange={manager.handleInputChange} rows={8} />
                    </div>
                    <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={manager.formState.thumbnailUrl} onChange={manager.handleInputChange} folder="teachings/thumbnails" required />
                    <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={manager.formState.imageUrls || []} onChange={manager.handleInputChange} folder="teachings/details" helperText="Optional. Enter one image URL per line, or upload files." />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={manager.isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors">{manager.isSubmitting ? 'Saving...' : (manager.isEditing ? 'Update Teaching' : 'Create Teaching')}</button>
                        {manager.isEditing && <button type="button" onClick={manager.handleCancelEdit} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
             <AdminSection title="Manage Teachings">
                <div className="space-y-3">
                    {manager.items.map(item => (
                        <div key={item.id} className="p-3 border border-gray-200 rounded-md flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
                             <div className="flex items-center gap-4 min-w-0">
                                <img src={item.thumbnailUrl} alt={item.title_en} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{item.title_en}</h3>
                                    <p className="text-sm text-gray-500">Order: {item.order}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => manager.handleEditClick(item)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => manager.handleDelete(item.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminSection>
        </div>
    );
};

const PageContentManager: React.FC<{pageId: 'about' | 'contact', fields: Record<string, { label: string; type: string; }>, initialState: any}> = ({ pageId, fields, initialState }) => {
    const [formState, setFormState] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, 'pages', pageId);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) setFormState(docSnap.data());
            setIsLoading(false);
        });
    }, [pageId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await setDoc(doc(db, 'pages', pageId), formState);
            alert('Content updated successfully!');
        } catch (error) { console.error(error); alert('Failed to update content.'); } 
        finally { setIsSubmitting(false); }
    };
    
    if (isLoading) {
        return <AdminSection title={`Edit ${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Page`}><p>Loading content...</p></AdminSection>
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
                    <button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors">
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


const DashboardView: React.FC = () => {
    const { data: posts } = useCollection<Post>(query(collection(db, "posts")));
    const { data: comments } = useCollection<CommentType>(query(collection(db, "comments")));
    const { data: albums } = useCollection<GalleryAlbum>(query(collection(db, "gallery")));
    const { data: events } = useCollection<EventType>(query(collection(db, "events")));
    const { data: teachings } = useCollection<Teaching>(query(collection(db, "teachings")));

    const recentCommentsQuery = useMemo(() => query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(5)), []);
    const { data: recentComments } = useCollection<CommentType>(recentCommentsQuery);

    const handleDeleteComment = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            await deleteDoc(doc(db, "comments", id));
        }
    };

    const StatCard: React.FC<{ title: string; value: number; icon: React.FC<any> }> = ({ title, value, icon: Icon }) => (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center space-x-4">
            <div className="bg-amber-100 p-3 rounded-full">
                <Icon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard title="Feed Posts" value={posts.length} icon={Newspaper} />
                <StatCard title="Comments" value={comments.length} icon={MessageSquare} />
                <StatCard title="Gallery Albums" value={albums.length} icon={ImageIcon} />
                <StatCard title="Events" value={events.length} icon={Calendar} />
                <StatCard title="Teachings" value={teachings.length} icon={BookOpen} />
            </div>
            <AdminSection title="Recent Comments">
                 <div className="space-y-4">
                    {recentComments && recentComments.length > 0 ? recentComments.map(comment => (
                        <div key={comment.id} className="p-4 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <img src={comment.user.photoURL || ''} alt="" className="w-6 h-6 rounded-full"/>
                                        <p className="font-bold text-gray-900">{comment.user.displayName}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{comment.createdAt?.toDate().toLocaleString()}</p>
                                    <p className="text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                                </div>
                                <button onClick={() => handleDeleteComment(comment.id)} className="text-sm font-semibold text-red-600 hover:underline ml-4">Delete</button>
                            </div>
                        </div>
                    )) : <p className="text-gray-500">No recent comments.</p>}
                </div>
            </AdminSection>
        </div>
    );
};


// --- MAIN ADMIN COMPONENT ---
const Admin: React.FC<AdminProps> = ({ user, isAdmin, authLoading }) => {
    const [view, setView] = useState<ViewType>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const postToEditFromState = (location.state as any)?.postToEdit as Post | undefined;
        if (postToEditFromState) {
            setView('feed');
            navigate(location.pathname, { replace: true }); // Clear state
        }
    }, [location, navigate]);
    
    const handleLogin = async () => await signInWithPopup(auth, githubProvider);
    const handleLogout = async () => await signOut(auth);

    const metaDescription = "Content management system for the Wat Serei Mongkol website.";
    const metaRobots = "noindex, nofollow";

    if (authLoading) {
        return (
            <>
                <PageMeta title="Authenticating..." description="" robots={metaRobots} />
                <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Authenticating...</p></div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <PageMeta title="Admin Login" description={metaDescription} robots={metaRobots} />
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                    <h1 className="text-4xl text-amber-600 font-bold mb-4">Admin Access</h1>
                    <p className="text-gray-600 mb-8 max-w-sm">Please log in with an authorized GitHub account to access the content management dashboard.</p>
                    <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors shadow-lg font-semibold transform hover:scale-105">
                        <GitHubIcon className="w-6 h-6" />
                        <span>Login with GitHub</span>
                    </button>
                </div>
            </>
        );
    }
    
    if (!isAdmin) {
         return (
            <>
                <PageMeta title="Access Denied" description={metaDescription} robots={metaRobots} />
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                    <h1 className="text-3xl text-red-600 font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-8">You are not authorized to view this page.</p>
                    <button onClick={handleLogout} className="inline-flex items-center space-x-3 bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors">
                        <LogOut className="w-5 h-5" /><span>Logout</span>
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
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 text-left w-full text-sm ${ view === item.id ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }`}
              >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
              </button>
          ))}
      </nav>
    );

    const renderView = () => {
        switch (view) {
            case 'dashboard': return <DashboardView />;
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
            <div className="min-h-screen bg-gray-50 lg:flex">
                <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}></div>
                <aside className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-64 bg-white text-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-4 h-20 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-amber-600">Admin Panel</h1>
                         <button onClick={() => setIsMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800"> <X className="w-6 h-6" /> </button>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <SidebarNav />
                    </div>
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{user.displayName}</p>
                            </div>
                            <button onClick={handleLogout} title="Logout" className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-gray-100"> <LogOut className="w-5 h-5"/> </button>
                        </div>
                    </div>
                </aside>
                
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30 lg:hidden">
                        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-gray-800"> <Menu className="w-6 h-6" /> </button>
                            <div className="text-lg font-semibold text-gray-800 capitalize">{navItems.find(i => i.id === view)?.label}</div>
                            <div className="w-6"></div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8"> {renderView()} </main>
                </div>
            </div>
        </>
    );
};

export default Admin;