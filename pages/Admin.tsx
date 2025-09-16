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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import PageMeta from '../components/PageMeta';
import { Newspaper, MessageSquare, Image as ImageIcon, Calendar, BookOpen, Info, Phone, Menu, X, LogOut } from 'lucide-react';
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
            <label htmlFor={name} className="block text-sm font-medium text-foreground/80 mb-1">{label}</label>
            <div className="flex items-center space-x-2">
                <input 
                    id={name} 
                    name={name} 
                    type="url"
                    value={value}
                    onChange={onChange}
                    placeholder="Enter image URL or upload"
                    className="w-full p-2 border border-border bg-background rounded-md focus:ring-2 focus:ring-primary"
                    required={required}
                />
                <label htmlFor={`${name}-file`} className="cursor-pointer bg-background hover:bg-border text-foreground font-semibold px-4 py-2 rounded-md border border-border whitespace-nowrap transition-colors">
                    {isUploading ? 'Uploading...' : 'Upload'}
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
            {helperText && <p className="mt-1 text-xs text-foreground/60">{helperText}</p>}
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
            <label htmlFor={name} className="block text-sm font-medium text-foreground/80 mb-1">{label}</label>
            <textarea 
                id={name} 
                name={name}
                value={value.join('\n')}
                onChange={onChange}
                rows={6}
                placeholder="Enter one image URL per line, or upload files."
                className="w-full p-2 border border-border bg-background rounded-md focus:ring-2 focus:ring-primary font-mono text-sm"
            />
             <label htmlFor={`${name}-file`} className="mt-2 cursor-pointer bg-background hover:bg-border text-foreground font-semibold px-4 py-2 rounded-md border border-border inline-block transition-colors">
                {isUploading ? 'Uploading...' : 'Upload Files'}
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
            {helperText && <p className="mt-1 text-xs text-foreground/60">{helperText}</p>}
        </div>
    );
};

// --- GENERIC HELPER COMPONENTS ---
const AdminSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-card p-6 md:p-8 rounded-lg shadow-sm border border-border">
        <h2 className="text-2xl font-english font-bold text-primary mb-6">{title}</h2>
        {children}
    </div>
);
const FormInput: React.FC<{ name: string; label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = ({ name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-foreground/80 mb-1">{label}</label>
        <input id={name} name={name} {...props} className="w-full p-2 border border-border bg-background rounded-md focus:ring-2 focus:ring-primary"/>
    </div>
);
const FormTextarea: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; required?: boolean; helperText?: string }> = ({ name, label, helperText, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-foreground/80 mb-1">{label}</label>
        <textarea id={name} name={name} {...props} className="w-full p-2 border border-border bg-background rounded-md focus:ring-2 focus:ring-primary font-mono text-sm"></textarea>
        {helperText && <p className="mt-1 text-xs text-foreground/60">{helperText}</p>}
    </div>
);


// --- MANAGER COMPONENTS (defined outside Admin to prevent re-renders) ---
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
                    <ImageUploadInput name="imageUrl" label="Image URL (Optional)" value={formState.imageUrl || ''} onChange={handleInputChange} folder="posts" />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/80 font-semibold disabled:opacity-50 transition-colors">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-secondary/20 text-secondary px-6 py-2 rounded-full hover:bg-secondary/30 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Manage Posts">
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="p-4 border border-border rounded-md flex justify-between items-center gap-4">
                            <div>
                                <h3 className="font-bold text-card-foreground">{post.title}</h3>
                                <p className="text-sm text-foreground/60">By {post.author} on {post.timestamp?.toDate().toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => handleEditClick(post)} className="text-sm font-semibold text-blue-500 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(post.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
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
                    <div key={comment.id} className="p-4 border border-border rounded-md bg-background/50">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <img src={comment.user.photoURL || ''} alt="" className="w-6 h-6 rounded-full"/>
                                    <p className="font-bold text-card-foreground">{comment.user.displayName}</p>
                                </div>
                                <p className="text-xs text-foreground/50 mb-2">{comment.createdAt?.toDate().toLocaleString()}</p>
                                <p className="text-card-foreground whitespace-pre-wrap">{comment.text}</p>
                            </div>
                            <button onClick={() => handleDelete(comment.id)} className="text-sm font-semibold text-red-500 hover:underline ml-4">Delete</button>
                        </div>
                    </div>
                )) : <p className="text-foreground/70">No comments found.</p>}
            </div>
        </AdminSection>
    );
};

