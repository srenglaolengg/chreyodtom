import React, { useState, useEffect, FormEvent } from 'react';
import { FirebaseUser, Post, Comment as CommentType, GalleryAlbum, Event as EventType, Teaching, AboutContent, ContactInfo } from '../types';
import { auth, db, githubProvider, storage } from '../firebase';
// FIX: Replaced useNavigate with useHistory for react-router-dom v5 compatibility.
import { useLocation, useHistory } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import PageMeta from '../components/PageMeta';

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

const navItems: { id: ViewType; label: string; }[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'comments', label: 'Comments' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'events', label: 'Events' },
    { id: 'teachings', label: 'Teachings' },
    { id: 'about', label: 'About Page' },
    { id: 'contact', label: 'Contact Page' },
];

const ImageUploadInput: React.FC<{
    name: string; label: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    folder: string;
}> = ({ name, label, value, onChange, folder }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = storage.ref(`${folder}/${Date.now()}_${file.name}`);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            // FIX: The error "Property 'name' does not exist on type 'unknown'" on a nearby line seems to be a TypeScript confusion.
            // The actual issue is likely the creation of a synthetic event that doesn't fully match the expected type.
            // Casting to 'any' resolves this as the consuming function only needs 'target.name' and 'target.value'.
            const syntheticEvent = { target: { name, value: downloadURL } } as any;
            onChange(syntheticEvent);
        } catch (error) { console.error("Upload error:", error); } 
        finally { setIsUploading(false); }
    };

    return (
        <div>
            <label htmlFor={name} className="form-label">{label}</label>
            <div style={{display: 'flex', gap: '0.5rem'}}>
                <input id={name} name={name} type="url" value={value} onChange={onChange} placeholder="Image URL" className="form-input"/>
                <label htmlFor={`${name}-file`} className="btn btn-secondary">{isUploading ? 'Uploading...' : 'Upload'}</label>
                <input id={`${name}-file`} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={isUploading}/>
            </div>
        </div>
    );
};

const MultiImageUploadInput: React.FC<{
    name: string; label: string; value: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    folder: string;
}> = ({ name, label, value, onChange, folder }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const storageRef = storage.ref(`${folder}/${Date.now()}_${file.name}`);
                const snapshot = await storageRef.put(file);
                return await snapshot.ref.getDownloadURL();
            });
            const downloadURLs = await Promise.all(uploadPromises);
            const newValue = [...value, ...downloadURLs].join('\n');
            const syntheticEvent = { target: { name, value: newValue } } as any;
            onChange(syntheticEvent);
        } catch (error) { console.error("Upload error:", error); } 
        finally { setIsUploading(false); }
    };

    return (
        <div>
            <label htmlFor={name} className="form-label">{label}</label>
            <textarea id={name} name={name} value={value.join('\n')} onChange={onChange} rows={6} placeholder="One image URL per line" className="form-textarea"/>
            <label htmlFor={`${name}-file`} className="btn btn-secondary" style={{marginTop: '0.5rem'}}>{isUploading ? 'Uploading...' : 'Upload Files'}</label>
            <input id={`${name}-file`} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={isUploading} multiple/>
        </div>
    );
};


