import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && "VITE_SUPABASE_URL",
    !supabaseAnonKey && "VITE_SUPABASE_ANON_KEY",
  ]
    .filter(Boolean)
    .join(", ");
  throw new Error(
    `Missing Supabase environment variable(s): ${missing}. ` +
      "Set them in Replit Secrets (for local dev) or in Azure portal Application Settings (for production)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SurveyRow {
  id: string;
  created_at: string;
  hometown: string;
  state: string;
  year_in_college: string;
  hobbies: string[];
  other_hobby: string | null;
}
