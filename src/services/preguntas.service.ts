/**
 * Preguntas Service
 * NestJS migration: replace with PreguntasController
 * GET    /api/preguntas?publicacionId=...
 * POST   /api/preguntas
 * PATCH  /api/preguntas/:id/reply
 * DELETE /api/preguntas/:id
 */

import { supabase } from "./api";

export interface Pregunta {
  id: string;
  publicacion_id: number;
  user_id: string;
  pregunta: string;
  respuesta: string | null;
  respondido_por: string | null;
  created_at: string;
  respondido_at: string | null;
}

export const preguntasService = {
  async listByPublicacion(publicacionId: number) {
    const { data, error } = await supabase
      .from("preguntas")
      .select("*")
      .eq("publicacion_id", publicacionId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Pregunta[]) || [];
  },

  async create(publicacionId: number, userId: string, pregunta: string) {
    const { error } = await supabase
      .from("preguntas")
      .insert({ publicacion_id: publicacionId, user_id: userId, pregunta });
    if (error) throw error;
  },

  async reply(preguntaId: string, userId: string, respuesta: string) {
    const { error } = await supabase
      .from("preguntas")
      .update({
        respuesta,
        respondido_por: userId,
        respondido_at: new Date().toISOString(),
      })
      .eq("id", preguntaId);
    if (error) throw error;
  },

  async delete(preguntaId: string) {
    const { error } = await supabase
      .from("preguntas")
      .delete()
      .eq("id", preguntaId);
    if (error) throw error;
  },
};