const Admin: React.FC<AdminProps> = ({ user, isAdmin, authLoading }) => {
    const [view, setView] = useState<ViewType>('feed');
    const location = useLocation();
    // FIX: Use useHistory hook instead of useNavigate.
    const history = useHistory();

    useEffect(() => {
        const postToEditFromState = (location.state as any)?.postToEdit as Post | undefined;
        if (postToEditFromState) {
            setView('feed');
            // FIX: Use history.replace to change URL without adding to history. This clears the state.
            history.replace(location.pathname);
        }
    // FIX: Update dependency array.
    }, [location, history]);
    
    const handleLogin = async () => await auth.signInWithPopup(githubProvider);
    const handleLogout = async () => await auth.signOut();

    const metaDescription = "Content management system for the Wat Serei Mongkol website.";
    const metaRobots = "noindex, nofollow";

    if (authLoading) return <PageMeta title="Authenticating..." description="" robots={metaRobots} />;

    if (!user) {
        return (
            <>
                <PageMeta title="Admin Login" description={metaDescription} robots={metaRobots} />
                <div className="container text-center" style={{padding: '4rem 1rem'}}>
                    <h1>Admin Access</h1>
                    <p>Please log in with an authorized GitHub account.</p>
                    <button onClick={handleLogin} className="btn btn-primary">Login with GitHub</button>
                </div>
            </>
        );
    }
    
    if (!isAdmin) {
         return (
            <>
                <PageMeta title="Access Denied" description={metaDescription} robots={metaRobots} />
                <div className="container text-center" style={{padding: '4rem 1rem'}}>
                    <h1>Access Denied</h1>
                    <p>You are not authorized to view this page.</p>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </>
        );
    }
    
    const SidebarNav = () => (
      <nav>
          {navItems.map(item => (
              <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={view === item.id ? 'active' : ''}
              >
                  {item.label}
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
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <div className="admin-sidebar-header">
                        <h2>Admin Panel</h2>
                    </div>
                    <SidebarNav />
                </aside>
                
                <div className="admin-main">
                    <header className="admin-header">
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span style={{fontWeight: 500}}>{user.displayName}</span>
                            {user.photoURL && <img src={user.photoURL} alt="" style={{width: '36px', height: '36px', borderRadius: '50%', marginLeft: '1rem'}} />}
                            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{marginLeft: '1rem'}}>Logout</button>
                        </div>
                    </header>
                    <main className="admin-content"> {renderView()} </main>
                </div>
            </div>
        </>
    );
};

// --- GENERIC HELPER ---
const AdminSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="admin-section">
        <h2>{title}</h2>
        <hr style={{margin: '1rem 0'}} />
        {children}
    </div>
);
const FormInput: React.FC<{ name: string; label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; }> = ({ name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="form-label">{label}</label>
        <input id={name} name={name} {...props} className="form-input"/>
    </div>
);
const FormTextarea: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; }> = ({ name, label, ...props }) => (
    <div>
        <label htmlFor={name} className="form-label">{label}</label>
        <textarea id={name} name={name} {...props} className="form-textarea"></textarea>
    </div>
);
const TranslationFieldGroup: React.FC<{ formState: any; handleInputChange: any; nameEn: string; nameKm: string; labelEn: string; labelKm: string; type?: 'input' | 'textarea'; rows?: number}> = ({formState, handleInputChange, nameEn, nameKm, labelEn, labelKm, type = 'input', rows }) => (
     <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
        {type === 'input' ? 
            <FormInput name={nameEn} label={labelEn} value={formState[nameEn]} onChange={handleInputChange} /> : 
            <FormTextarea name={nameEn} label={labelEn} value={formState[nameEn]} onChange={handleInputChange} rows={rows} />
        }
        {type === 'input' ? 
            <FormInput name={nameKm} label={labelKm} value={formState[nameKm]} onChange={handleInputChange} /> : 
            <FormTextarea name={nameKm} label={labelKm} value={formState[nameKm]} onChange={handleInputChange} rows={rows} />
        }
    </div>
);

const FeedManager: React.FC<{user: FirebaseUser, postToEdit?: Post}> = ({ user, postToEdit }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [formState, setFormState] = useState<PostFormState>(initialPostFormState);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const q = db.collection("posts").orderBy("timestamp", "desc");
        return q.onSnapshot(snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))));
    }, []);
    
     useEffect(() => { if (postToEdit) handleEditClick(postToEdit); }, [postToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialPostFormState); };
    const handleEditClick = (post: Post) => {
        setIsEditing(true);
        setFormState({ id: post.id, title: post.title, content: post.content, imageUrl: post.imageUrl || '' });
        window.scrollTo(0, 0);
    };
    const handleDelete = async (id: string) => { if (window.confirm('Delete this post?')) await db.collection("posts").doc(id).delete(); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && formState.id) {
            await db.collection("posts").doc(formState.id).update({ title: formState.title, content: formState.content, imageUrl: formState.imageUrl || '' });
        } else {
            await db.collection("posts").add({ ...formState, author: user.displayName || 'Admin', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }
        handleCancelEdit();
    };
    
    return (
        <div>
            <AdminSection title={isEditing ? 'Edit Post' : 'Create New Post'}>
                <form onSubmit={handleSubmit} style={{display: 'grid', gap: '1rem'}}>
                    <FormInput name="title" label="Title" value={formState.title} onChange={handleInputChange} />
                    <FormTextarea name="content" label="Content (Markdown)" value={formState.content} onChange={handleInputChange} rows={10} />
                    <ImageUploadInput name="imageUrl" label="Header Image URL (Optional)" value={formState.imageUrl || ''} onChange={handleInputChange} folder="posts" />
                    <div>
                        <button type="submit" className="btn btn-primary">{isEditing ? 'Update Post' : 'Create Post'}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" style={{marginLeft: '0.5rem'}}>Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Manage Posts">
                <table className="admin-table">
                    <thead><tr><th>Title</th><th>Author</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id}>
                                <td>{post.title}</td><td>{post.author}</td><td>{post.timestamp?.toDate().toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => handleEditClick(post)} className="btn btn-secondary btn-sm">Edit</button>
                                    <button onClick={() => handleDelete(post.id)} className="btn btn-secondary btn-sm" style={{marginLeft: '0.5rem'}}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminSection>
        </div>
    );
};

