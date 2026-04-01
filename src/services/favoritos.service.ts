/**
 * Favoritos Service
 * NestJS migration: replace with FavoritosController
 * GET    /api/favoritos
 * POST   /api/favoritos
 * DELETE /api/favoritos/:publicacionId
 */

import { supabase } from "./api";

export const favoritosService = {
  async list(userId: string): Promise<number[]> {
    const { data, error } = await supabase
      .from("favoritos")
      .select("publicacion_id")
      .eq("user_id", userId);
    if (error) throw error;
    return (data || []).map((f) => f.publicacion_id);
  },

  async add(userId: string, publicacionId: number) {
    const { error } = await supabase
      .from("favoritos")
      .insert({ user_id: userId, publicacion_id: publicacionId });
    if (error) throw error;
  },

  async remove(userId: string, publicacionId: number) {
    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("user_id", userId)
      .eq("publicacion_id", publicacionId);
    if (error) throw error;
  },
};
