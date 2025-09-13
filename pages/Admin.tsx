import React, { useState, useEffect } from 'react';
import { FirebaseUser, Post } from '../types';
import { auth, db, githubProvider } from '../firebase';
// Fix: Use Firebase v8 compat API to resolve import errors
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { ADMIN_U_IDS } from '../constants';
import { GitHubIcon } from '../components/icons/GitHubIcon';

type FormState = Omit<Post, 'id' | 'timestamp' | 'author'> & { id?: string };

const initialFormState: FormState = {
    title: '',
    content: '',
    imageUrl: '',
};

const Admin: React.FC = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fix: Use auth.onAuthStateChanged from v8 compat API
        const unsubscribeAuth = auth.onAuthStateChanged((currentUser: firebase.User | null) => {
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
            setLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            setPosts([]);
            return;
        }

        // Fix: Use db.collection and .orderBy from v8 compat API
        const q = db.collection("posts").orderBy("timestamp", "desc");
        // Fix: Use q.onSnapshot from v8 compat API
        const unsubscribeFirestore = q.onSnapshot((querySnapshot) => {
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
    }, [isAdmin]);

    // Fix: Use auth.signInWithPopup from v8 compat API
    const handleLogin = async () => await auth.signInWithPopup(githubProvider);
    // Fix: Use auth.signOut from v8 compat API
    const handleLogout = async () => await auth.signOut();

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
                // Fix: Use db.collection().doc().delete() from v8 compat API
                await db.collection("posts").doc(id).delete();
            } catch (error) {
                console.error("Error deleting document: ", error);
                setError('Failed to delete post.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.title || !formState.content || !user) return;

        setLoading(true);
        setError(null);

        try {
            if (isEditing && formState.id) {
                // Fix: Use db.collection().doc().update() from v8 compat API
                const postRef = db.collection("posts").doc(formState.id);
                await postRef.update({
                    title: formState.title,
                    content: formState.content,
                    imageUrl: formState.imageUrl || '',
                });
            } else {
                // Fix: Use db.collection().add() and serverTimestamp from v8 compat API
                await db.collection("posts").add({
                    title: formState.title,
                    content: formState.content,
                    imageUrl: formState.imageUrl || '',
                    author: user.displayName || 'Admin',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
            handleCancelEdit();
        } catch (err) {
            console.error(err);
            setError('An error occurred while saving the post.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return <div className="min-h-screen flex items-center justify-center bg-stone-100">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-4 text-center">
                <h1 className="text-3xl font-bold text-amber-800 mb-4">Admin Access</h1>
                <p className="text-stone-600 mb-8">Please log in to manage content.</p>
                <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-colors shadow-md font-semibold">
                    <GitHubIcon className="w-6 h-6" />
                    <span>Login with GitHub</span>
                </button>
            </div>
        );
    }
    
    if (!isAdmin) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-stone-600 mb-8">You are not authorized to view this page.</p>
                <button onClick={handleLogout} className="bg-stone-500 text-white px-6 py-2 rounded-full hover:bg-stone-600 transition-colors text-sm font-semibold">
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-amber-800">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full" />
                        <span className="font-semibold text-stone-700 hidden sm:block">{user.displayName}</span>
                        <button onClick={handleLogout} className="bg-stone-500 text-white px-4 py-2 rounded-full hover:bg-stone-600 transition-colors text-sm font-semibold">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-6">
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}
                
                <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold text-stone-700 mb-6">{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-stone-600 mb-1">Title</label>
                            <input type="text" name="title" id="title" value={formState.title} onChange={handleInputChange} required className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"/>
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-stone-600 mb-1">Content</label>
                            <textarea name="content" id="content" value={formState.content} onChange={handleInputChange} required rows={8} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"></textarea>
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-stone-600 mb-1">Image URL (Optional)</label>
                            <input type="url" name="imageUrl" id="imageUrl" value={formState.imageUrl} onChange={handleInputChange} className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500"/>
                        </div>
                        <div className="flex items-center space-x-4 pt-2">
                             <button type="submit" disabled={loading} className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-md font-semibold disabled:bg-amber-300">
                                {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleCancelEdit} className="bg-stone-200 text-stone-700 px-6 py-2 rounded-full hover:bg-stone-300 transition-colors font-semibold">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-stone-700 mb-6">Manage Posts</h2>
                    <div className="space-y-4">
                        {posts.length > 0 ? posts.map(post => (
                            <div key={post.id} className="p-4 border border-stone-200 rounded-md flex flex-col sm:flex-row justify-between sm:items-center">
                                <div>
                                    <h3 className="font-bold text-stone-800">{post.title}</h3>
                                    <p className="text-sm text-stone-500">
                                        By {post.author} on {post.timestamp ? new Date(post.timestamp.seconds * 1000).toLocaleDateString() : '...'}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                                    <button onClick={() => handleEditClick(post)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                                    <button onClick={() => handleDelete(post.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button>
                                </div>
                            </div>
                        )) : <p className="text-stone-500">No posts found.</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;