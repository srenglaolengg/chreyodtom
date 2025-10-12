import { useState, useEffect } from 'react';
import { db } from '../firebase';
// FIX: Use Firebase v9 'compat' imports to provide the v8 API.
import firebase from 'firebase/compat/app';

interface CollectionOptions {
    orderBy?: {
        column: string;
        ascending?: boolean;
    };
    limit?: number;
}

export const useCollection = <T extends { id: string }>(collectionName: string, options?: CollectionOptions) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize options to prevent re-fetching on every render
    const memoizedOptions = JSON.stringify(options);

    useEffect(() => {
        setLoading(true);

        try {
            const currentOptions: CollectionOptions | undefined = memoizedOptions ? JSON.parse(memoizedOptions) : undefined;
            
            // FIX: Use v8 query building syntax.
            let q: firebase.firestore.Query = db.collection(collectionName);
            
            if (currentOptions?.orderBy) {
                q = q.orderBy(currentOptions.orderBy.column, currentOptions.orderBy.ascending === false ? 'desc' : 'asc');
            }
            if (currentOptions?.limit) {
                q = q.limit(currentOptions.limit);
            }

            const unsubscribe = q.onSnapshot((querySnapshot) => {
                const collectionData: T[] = [];
                querySnapshot.forEach((doc) => {
                    collectionData.push({ ...doc.data(), id: doc.id } as T);
                });
                setData(collectionData);
                setError(null);
                setLoading(false);
            }, (err) => {
                console.error(err);
                setError(`Could not fetch data from ${collectionName}.`);
                setLoading(false);
            });

            return () => unsubscribe();

        } catch (err) {
            console.error(err);
            setError('An error occurred while setting up the data listener.');
            setLoading(false);
        }

    }, [collectionName, memoizedOptions]);

    return { data, loading, error };
};