const GalleryManager: React.FC = () => {
    const q = useMemo(() => query(collection(db, "gallery"), orderBy("order", "asc")), []);
    const { data: items } = useCollection<GalleryAlbum>(q);

    const [formState, setFormState] = useState<GalleryFormState>(initialGalleryFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'imageUrls') {
            setFormState(p => ({ ...p, imageUrls: value.split('\n').filter(url => url.trim() !== '') }));
        } else {
            setFormState(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
        }
    };
    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialGalleryFormState); };
    const handleEditClick = (item: GalleryAlbum) => {
        setIsEditing(true);
        setFormState({ ...item });
        window.scrollTo(0, 0);
    };
    const handleDelete = async (id: string) => { if (window.confirm('Delete this album?')) await deleteDoc(doc(db, "gallery", id)); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSave = { ...formState };
        delete dataToSave.id;

        try {
            if (isEditing && formState.id) {
                await updateDoc(doc(db, "gallery", formState.id), dataToSave);
            } else {
                await addDoc(collection(db, "gallery"), dataToSave);
            }
            handleCancelEdit();
        } catch (err) { console.error(err); } 
        finally { setIsSubmitting(false); }
    };
    
    return (
        <div className="space-y-8">
            <AdminSection title={isEditing ? 'Edit Album' : 'Create New Album'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" required />
                    <FormInput name="title_en" label="Title (English)" value={formState.title_en} onChange={handleInputChange} required />
                    <FormInput name="title_km" label="Title (Khmer)" value={formState.title_km} onChange={handleInputChange} required />
                    <FormTextarea name="description_en" label="Short Description (English)" value={formState.description_en} onChange={handleInputChange} rows={3} />
                    <FormTextarea name="description_km" label="Short Description (Khmer)" value={formState.description_km} onChange={handleInputChange} rows={3} />
                    <FormTextarea name="content_en" label="Full Content (English)" value={formState.content_en} onChange={handleInputChange} rows={6} />
                    <FormTextarea name="content_km" label="Full Content (Khmer)" value={formState.content_km} onChange={handleInputChange} rows={6} />
                    <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={formState.thumbnailUrl} onChange={handleInputChange} folder="gallery/thumbnails" required />
                    <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls} onChange={handleInputChange} folder="gallery/details" helperText="Enter one image URL per line, or upload files." />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/80 font-semibold disabled:opacity-50 transition-colors">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Album' : 'Create Album')}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-secondary/20 text-secondary px-6 py-2 rounded-full hover:bg-secondary/30 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Manage Gallery Albums">
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="p-4 border border-border rounded-md flex justify-between items-center gap-4">
                             <div className="flex items-center gap-4">
                                <img src={item.thumbnailUrl} alt={item.title_en} className="w-16 h-16 object-cover rounded-md" />
                                <div>
                                    <h3 className="font-bold text-card-foreground">{item.title_en} / {item.title_km}</h3>
                                    <p className="text-sm text-foreground/60">Order: {item.order}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => handleEditClick(item)} className="text-sm font-semibold text-blue-500 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(item.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminSection>
        </div>
    );
};

