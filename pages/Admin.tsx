import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { FirebaseUser, Post, Comment as CommentType, GalleryAlbum, Event as EventType, Teaching, AboutContent, ContactInfo, UserRole } from '../types';
import { auth, githubProvider } from '../firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import PageMeta from '../components/PageMeta';
import { Newspaper, MessageSquare, Image as ImageIcon, Calendar, BookOpen, Info, Phone, Menu, X, LogOut, UploadCloud, LayoutDashboard, Sparkles, Languages, Loader2, Users } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { GoogleGenAI } from '@google/genai';
import { supabase, BUCKET_NAME } from '../supabase';

// --- CONFIGURATION TYPES ---
interface FieldConfig {
    name: string;
    label: string;
    type: 'input' | 'textarea';
    rows?: number;
    bilingual?: boolean;
    isAiGeneratable?: boolean;
}

interface ImageFieldConfig {
    name: string;
    label: React.ReactNode;
    type: 'single' | 'multi';
    folder: string;
    required?: boolean;
    helperText?: string;
}


interface AdminProps {
    user: FirebaseUser | null;
    isAdmin: boolean;
    authLoading: boolean;
}

type ViewType = 'dashboard' | 'feed' | 'comments' | 'gallery' | 'events' | 'teachings' | 'about' | 'contact' | 'user-roles';

const navItems: { id: ViewType; label: string; icon: React.FC<any> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feed', label: 'Feed', icon: Newspaper },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'teachings', label: 'Teachings', icon: BookOpen },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'contact', label: 'Contact Page', icon: Phone },
    { id: 'user-roles', label: 'User Roles', icon: Users },
];


// --- AI HELPER COMPONENTS ---
const GenerateWithAIButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button type="button" onClick={onClick} className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors">
        <Sparkles className="w-3 h-3" />
        <span>Generate</span>
    </button>
);

const TranslateButton: React.FC<{ onClick: () => void, isLoading: boolean }> = ({ onClick, isLoading }) => (
    <button type="button" onClick={onClick} disabled={isLoading} className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50">
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
        <span>Translate</span>
    </button>
);


