/**
 * Auth Service
 * NestJS migration: replace with AuthController
 * POST   /api/auth/signup
 * POST   /api/auth/signin
 * POST   /api/auth/signout
 * GET    /api/auth/session
 */

import { supabase } from "./api";
import type { Session, User } from "@supabase/supabase-js";

export const authService = {
  async signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    const { data } = await supabase.auth.getSession();
    return {
      session: data?.session ?? null,
      user: data?.session?.user ?? null,
    };
  },

  async getUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => callback(session)
    );
    return subscription;
  },
};
