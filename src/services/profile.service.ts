/**
 * Profile Service
 * NestJS migration: replace with ProfileController
 * GET    /api/profile
 * PATCH  /api/profile
 * PATCH  /api/profile/email
 */

import { supabase } from "./api";

export interface ProfileDTO {
  nombre: string | null;
  telefono: string | null;
}

export const profileService = {
  async get(userId: string): Promise<ProfileDTO> {
    const { data, error } = await supabase
      .from("app_users")
      .select("nombre, telefono")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { nombre: data?.nombre || null, telefono: data?.telefono || null };
  },

  async update(userId: string, dto: ProfileDTO) {
    const { error } = await supabase
      .from("app_users")
      .update(dto)
      .eq("id", userId);
    if (error) throw error;
  },

  async getUserType(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from("app_users")
      .select("type")
      .eq("id", userId)
      .single();
    return data?.type || null;
  },

  async updateUserType(userId: string, type: string) {
    const { error } = await supabase
      .from("app_users")
      .update({ type })
      .eq("id", userId);
    if (error) throw error;
  },

  async changeEmail(newEmail: string) {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
  },
};