const CommentManager: React.FC = () => {
    const [comments, setComments] = useState<CommentType[]>([]);
    useEffect(() => {
        const q = db.collection("comments").orderBy("createdAt", "desc");
        return q.onSnapshot(snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentType))));
    }, []);

    const handleDelete = async (id: string) => { if (window.confirm('Delete this comment?')) await db.collection("comments").doc(id).delete(); };

    return (
        <AdminSection title="Comment Moderation">
             <table className="admin-table">
                <thead><tr><th>Author</th><th>Comment</th><th>Date</th><th>Actions</th></tr></thead>
                 <tbody>
                    {comments.map(comment => (
                        <tr key={comment.id}>
                            <td>{comment.user.displayName}</td>
                            <td style={{whiteSpace: 'pre-wrap', maxWidth: '400px'}}>{comment.text}</td>
                            <td>{comment.createdAt?.toDate().toLocaleString()}</td>
                            <td><button onClick={() => handleDelete(comment.id)} className="btn btn-secondary btn-sm">Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </AdminSection>
    );
};

const ContentManagerBase: React.FC<{
    collectionName: 'gallery' | 'events' | 'teachings'; itemTypeLabel: string; initialFormState: any;
    formFields: (formState: any, handleInputChange: any) => React.ReactNode;
    renderListItem: (item: any, handleEditClick: any, handleDelete: any) => React.ReactNode;
}> = ({ collectionName, itemTypeLabel, initialFormState, formFields, renderListItem }) => {
    const [items, setItems] = useState<any[]>([]);
    const [formState, setFormState] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const q = db.collection(collectionName).orderBy("order", "asc");
        return q.onSnapshot(snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [collectionName]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'imageUrls') {
            setFormState(p => ({ ...p, imageUrls: value.split('\n').filter(url => url.trim() !== '') }));
        } else {
            setFormState(p => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
        }
    };

    const handleCancelEdit = () => { setIsEditing(false); setFormState(initialFormState); };
    const handleEditClick = (item: any) => {
        setIsEditing(true);
        setFormState({ ...item, imageUrls: item.imageUrls || [] });
        window.scrollTo(0, 0);
    };
    const handleDelete = async (id: string) => { if (window.confirm(`Delete this ${itemTypeLabel}?`)) await db.collection(collectionName).doc(id).delete(); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formState };
        delete dataToSave.id;

        if (isEditing && formState.id) {
            await db.collection(collectionName).doc(formState.id).update(dataToSave);
        } else {
            await db.collection(collectionName).add(dataToSave);
        }
        handleCancelEdit();
    };

    return (
        <div>
            <AdminSection title={isEditing ? `Edit ${itemTypeLabel}` : `Create New ${itemTypeLabel}`}>
                <form onSubmit={handleSubmit} style={{display: 'grid', gap: '1rem'}}>
                    {formFields(formState, handleInputChange)}
                    <div>
                        <button type="submit" className="btn btn-primary">{isEditing ? `Update ${itemTypeLabel}` : `Create ${itemTypeLabel}`}</button>
                        {isEditing && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" style={{marginLeft: '0.5rem'}}>Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title={`Manage ${itemTypeLabel}s`}>
                <div className="grid grid-cols-3">
                    {items.map(item => renderListItem(item, handleEditClick, handleDelete))}
                </div>
            </AdminSection>
        </div>
    );
};

const ListItemCard: React.FC<{item: any, title: string, subtitle: string, imageUrl: string, onEdit: () => void, onDelete: () => void}> = ({item, title, subtitle, imageUrl, onEdit, onDelete}) => (
    <div key={item.id} className="card">
        <img src={imageUrl} alt={title} className="card-image" />
        <div className="card-content">
            <h4 style={{marginBottom: '0.25rem'}}>{title}</h4>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{subtitle}</p>
        </div>
        <div style={{padding: '0.5rem 1rem', borderTop: '1px solid var(--border-color)', textAlign: 'right'}}>
            <button onClick={onEdit} className="btn btn-secondary btn-sm">Edit</button>
            <button onClick={onDelete} className="btn btn-secondary btn-sm" style={{marginLeft: '0.5rem'}}>Delete</button>
        </div>
    </div>
)

const GalleryManager = () => <ContentManagerBase
    collectionName="gallery" itemTypeLabel="Album" initialFormState={initialGalleryFormState}
    formFields={(formState, handleInputChange) => (
        <>
            <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="title_en" nameKm="title_km" labelEn="Title (English)" labelKm="Title (Khmer)" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="description_en" nameKm="description_km" labelEn="Short Description (English)" labelKm="Short Description (Khmer)" type="textarea" rows={3}/>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="content_en" nameKm="content_km" labelEn="Full Content (English)" labelKm="Full Content (Khmer)" type="textarea" rows={6}/>
            <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={formState.thumbnailUrl} onChange={handleInputChange} folder="gallery/thumbnails" />
            <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls} onChange={handleInputChange} folder="gallery/details" />
        </>
    )}
    renderListItem={(item, handleEditClick, handleDelete) => (
        <ListItemCard item={item} title={item.title_en} subtitle={`Order: ${item.order}`} imageUrl={item.thumbnailUrl} onEdit={() => handleEditClick(item)} onDelete={() => handleDelete(item.id)} />
    )}
/>;

const EventManager = () => <ContentManagerBase
    collectionName="events" itemTypeLabel="Event" initialFormState={initialEventFormState}
    formFields={(formState, handleInputChange) => (
        <>
            <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                 <FormInput name="date_en" label="Date (English)" value={formState.date_en} onChange={handleInputChange} />
                 <FormInput name="date_km" label="Date (Khmer)" value={formState.date_km} onChange={handleInputChange} />
            </div>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="title_en" nameKm="title_km" labelEn="Title (English)" labelKm="Title (Khmer)" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="description_en" nameKm="description_km" labelEn="Short Description (English)" labelKm="Short Description (Khmer)" type="textarea" rows={3}/>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="content_en" nameKm="content_km" labelEn="Full Content (English)" labelKm="Full Content (Khmer)" type="textarea" rows={6}/>
            <ImageUploadInput name="imgSrc" label="Thumbnail Image URL" value={formState.imgSrc} onChange={handleInputChange} folder="events/thumbnails" />
            <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls || []} onChange={handleInputChange} folder="events/details" />
        </>
    )}
    renderListItem={(item, handleEditClick, handleDelete) => (
        <ListItemCard item={item} title={item.title_en} subtitle={item.date_en} imageUrl={item.imgSrc} onEdit={() => handleEditClick(item)} onDelete={() => handleDelete(item.id)} />
    )}
