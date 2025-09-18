import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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
        const docRef = doc(db, collectionName, docId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
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