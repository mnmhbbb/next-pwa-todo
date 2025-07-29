import { createBrowserClient } from "@supabase/ssr";

// Create a supabase client on the browser with project's credentials
const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

const createBrowserSupabaseClient = createClient();

export default createBrowserSupabaseClient;