/>;

const TeachingsManager = () => <ContentManagerBase
    collectionName="teachings" itemTypeLabel="Teaching" initialFormState={initialTeachingFormState}
    formFields={(formState, handleInputChange) => (
         <>
            <FormInput name="order" label="Order" value={formState.order} onChange={handleInputChange} type="number" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="title_en" nameKm="title_km" labelEn="Title (English)" labelKm="Title (Khmer)" />
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="excerpt_en" nameKm="excerpt_km" labelEn="Excerpt (English)" labelKm="Excerpt (Khmer)" type="textarea" rows={3}/>
            <TranslationFieldGroup formState={formState} handleInputChange={handleInputChange} nameEn="content_en" nameKm="content_km" labelEn="Full Content (English)" labelKm="Full Content (Khmer)" type="textarea" rows={8}/>
            <ImageUploadInput name="thumbnailUrl" label="Thumbnail Image URL" value={formState.thumbnailUrl} onChange={handleInputChange} folder="teachings/thumbnails" />
            <MultiImageUploadInput name="imageUrls" label="Detail Image URLs" value={formState.imageUrls || []} onChange={handleInputChange} folder="teachings/details" />
        </>
    )}
     renderListItem={(item, handleEditClick, handleDelete) => (
        <ListItemCard item={item} title={item.title_en} subtitle={`Order: ${item.order}`} imageUrl={item.thumbnailUrl} onEdit={() => handleEditClick(item)} onDelete={() => handleDelete(item.id)} />
    )}
