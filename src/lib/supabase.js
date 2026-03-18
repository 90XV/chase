import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

const safeUrl = supabaseUrl.startsWith("http") ? supabaseUrl : `https://${supabaseUrl}`;

export const supabase = createClient(safeUrl, supabaseAnonKey);