const EventManager: React.FC = () => {
    const q = useMemo(() => query(collection(db, "events"), orderBy("order", "asc")), []);
    const { data: items } = useCollection<EventType>(q);

    const [formState, setFormState] = useState<EventFormState>(initialEventFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'imageUrls') {
            setFormState(p => ({ ...p, imageUrls: value.split('\n').filter(url => url.trim() !== '') }));
        } else {
            setFormState(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
        }
    };
    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialEventFormState); };
    const handleEditClick = (item: EventType) => {
        setIsEditing(true);
        setFormState({ ...item, imageUrls: item.imageUrls || [] });
        window.scrollTo(0, 0);
    };
    const handleDelete = async (id: string) => { if (window.confirm('Delete this event?')) await deleteDoc(doc(db, "events", id)); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSave = { ...formState };
        delete dataToSave.id;

        try {
            if (isEditing && formState.id) {
                await updateDoc(doc(db, "events", formState.id), dataToSave);
            } else {
                await addDoc(collection(db, "events"), dataToSave);
            }
            handleCancelEdit();
        } catch (err) { console.error(err); } 
        finally { setIsSubmitting(false); }
    };
    
    return (
        <div className="space-y-8">
            <AdminSection title={isEditing ? 'Edit Event' : 'Create New Event'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" required />
                    <FormInput name="title_en" label="Title (English)" value={formState.title_en} onChange={handleInputChange} required />
                    <FormInput name="title_km" label="Title (Khmer)" value={formState.title_km} onChange={handleInputChange} required />
                    <FormInput name="date_en" label="Date (English)" value={formState.date_en} onChange={handleInputChange} />
                    <FormInput name="date_km" label="Date (Khmer)" value={formState.date_km} onChange={handleInputChange} />
                    <FormTextarea name="description_en" label="Short Description (English)" value={formState.description_en} onChange={handleInputChange} rows={3} />
                    <FormTextarea name="description_km" label="Short Description (Khmer)" value={formState.description_km} onChange={handleInputChange} rows={3} />
                    <FormTextarea name="content_en" label="Full Content (English)" value={formState.content_en} onChange={handleInputChange} rows={6} />
                    <FormTextarea name="content_km" label="Full Content (Khmer)" value={formState.content_km} onChange={handleInputChange} rows={6} />
                    <ImageUploadInput name="imgSrc" label="Thumbnail Image URL" value={formState.imgSrc} onChange={handleInputChange} folder="events/thumbnails" required />
                    <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls || []} onChange={handleInputChange} folder="events/details" helperText="Optional. Enter one image URL per line, or upload files." />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/80 font-semibold disabled:opacity-50 transition-colors">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-secondary/20 text-secondary px-6 py-2 rounded-full hover:bg-secondary/30 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
             <AdminSection title="Manage Events">
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="p-4 border border-border rounded-md flex justify-between items-center gap-4">
                             <div className="flex items-center gap-4">
                                <img src={item.imgSrc} alt={item.title_en} className="w-16 h-16 object-cover rounded-md" />
                                <div>
                                    <h3 className="font-bold text-card-foreground">{item.title_en}</h3>
                                    <p className="text-sm text-foreground/60">{item.date_en}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => handleEditClick(item)} className="text-sm font-semibold text-blue-500 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(item.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminSection>
        </div>
    );
};

const TeachingsManager: React.FC = () => {
    const q = useMemo(() => query(collection(db, "teachings"), orderBy("order", "asc")), []);
    const { data: items } = useCollection<Teaching>(q);

    const [formState, setFormState] = useState<TeachingFormState>(initialTeachingFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'imageUrls') {
            setFormState(p => ({ ...p, imageUrls: value.split('\n').filter(url => url.trim() !== '') }));
        } else {
            setFormState(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
        }
    };
    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialTeachingFormState); };
    const handleEditClick = (item: Teaching) => {
        setIsEditing(true);
        setFormState({ ...item, imageUrls: item.imageUrls || [] });
        window.scrollTo(0, 0);
    };
    const handleDelete = async (id: string) => { if (window.confirm('Delete this teaching?')) await deleteDoc(doc(db, "teachings", id)); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSave = { ...formState };
        delete dataToSave.id;

        try {
            if (isEditing && formState.id) {
                await updateDoc(doc(db, "teachings", formState.id), dataToSave);
            } else {
                await addDoc(collection(db, "teachings"), dataToSave);
            }
            handleCancelEdit();
        } catch (err) { console.error(err); } 
        finally { setIsSubmitting(false); }
    };
    
    return (
        <div className="space-y-8">
            <AdminSection title={isEditing ? 'Edit Teaching' : 'Create New Teaching'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" required />
                    <FormInput name="title_en" label="Title (English)" value={formState.title_en} onChange={handleInputChange} required />
                    <FormInput name="title_km" label="Title (Khmer)" value={formState.title_km} onChange={handleInputChange} required />
                    <FormTextarea name="excerpt_en" label="Excerpt (English)" value={formState.excerpt_en} onChange={handleInputChange} rows={3} />
                    <FormTextarea name="excerpt_km" label="Excerpt (Khmer)" value={formState.excerpt_km} onChange={handleInputChange} rows={3} />
                    <FormTextarea name="content_en" label="Full Content (English)" value={formState.content_en} onChange={handleInputChange} rows={8} />
                    <FormTextarea name="content_km" label="Full Content (Khmer)" value={formState.content_km} onChange={handleInputChange} rows={8} />
                    <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={formState.thumbnailUrl} onChange={handleInputChange} folder="teachings/thumbnails" required />
                    <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls || []} onChange={handleInputChange} folder="teachings/details" helperText="Optional. Enter one image URL per line, or upload files." />
                    <div className="flex items-center space-x-4 pt-2">
                         <button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/80 font-semibold disabled:opacity-50 transition-colors">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Teaching' : 'Create Teaching')}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="bg-secondary/20 text-secondary px-6 py-2 rounded-full hover:bg-secondary/30 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
             <AdminSection title="Manage Teachings">
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="p-4 border border-border rounded-md flex justify-between items-center gap-4">
                             <div className="flex items-center gap-4">
                                <img src={item.thumbnailUrl} alt={item.title_en} className="w-16 h-16 object-cover rounded-md" />
                                <div>
                                    <h3 className="font-bold text-card-foreground">{item.title_en}</h3>
                                    <p className="text-sm text-foreground/60">Order: {item.order}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <button onClick={() => handleEditClick(item)} className="text-sm font-semibold text-blue-500 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(item.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
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
        } catch (error) {
            console.error(error);
            alert('Failed to update content.');
        } finally {
            setIsSubmitting(false);
        }
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
                    <button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/80 font-semibold disabled:opacity-50 transition-colors">
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