/>;

const PageContentManager: React.FC<{pageId: 'about' | 'contact', fields: Record<string, { label: string; type: string; }>, initialState: any}> = ({ pageId, fields, initialState }) => {
    const [formState, setFormState] = useState(initialState);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const docRef = db.collection('pages').doc(pageId);
        const unsub = docRef.onSnapshot((docSnap) => {
            if (docSnap.exists) setFormState(docSnap.data());
            setIsLoading(false);
        });
        return () => unsub();
    }, [pageId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await db.collection('pages').doc(pageId).set(formState);
        alert('Content updated!');
    };

    if (isLoading) return <AdminSection title={`Edit ${pageId} Page`}>Loading...</AdminSection>

    return (
        <AdminSection title={`Edit ${pageId} Page Content`}>
            <form onSubmit={handleSubmit} style={{display: 'grid', gap: '1rem'}}>
                {/* FIX: Explicitly cast the result of Object.entries to fix type inference issues where TypeScript sees the field config as `{}`. */}
                {(Object.entries(fields) as [string, { label: string; type: string }][]).map(([name, { label, type }]) => 
                    type === 'textarea' ? 
                    <FormTextarea key={name} name={name} label={label} value={formState[name] || ''} onChange={handleInputChange} rows={5} /> :
                    <FormInput key={name} name={name} label={label} value={formState[name] || ''} onChange={handleInputChange} />
                )}
                <div><button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
        </AdminSection>
    );
};

const AboutManager = () => <PageContentManager 
    pageId="about"
    initialState={{ paragraph1_en: '', paragraph2_en: '', paragraph1_km: '', paragraph2_km: '' }}
    fields={{
        paragraph1_en: { label: 'Paragraph 1 (English)', type: 'textarea' }, paragraph1_km: { label: 'Paragraph 1 (Khmer)', type: 'textarea' },
        paragraph2_en: { label: 'Paragraph 2 (English)', type: 'textarea' }, paragraph2_km: { label: 'Paragraph 2 (Khmer)', type: 'textarea' },
    }} 
/>;

const ContactManager = () => <PageContentManager 
    pageId="contact"
    initialState={{ address_en: '', address_km: '', phone: '', email: '' }}
    fields={{
        address_en: { label: 'Address (English)', type: 'input' }, address_km: { label: 'Address (Khmer)', type: 'input' },
        phone: { label: 'Phone Number', type: 'input' }, email: { label: 'Email Address', type: 'input' },
    }} 
/>;

export default Admin;