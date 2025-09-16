// FIX: The Supabase client is imported from '@supabase/supabase-js'.
// Added SupabaseClient type for conditional initialization.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- IMPORTANT SETUP INSTRUCTIONS ---

// 1. GET YOUR SUPABASE CREDENTIALS
//    Go to your Supabase project's dashboard.
//    Navigate to "Project Settings" (the gear icon) > "API".
//    You will find your Project URL and your `anon` public key.
//
// 2. PASTE YOUR CREDENTIALS HERE
//    Replace the placeholder values below with your actual Supabase URL and anon key.
//    For a production application, it is highly recommended to use environment variables
//    (e.g., process.env.SUPABASE_URL) instead of hardcoding them.
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'; // e.g., 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // This is the public 'anon' key

// --- BUCKET CONFIGURATION ---
// This constant defines the name of the Supabase Storage bucket where images will be uploaded.
//
// 1. CREATE A BUCKET IN SUPABASE
//    - Go to your Supabase project's dashboard.
//    - Navigate to "Storage" (the file icon).
//    - Click "New bucket".
//    - Enter the bucket name (e.g., 'images').
//    - **IMPORTANT**: Toggle "Public bucket" to ON. This allows the public URLs to be accessible
//      for displaying images on your website.
//
// 2. CONFIGURE BUCKET POLICIES (for public read and authenticated uploads)
//    - After creating the bucket, go to its policies.
//    - You may need to add policies to allow `authenticated` users to `insert` objects
//      while allowing everyone (`anon`) to `select` (read) them. A common setup is:
//      - Public read access for `storage.objects` on `select`.
//      - Authenticated user access for `storage.objects` on `insert`, `update`, `delete`.
export const BUCKET_NAME = 'images'; // The name of your public Supabase Storage bucket


// --- CLIENT INITIALIZATION ---
// Conditionally create the Supabase client to prevent app crashes if credentials are placeholders.
let supabase: SupabaseClient | null = null;

if (supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  // If credentials are still placeholders, warn the developer in the console.
  // The app will continue to run, but upload features will be disabled.
  console.warn(`Supabase credentials are not configured. Please update them in supabase.ts to enable image uploads.`);
} else {
  // If credentials are provided, attempt to create the client.
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    // Catch any other potential errors during client creation.
    console.error("Error initializing Supabase client:", error);
  }
}

// Export the client (which may be null if not configured).
export { supabase };
