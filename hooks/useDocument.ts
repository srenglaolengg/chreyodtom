
import { useState, useEffect } from 'react';
import { db } from '../firebase';
// FIX: Use Firebase v8 compatible firestore methods.

export const useDocument = <T extends { id: string }>(collectionName: string, docId: string) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!docId) {
            setLoading(false);
            setError("Document ID is missing.");
            return;
        }

        setLoading(true);
        // FIX: Use v8 document reference and onSnapshot method.
        const docRef = db.collection(collectionName).doc(docId);

        const unsubscribe = docRef.onSnapshot((docSnap) => {
            if (docSnap.exists) {
                setData({ ...docSnap.data(), id: docSnap.id } as T);
                setError(null);
            } else {
                setError('Document not found.');
                setData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError('Could not fetch the document.');
            setLoading(false);
        });

        return () => unsubscribe();

    }, [collectionName, docId]);

    return { data, loading, error };
};
