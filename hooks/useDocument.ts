import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

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
        if (!supabase) {
            setLoading(false);
            setError("Supabase client not initialized.");
            return;
        }

        const fetchDocument = async () => {
            setLoading(true);
            const { data: docData, error: docError } = await supabase
                .from(collectionName)
                .select('*')
                .eq('id', docId)
                .single();

            if (docError) {
                console.error(docError);
                // Don't set error for "not found", as it's a valid state
                if (docError.code !== 'PGRST116') {
                    setError('Could not fetch the document.');
                } else {
                    setError('Document not found.');
                }
                setData(null);
            } else {
                setData(docData as T);
                setError(null);
            }
            setLoading(false);
        };

        fetchDocument();

        // This hook performs a one-time fetch. For real-time updates,
        // you would implement Supabase subscriptions here.
    }, [collectionName, docId]);

    return { data, loading, error };
};
