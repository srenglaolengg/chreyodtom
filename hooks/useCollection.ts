import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, Query, DocumentData } from 'firebase/firestore';

export const useCollection = <T extends { id: string }>(q: Query<DocumentData>) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const documents: T[] = [];
            querySnapshot.forEach((doc) => {
                documents.push({ id: doc.id, ...doc.data() } as T);
            });
            setData(documents);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError('Could not fetch data from collection.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []); // Note: The query object 'q' should be memoized in the component calling this hook to prevent re-fetching.

    return { data, loading, error };
};
