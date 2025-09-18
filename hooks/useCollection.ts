import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, QueryConstraint } from 'firebase/firestore';

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
            const constraints: QueryConstraint[] = [];
            
            if (currentOptions?.orderBy) {
                constraints.push(orderBy(currentOptions.orderBy.column, currentOptions.orderBy.ascending === false ? 'desc' : 'asc'));
            }
            if (currentOptions?.limit) {
                constraints.push(limit(currentOptions.limit));
            }
            
            const collectionRef = collection(db, collectionName);
            const q = query(collectionRef, ...constraints);

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
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