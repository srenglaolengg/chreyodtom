import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface CollectionOptions {
    orderBy?: {
        column: string;
        ascending?: boolean;
    };
    limit?: number;
}

// FIX: Relaxed generic constraint from `T extends { id: string }` to `T extends Record<string, any>`
// This allows the hook to be used with collections that don't have an `id` field, like 'user_roles'.
export const useCollection = <T extends Record<string, any>>(tableName: string, options?: CollectionOptions) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize options to prevent re-fetching on every render
    const memoizedOptions = JSON.stringify(options);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            setError("Supabase client not initialized.");
            return;
        }

        const fetchCollection = async () => {
            setLoading(true);
            
            // Re-parse options inside useEffect
            const currentOptions: CollectionOptions | undefined = memoizedOptions ? JSON.parse(memoizedOptions) : undefined;
            
            let query = supabase.from(tableName).select('*');
            
            if (currentOptions?.orderBy) {
                query = query.order(currentOptions.orderBy.column, { ascending: currentOptions.orderBy.ascending ?? true });
            }
            if (currentOptions?.limit) {
                query = query.limit(currentOptions.limit);
            }

            const { data: collectionData, error: collectionError } = await query;

            if (collectionError) {
                console.error(collectionError);
                setError(`Could not fetch data from ${tableName}.`);
                setData([]);
            } else {
                setData(collectionData as T[]);
                setError(null);
            }
            setLoading(false);
        };

        fetchCollection();

    }, [tableName, memoizedOptions]);

    return { data, loading, error };
};
