/**
 * Imagenes Service
 * NestJS migration: replace with ImagenesController
 * GET    /api/imagenes?publicacionId=...
 * POST   /api/imagenes
 * PATCH  /api/imagenes/:publicacionId
 */

import { supabase } from "./api";

export interface ImagenPublicacion {
  publicacion_id: string;
  imagen_ids: string[];
}

export const imagenesService = {
  async listAll() {
    const { data, error } = await supabase
      .from("imagenes_publicacion")
      .select("publicacion_id, imagen_ids");
    if (error) throw error;
    return (data as ImagenPublicacion[]) || [];
  },

  async getByPublicacionId(publicacionId: string) {
    const { data, error } = await supabase
      .from("imagenes_publicacion")
      .select("imagen_ids")
      .eq("publicacion_id", publicacionId);
    if (error) throw error;
    return data?.[0]?.imagen_ids || [];
  },

  async upsert(publicacionId: string, imagenIds: string[]) {
    const { data: existing } = await supabase
      .from("imagenes_publicacion")
      .select("id")
      .eq("publicacion_id", publicacionId);

    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from("imagenes_publicacion")
        .update({ imagen_ids: imagenIds })
        .eq("publicacion_id", publicacionId);
      if (error) throw error;
    } else if (imagenIds.length > 0) {
      const { error } = await supabase
        .from("imagenes_publicacion")
        .insert({ publicacion_id: publicacionId, imagen_ids: imagenIds });
      if (error) throw error;
    }
  },

  async create(publicacionId: string, imagenIds: string[]) {
    if (imagenIds.length === 0) return;
    const { error } = await supabase
      .from("imagenes_publicacion")
      .insert({ publicacion_id: publicacionId, imagen_ids: imagenIds });
    if (error) throw error;
  },
};