// --- MAIN ADMIN COMPONENT ---
const Admin: React.FC<AdminProps> = ({ user, isAdmin, authLoading }) => {
    const [view, setView] = useState<ViewType>('feed');
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
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <p>Authenticating...</p>
                </div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <PageMeta title="Admin Login" description={metaDescription} robots={metaRobots} />
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                    <h1 className="text-4xl font-english text-primary mb-4">Admin Access</h1>
                    <p className="text-foreground/80 mb-8 max-w-sm">Please log in with an authorized GitHub account to access the content management dashboard.</p>
                    <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-secondary text-secondary-foreground px-6 py-3 rounded-full hover:bg-secondary/80 transition-all duration-300 shadow-lg transform hover:scale-105">
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
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                    <h1 className="text-3xl font-english text-red-600 dark:text-red-500 mb-4">Access Denied</h1>
                    <p className="text-foreground/80 mb-8">You are not authorized to view this page.</p>
                    <button onClick={handleLogout} className="inline-flex items-center space-x-3 bg-secondary/50 text-secondary-foreground px-6 py-2 rounded-full hover:bg-secondary/70 transition-colors">
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
                  onClick={() => { setView(item.id); setIsMenuOpen(false); }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left w-full ${ view === item.id ? 'bg-primary text-primary-foreground shadow-inner' : 'text-slate-200 hover:bg-slate-700' }`}
              >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{item.label}</span>
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
            <div className="min-h-screen bg-background lg:flex">
                {/* Overlay for mobile */}
                <div 
                  className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  onClick={() => setIsMenuOpen(false)}
                ></div>

                <aside className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-4 h-20 border-b border-slate-700">
                        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
                         <button onClick={() => setIsMenuOpen(false)} className="lg:hidden text-slate-300 hover:text-white"> <X className="w-6 h-6" /> </button>
                    </div>
                    <SidebarNav />
                </aside>
                
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-30 border-b border-border">
                        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden text-foreground"> <Menu className="w-6 h-6" /> </button>
                            <div className="text-lg font-semibold text-foreground capitalize hidden sm:block">{navItems.find(i => i.id === view)?.label} Management</div>
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold text-foreground hidden sm:block">{user.displayName}</span>
                                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-primary" />
                                <button onClick={handleLogout} title="Logout" className="text-foreground/70 hover:text-red-500 transition-colors"> <LogOut className="w-6 h-6"/> </button>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8"> {renderView()} </main>
                </div>
            </div>
        </>
    );
};

export default Admin;