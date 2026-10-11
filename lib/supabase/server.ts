// src/lib/supabase/server.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Todo el acceso a datos va por el servidor con la service role (ignora RLS)
export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );