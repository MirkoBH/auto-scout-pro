/**
 * API Service Layer
 * 
 * This file centralizes all backend communication.
 * To migrate to NestJS: replace `supabase` calls with `fetch('/api/...')` calls.
 * Each service module below maps 1:1 to a future NestJS controller.
 */

import { supabase } from "@/integrations/supabase/client";

export { supabase };

/**
 * Helper: get the current authenticated user ID.
 * In NestJS migration, this would come from a JWT token.
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
};