// --- FILE UPLOAD HELPERS ---
const ImageUploadInput: React.FC<{ name: string; label: React.ReactNode; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; folder: string; helperText?: string; required?: boolean; }> = ({ name, label, value, onChange, folder, helperText, required }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // FIX: Check if Supabase client is initialized before proceeding.
        if (!supabase) {
            setUploadError("Supabase is not configured. Please update your credentials in supabase.ts.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        
        // Define the path for the file in Supabase Storage.
        const filePath = `${folder}/${Date.now()}_${file.name}`;

        try {
            // Upload the file to the specified Supabase bucket and path.
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // If the upload is successful, get the public URL for the file.
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);
            
            if (!publicUrlData.publicUrl) {
                throw new Error("Could not get public URL for the uploaded file.");
            }
            
            // Trigger the onChange event to update the form state with the new URL.
            onChange({ target: { name, value: publicUrlData.publicUrl } } as React.ChangeEvent<HTMLInputElement>);
        } catch (error: any) {
            console.error("Supabase Upload Error:", error);
            setUploadError(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            {typeof label === 'string' ? <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label> : <div className="mb-1">{label}</div>}
            <div className="flex items-center space-x-2">
                <input id={name} name={name} type="url" value={value} onChange={onChange} placeholder="Enter image URL or upload" className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500" required={required} />
                <label htmlFor={`${name}-file`} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md border border-gray-300 whitespace-nowrap transition-colors inline-flex items-center space-x-2 disabled:opacity-50" aria-disabled={isUploading}>
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4"/>}
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </label>
                <input id={`${name}-file`} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
            </div>
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
            {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

const MultiImageUploadInput: React.FC<{ name: string; label: React.ReactNode; value: string[]; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; folder: string; helperText?: string; }> = ({ name, label, value, onChange, folder, helperText }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // FIX: Check if Supabase client is initialized before proceeding.
        if (!supabase) {
            setUploadError("Supabase is not configured. Please update your credentials in supabase.ts.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        // Create an array of promises, one for each file upload.
        const uploadPromises = Array.from(files).map(async (file) => {
            const filePath = `${folder}/${Date.now()}_${file.name}`;
            
            // Upload the file to Supabase Storage.
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }

            // Get the public URL for the uploaded file.
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            if (!publicUrlData.publicUrl) {
                throw new Error(`Could not get public URL for ${file.name}.`);
            }
            return publicUrlData.publicUrl;
        });

        try {
            // Wait for all upload promises to resolve.
            const downloadURLs = await Promise.all(uploadPromises);
            // Combine new URLs with existing ones and update the form state.
            onChange({ target: { name, value: [...value, ...downloadURLs].join('\n') } } as React.ChangeEvent<HTMLTextAreaElement>);
        } catch (error: any) {
            console.error("Supabase Multi-upload Error:", error);
            setUploadError(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            {typeof label === 'string' ? <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label> : <div className="mb-1">{label}</div>}
            <textarea id={name} name={name} value={value.join('\n')} onChange={onChange} rows={6} placeholder="Enter one image URL per line, or upload files." className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500 font-mono text-sm" />
             <label htmlFor={`${name}-file`} className="mt-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md border border-gray-300 inline-flex items-center space-x-2 transition-colors disabled:opacity-50" aria-disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4"/>}
                <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
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
const FormInput: React.FC<{ name: string; label: React.ReactNode; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = ({ name, label, ...props }) => (
    <div>
        {typeof label === 'string' ? <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label> : <div className="mb-1">{label}</div>}
        <input id={name} name={name} {...props} className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500"/>
    </div>
);
const FormTextarea: React.FC<{ name: string; label: React.ReactNode; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; required?: boolean; helperText?: string }> = ({ name, label, helperText, ...props }) => (
    <div>
        {typeof label === 'string' ? <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label> : <div className="mb-1">{label}</div>}
        <textarea id={name} name={name} {...props} className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500"></textarea>
        {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
);


// --- MANAGER HOOK & COMPONENT ---
interface ManagerProps {
    openAiModal: (cb: (content: string) => void) => void;
    handleTranslate: (text: string, targetLang: string, sourceLang?: string) => Promise<string | null>;
}

const useCmsManager = <T extends {id: string}, F extends Omit<T, 'id'> & {id?: string}>(
    collectionName: string, 
    orderByField: string, 
    initialState: F, 
    itemToEdit?: T
) => {
    const collectionOptions = useMemo(() => ({ orderBy: { column: orderByField, ascending: true } }), [collectionName, orderByField]);
    const { data: items, loading: itemsLoading } = useCollection<T>(collectionName, collectionOptions);

    const [formState, setFormState] = useState<F>(initialState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => { if (itemToEdit) handleEditClick(itemToEdit); }, [itemToEdit]);

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
        const formData: Record<string, any> = { ...item };
        // Ensure imageUrls is an array for the multi-image component
        if ('imageUrls' in formData && !Array.isArray(formData.imageUrls)) {
            formData.imageUrls = [];
        }
        setFormState(formData as F);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id: string) => {
        if (!supabase) return;
        if (window.confirm(`Delete this item from ${collectionName}?`)) {
            const { error } = await supabase.from(collectionName).delete().eq('id', id);
            if (error) console.error(error);
            // Data will refetch via useCollection hook if it's made real-time or manually triggered.
            // For now, the user has to refresh to see the change. A manual refetch function could be added to the hook.
        }
    };

    const handleSubmit = async (e: React.FormEvent, onBeforeSubmit?: (data: Omit<F, 'id'>, isEditing: boolean) => any) => {
        e.preventDefault();
        if (!supabase) return;
        setIsSubmitting(true);
        const { id, ...data } = formState;

        let dataToSave = onBeforeSubmit ? onBeforeSubmit(data, isEditing) : data;

        try {
            if (isEditing && id) {
                const { error } = await supabase.from(collectionName).update(dataToSave).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from(collectionName).insert(dataToSave);
                if (error) throw error;
            }
            handleCancelEdit();
        } catch (err) { console.error(err); } 
        finally { setIsSubmitting(false); }
    };

    return { items, itemsLoading, formState, isEditing, isSubmitting, handleInputChange, handleSubmit, handleEditClick, handleDelete, handleCancelEdit };
};


const ContentManager: React.FC<ManagerProps & {
    collectionName: string;
    orderByField: string;
    initialState: any;
    itemTitle: string;
    fields: FieldConfig[];
    imageFields?: ImageFieldConfig[];
    renderItem: (item: any, onEdit: (item: any) => void, onDelete: (id: string) => void) => React.ReactNode;
    itemToEdit?: any;
    onBeforeSubmit?: (data: any, isEditing: boolean) => any;
}> = ({ collectionName, orderByField, initialState, itemTitle, fields, imageFields = [], itemToEdit, onBeforeSubmit, handleTranslate, openAiModal, renderItem }) => {
    
    const manager = useCmsManager(collectionName, orderByField, initialState, itemToEdit);
    const [translationLoading, setTranslationLoading] = useState<Record<string, boolean>>({});

    const doTranslate = async (sourceField: string, targetField: string, targetLang: string) => {
        const sourceText = (manager.formState as any)[sourceField];
        if (!sourceText) return;
        setTranslationLoading(prev => ({ ...prev, [targetField]: true }));
        const translatedText = await handleTranslate(sourceText, targetLang);
        if (translatedText) {
            manager.handleInputChange({ target: { name: targetField, value: translatedText } } as any);
        }
        setTranslationLoading(prev => ({ ...prev, [targetField]: false }));
    };

    return (
        <div className="space-y-8">
            <AdminSection title={manager.isEditing ? `Edit ${itemTitle}` : `Create New ${itemTitle}`}>
                <form onSubmit={(e) => manager.handleSubmit(e, onBeforeSubmit)} className="space-y-4">
                    {initialState.hasOwnProperty('order') && (
                        <FormInput name="order" label="Order" value={(manager.formState as any).order ?? 0} onChange={manager.handleInputChange} type="number" required />
                    )}

                    {fields.map(field => {
                        if (field.bilingual) {
                            const name_en = `${field.name}_en`;
                            const name_km = `${field.name}_km`;
                            const Component = field.type === 'textarea' ? FormTextarea : FormInput;
                            return (
                                <div key={field.name} className="grid md:grid-cols-2 gap-4">
                                    <Component
                                        name={name_en}
                                        label={
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-sm font-medium text-gray-700">{`${field.label} (English)`}</span>
                                                {field.isAiGeneratable && <GenerateWithAIButton onClick={() => openAiModal(value => manager.handleInputChange({ target: { name: name_en, value } } as any))} />}
                                            </div>
                                        }
                                        value={(manager.formState as any)[name_en] || ''}
                                        onChange={manager.handleInputChange}
                                        rows={field.rows}
                                        required
                                    />
                                    <Component
                                        name={name_km}
                                        label={
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-sm font-medium text-gray-700">{`${field.label} (Khmer)`}</span>
                                                <TranslateButton isLoading={translationLoading[name_km]} onClick={() => doTranslate(name_en, name_km, 'Khmer')} />
                                            </div>
                                        }
                                        value={(manager.formState as any)[name_km] || ''}
                                        onChange={manager.handleInputChange}
                                        rows={field.rows}
                                        required
                                    />
                                </div>
                            );
                        }
                        // Non-bilingual field
                        const name = field.name;
                        const Component = field.type === 'textarea' ? FormTextarea : FormInput;
                        return (
                            <Component
                                key={name}
                                name={name}
                                label={
                                    <div className="flex items-center justify-between w-full">
                                         <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                         {field.isAiGeneratable && <GenerateWithAIButton onClick={() => openAiModal(value => manager.handleInputChange({ target: { name, value } } as any))} />}
                                    </div>
                                }
                                value={(manager.formState as any)[name] || ''}
                                onChange={manager.handleInputChange}
                                rows={field.rows}
                                required
                            />
                        );
                    })}
                    
                    {imageFields.map(field => field.type === 'single' ?
                        <ImageUploadInput key={field.name} name={field.name} label={field.label} value={(manager.formState as any)[field.name] || ''} onChange={manager.handleInputChange} folder={field.folder} required={field.required} />
                        :
                        <MultiImageUploadInput key={field.name} name={field.name} label={field.label} value={(manager.formState as any)[field.name] || []} onChange={manager.handleInputChange} folder={field.folder} helperText={field.helperText} />
                    )}
                    
                    <div className="flex items-center space-x-4 pt-2">
                        <button type="submit" disabled={manager.isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors">{manager.isSubmitting ? 'Saving...' : (manager.isEditing ? `Update ${itemTitle}` : `Create ${itemTitle}`)}</button>
                        {manager.isEditing && <button type="button" onClick={manager.handleCancelEdit} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>}
                    </div>
                </form>
            </AdminSection>
            <AdminSection title={`Manage ${itemTitle}s`}>
                 <div className="space-y-3">
                    {manager.itemsLoading ? <p>Loading items...</p> : manager.items.map((item: any) => renderItem(item, manager.handleEditClick, manager.handleDelete))}
                </div>
            </AdminSection>
        </div>
    );
};

const CommentManager: React.FC = () => {
    const { data: comments } = useCollection<CommentType>('comments', useMemo(() => ({ orderBy: { column: 'createdAt', ascending: false } }), []));

    const handleDelete = async (id: string) => { 
        if (!supabase) return;
        if (window.confirm('Delete this comment?')) {
            const { error } = await supabase.from('comments').delete().eq('id', id);
            if (error) console.error(error);
        }
    };

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
                                <p className="text-xs text-gray-500 mb-2">{new Date(comment.createdAt).toLocaleString()}</p>
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


const PageContentManager: React.FC<{
    pageId: 'about' | 'contact', 
    fields: Record<string, { label: string; type: string; }>, 
    initialState: any
} & ManagerProps> = ({ pageId, fields, initialState, handleTranslate, openAiModal }) => {
    const [formState, setFormState] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [translationLoading, setTranslationLoading] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }
        const fetchPage = async () => {
            const { data, error } = await supabase.from('pages').select('*').eq('id', pageId).single();
            if (data) {
                setFormState(data);
            }
            if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
                console.error(error);
            }
            setIsLoading(false);
        };
        fetchPage();
    }, [pageId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));
    const setFieldProgrammatically = (name: string, value: string) => setFormState(p => ({ ...p, [name]: value }));

    const doTranslate = async (sourceField: string, targetField: string, targetLang: string) => {
        const sourceText = formState[sourceField];
        if (!sourceText) return;
        setTranslationLoading(prev => ({ ...prev, [targetField]: true }));
        const translatedText = await handleTranslate(sourceText, targetLang);
        if (translatedText) {
            setFieldProgrammatically(targetField, translatedText);
        }
        setTranslationLoading(prev => ({ ...prev, [targetField]: false }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('pages').upsert({ id: pageId, ...formState });
            if (error) throw error;
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
                    <FormTextarea
                      key={name}
                      name={name}
                      label={
                         <div className="flex items-center justify-between">
                             <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                             {name.endsWith('_km') && <TranslateButton isLoading={translationLoading[name]} onClick={() => doTranslate(name.replace('_km', '_en'), name, 'Khmer')} />}
                             {name.endsWith('_en') && <GenerateWithAIButton onClick={() => openAiModal(value => setFieldProgrammatically(name, value))} />}
                         </div>
                      }
                      value={formState[name] || ''} onChange={handleInputChange} rows={5}
                    /> :
                    <FormInput
                        key={name}
                        name={name}
                        label={
                             <div className="flex items-center justify-between">
                                 <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                                 {name.endsWith('_km') && <TranslateButton isLoading={translationLoading[name]} onClick={() => doTranslate(name.replace('_km', '_en'), name, 'Khmer')} />}
                             </div>
                        }
                        value={formState[name] || ''} onChange={handleInputChange}
                    />
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

const AboutManager: React.FC<ManagerProps> = (props) => <PageContentManager 
    {...props}
    pageId="about"
    initialState={{ paragraph1_en: '', paragraph2_en: '', paragraph1_km: '', paragraph2_km: '' }}
    fields={{
        paragraph1_en: { label: 'Paragraph 1 (English)', type: 'textarea' },
        paragraph1_km: { label: 'Paragraph 1 (Khmer)', type: 'textarea' },
        paragraph2_en: { label: 'Paragraph 2 (English)', type: 'textarea' },
        paragraph2_km: { label: 'Paragraph 2 (Khmer)', type: 'textarea' },
    }} 
/>;

const ContactManager: React.FC<ManagerProps> = (props) => <PageContentManager 
    {...props}
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
    const { data: posts } = useCollection<Post>('posts');
    const { data: comments } = useCollection<CommentType>('comments');
    const { data: albums } = useCollection<GalleryAlbum>('gallery');
    const { data: events } = useCollection<EventType>('events');
    const { data: teachings } = useCollection<Teaching>('teachings');

    const { data: recentComments } = useCollection<CommentType>('comments', useMemo(() => ({ orderBy: { column: 'createdAt', ascending: false }, limit: 5 }), []));

    const handleDeleteComment = async (id: string) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to delete this comment?')) {
            const { error } = await supabase.from('comments').delete().eq('id', id);
            if (error) console.error(error);
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
                                    <p className="text-xs text-gray-500 mb-2">{new Date(comment.createdAt).toLocaleString()}</p>
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

const UserRoleManager: React.FC = () => {
    const { data: roles, loading } = useCollection<UserRole>('user_roles');
    const [formState, setFormState] = useState({ user_id: '', role: 'editor' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.user_id || !formState.role || !supabase) return;
        
        setIsSubmitting(true);
        const { error } = await supabase.from('user_roles').upsert({ user_id: formState.user_id, role: formState.role });
        
        if (error) {
            console.error(error);
            alert('Failed to save role. Make sure the User ID is correct and you have admin privileges.');
        } else {
            alert('Role saved successfully. The user may need to refresh their session to see the changes.');
            setFormState({ user_id: '', role: 'editor' }); // Reset form
            // NOTE: A manual page refresh is needed to see the updated list below
            // due to the current implementation of the useCollection hook.
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (userId: string) => {
        if (!supabase || !window.confirm('Are you sure you want to remove this user\'s role? This cannot be undone.')) return;
        
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
        if (error) {
            console.error(error);
            alert('Failed to delete role.');
        } else {
             alert('Role removed successfully.');
        }
    };

    return (
        <div className="space-y-8">
            <AdminSection title="Assign User Role">
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                    <FormInput name="user_id" label="Firebase User ID (UID)" value={formState.user_id} onChange={handleInputChange} required />
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select id="role" name="role" value={formState.role} onChange={handleInputChange} className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500">
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                         <p className="mt-1 text-xs text-gray-500">Admins can manage all content and user roles. Editors can only manage content.</p>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'Saving...' : 'Save Role'}
                        </button>
                    </div>
                </form>
            </AdminSection>
            <AdminSection title="Current User Roles">
                {loading ? <p>Loading roles...</p> : (
                    <div className="divide-y divide-gray-200 border-t border-b">
                        {roles.map(role => (
                            <div key={role.user_id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold text-gray-800 capitalize">{role.role}</p>
                                    <p className="font-mono text-xs text-gray-500">{role.user_id}</p>
                                </div>
                                <button onClick={() => handleDelete(role.user_id)} className="text-sm font-semibold text-red-600 hover:underline">Remove</button>
                            </div>
                        ))}
                         {roles.length === 0 && <p className="p-4 text-center text-gray-500">No user roles have been assigned yet.</p>}
                    </div>
                )}
            </AdminSection>
        </div>
    );
};



// --- MAIN ADMIN COMPONENT & CONFIGS ---

// Common renderer for bilingual, ordered items with thumbnails
const renderCmsItem = (item: any, onEdit: (item: any) => void, onDelete: (id: string) => void) => (
    <div key={item.id} className="p-3 border border-gray-200 rounded-md flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4 min-w-0">
            <img src={item.thumbnailUrl || item.imgSrc} alt={item.title_en} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-100" />
            <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{item.title_en} / {item.title_km}</h3>
                <p className="text-sm text-gray-500">Order: {item.order}</p>
            </div>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
            <button onClick={() => onEdit(item)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
            <button onClick={() => onDelete(item.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
        </div>
    </div>
);

// Renderer for Feed posts
const renderFeedItem = (item: Post, onEdit: (item: any) => void, onDelete: (id: string) => void) => (
    <div key={item.id} className="p-4 border border-gray-200 rounded-md flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
        <div>
            <h3 className="font-bold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500">By {item.author} on {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}</p>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
            <button onClick={() => onEdit(item)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
            <button onClick={() => onDelete(item.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
        </div>
    </div>
);


const Admin: React.FC<AdminProps> = ({ user, isAdmin, authLoading }) => {
    const [view, setView] = useState<ViewType>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // AI State
    const [aiModal, setAiModal] = useState<{
        isOpen: boolean;
        formUpdateCallback: ((content: string) => void) | null;
    }>({ isOpen: false, formUpdateCallback: null });
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGeneratedContent, setAiGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY! }), []);

    const handleTranslate = async (sourceText: string, targetLang: string, sourceLang: string = 'English'): Promise<string | null> => {
        if (!sourceText.trim()) return null;
        try {
            const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Provide only the translated text, without any additional explanations, titles, or formatting. Text to translate: "${sourceText}"`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text.trim();
        } catch (error) {
            console.error("Translation error:", error);
            alert("Translation failed. See console for details.");
            return null;
        }
    };

    const openAiModal = (formUpdateCallback: (content: string) => void) => {
        setAiGeneratedContent('');
        setAiPrompt('');
        setAiModal({ isOpen: true, formUpdateCallback });
    };

    const closeAiModal = () => setAiModal({ isOpen: false, formUpdateCallback: null });

    const handleGenerateContent = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        setAiGeneratedContent('');
        try {
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: aiPrompt,
            });
            setAiGeneratedContent(response.text);
        } catch (error) {
            console.error("Content generation error:", error);
            setAiGeneratedContent("Failed to generate content. Please check the console for errors.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleInsertContent = () => {
        if (aiModal.formUpdateCallback && aiGeneratedContent) {
            aiModal.formUpdateCallback(aiGeneratedContent);
        }
        closeAiModal();
    };

    const postToEditFromState = (location.state as any)?.postToEdit as Post | undefined;
    useEffect(() => {
        if (postToEditFromState) {
            setView('feed');
            navigate(location.pathname, { replace: true }); // Clear state
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
        const managerProps = { handleTranslate, openAiModal };
        switch (view) {
            case 'dashboard': return <DashboardView />;
            case 'comments': return <CommentManager />;
            case 'about': return <AboutManager {...managerProps} />;
            case 'contact': return <ContactManager {...managerProps} />;
            case 'user-roles': return <UserRoleManager />;

            case 'feed':
                return <ContentManager
                    {...managerProps}
                    collectionName="posts"
                    orderByField="timestamp"
                    itemTitle="Post"
                    initialState={{ title: '', content: '', imageUrl: '' } as Omit<Post, 'id' | 'author' | 'timestamp'>}
                    itemToEdit={postToEditFromState}
                    onBeforeSubmit={(data, isEditing) => {
                        if (!isEditing) {
                            return { ...data, author: user.displayName || 'Admin', timestamp: new Date().toISOString() };
                        }
                        return data;
                    }}
                    fields={[
                        { name: 'title', label: 'Title', type: 'input' },
                        { name: 'content', label: 'Content (Markdown supported)', type: 'textarea', rows: 8, isAiGeneratable: true }
                    ]}
                    imageFields={[
                        { name: 'imageUrl', label: 'Image URL (Optional)', type: 'single', folder: 'posts' }
                    ]}
                    renderItem={renderFeedItem}
                />;
            
            case 'gallery':
                return <ContentManager
                    {...managerProps}
                    collectionName="gallery"
                    orderByField="order"
                    itemTitle="Album"
                    initialState={{ order: 0, title_en: '', title_km: '', description_en: '', description_km: '', content_en: '', content_km: '', thumbnailUrl: '', imageUrls: [] } as Omit<GalleryAlbum, 'id'>}
                    fields={[
                        { name: 'title', label: 'Title', type: 'input', bilingual: true },
                        { name: 'description', label: 'Short Description', type: 'textarea', rows: 3, bilingual: true, isAiGeneratable: true },
                        { name: 'content', label: 'Full Content', type: 'textarea', rows: 6, bilingual: true, isAiGeneratable: true }
                    ]}
                    imageFields={[
                        { name: 'thumbnailUrl', label: 'Thumbnail Image URL', type: 'single', folder: 'gallery/thumbnails', required: true },
                        { name: 'imageUrls', label: 'Detail Image URLs', type: 'multi', folder: 'gallery/details', helperText: 'Enter one image URL per line, or upload files.' }
                    ]}
                    renderItem={renderCmsItem}
                />;
            
            case 'events':
                return <ContentManager
                    {...managerProps}
                    collectionName="events"
                    orderByField="order"
                    itemTitle="Event"
                    initialState={{ order: 0, imgSrc: '', date_en: '', title_en: '', description_en: '', content_en: '', date_km: '', title_km: '', description_km: '', content_km: '', imageUrls: [] } as Omit<EventType, 'id'>}
                    fields={[
                        { name: 'title', label: 'Title', type: 'input', bilingual: true },
                        { name: 'date', label: 'Date', type: 'input', bilingual: true },
                        { name: 'description', label: 'Short Description', type: 'textarea', rows: 3, bilingual: true, isAiGeneratable: true },
                        { name: 'content', label: 'Full Content', type: 'textarea', rows: 6, bilingual: true, isAiGeneratable: true }
                    ]}
                    imageFields={[
                        { name: 'imgSrc', label: 'Thumbnail Image URL', type: 'single', folder: 'events/thumbnails', required: true },
                        { name: 'imageUrls', label: 'Detail Image URLs', type: 'multi', folder: 'events/details', helperText: 'Optional. Enter one image URL per line, or upload files.' }
                    ]}
                    renderItem={renderCmsItem}
                />;

            case 'teachings':
                 return <ContentManager
                    {...managerProps}
                    collectionName="teachings"
                    orderByField="order"
                    itemTitle="Teaching"
                    initialState={{ order: 0, title_en: '', content_en: '', title_km: '', content_km: '', excerpt_en: '', excerpt_km: '', thumbnailUrl: '', imageUrls: [] } as Omit<Teaching, 'id'>}
                    fields={[
                        { name: 'title', label: 'Title', type: 'input', bilingual: true },
                        { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 3, bilingual: true, isAiGeneratable: true },
                        { name: 'content', label: 'Full Content', type: 'textarea', rows: 8, bilingual: true, isAiGeneratable: true }
                    ]}
                    imageFields={[
                        { name: 'thumbnailUrl', label: 'Thumbnail Image URL', type: 'single', folder: 'teachings/thumbnails', required: true },
                        { name: 'imageUrls', label: 'Detail Image URLs', type: 'multi', folder: 'teachings/details', helperText: 'Optional. Enter one image URL per line, or upload files.' }
                    ]}
                    renderItem={renderCmsItem}
                />;

            default: return <AdminSection title="Dashboard"><p>Select a section to manage.</p></AdminSection>;
        }
    }

    return (
        <>
            <PageMeta title="Admin Dashboard | Wat Serei Mongkol" description={metaDescription} robots={metaRobots} />
            
            {/* AI Generation Modal */}
            {aiModal.isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <header className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2"><Sparkles className="w-5 h-5 text-amber-500" /><span>Generate Content with AI</span></h2>
                            <button onClick={closeAiModal} className="text-gray-500 hover:text-gray-800 transition-colors"><X className="w-6 h-6"/></button>
                        </header>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">Your Prompt</label>
                                <textarea id="ai-prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-amber-500" placeholder="e.g., Write a short description for a gallery album about the main temple building..."></textarea>
                            </div>
                             <button onClick={handleGenerateContent} disabled={isGenerating || !aiPrompt} className="bg-amber-600 text-white px-5 py-2 rounded-md hover:bg-amber-700 font-semibold disabled:opacity-50 transition-colors inline-flex items-center space-x-2">
                                {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                            </button>
                            <div>
                                <label htmlFor="ai-result" className="block text-sm font-medium text-gray-700 mb-1">AI Generated Content</label>
                                <div className="relative">
                                    <textarea id="ai-result" value={aiGeneratedContent} readOnly rows={8} className="w-full p-2 border border-gray-300 bg-gray-50 rounded-md font-mono text-sm" placeholder="AI output will appear here..."></textarea>
                                    {isGenerating && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>}
                                </div>
                            </div>
                        </div>
                        <footer className="flex items-center justify-end p-4 border-t bg-gray-50 space-x-3">
                            <button onClick={closeAiModal} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                            <button onClick={handleInsertContent} disabled={!aiGeneratedContent || isGenerating} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50 transition-colors">Insert Content</button>
                        </footer>
                    </div>
                </div>
            )}

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