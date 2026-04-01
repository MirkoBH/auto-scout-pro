/**
 * Publicaciones Service
 * NestJS migration: replace with PublicacionesController endpoints
 * POST   /api/publicaciones
 * GET    /api/publicaciones
 * GET    /api/publicaciones/:id
 * PATCH  /api/publicaciones/:id
 * DELETE /api/publicaciones/:id
 */

import { supabase } from "./api";

export interface Publicacion {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  ubicacion: string | null;
  kilometraje: number | null;
  tipo_combustible: string | null;
  transmision: string | null;
  estado_vehiculo: string | null;
  estimacion_danos: string | null;
  descripcion: string | null;
  puntaje: number | null;
  precio_estimado_min: number | null;
  precio_estimado_max: number | null;
  user_id: string | null;
  created_at: string | null;
}

export interface CreatePublicacionDTO {
  marca: string;
  modelo: string;
  anio: number;
  kilometraje: number | null;
  tipo_combustible: string | null;
  transmision: string | null;
  precio: number;
  ubicacion: string | null;
  descripcion: string | null;
  user_id: string;
}

export interface UpdatePublicacionDTO {
  marca?: string;
  modelo?: string;
  anio?: number;
  kilometraje?: number | null;
  tipo_combustible?: string | null;
  transmision?: string | null;
  precio?: number;
  ubicacion?: string | null;
  descripcion?: string | null;
}

export interface AIAssessmentDTO {
  estado_vehiculo?: string;
  estimacion_danos?: string;
  puntaje?: number;
  precio_estimado_min?: number;
  precio_estimado_max?: number;
}

const LISTING_FIELDS = "id, marca, modelo, anio, precio, ubicacion, kilometraje, tipo_combustible, transmision, estado_vehiculo, estimacion_danos, descripcion, puntaje, precio_estimado_min, precio_estimado_max, user_id, created_at";

export const publicacionesService = {
  async list() {
    const { data, error } = await supabase
      .from("publicaciones")
      .select(LISTING_FIELDS)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Publicacion[]) || [];
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("publicaciones")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Publicacion;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("publicaciones")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByIds(ids: number[]) {
    const { data, error } = await supabase
      .from("publicaciones")
      .select("*")
      .in("id", ids);
    if (error) throw error;
    return (data as Publicacion[]) || [];
  },

  async create(dto: CreatePublicacionDTO): Promise<{ id: number }> {
    const { data, error } = await supabase
      .from("publicaciones")
      .insert(dto)
      .select("id")
      .single();
    if (error) throw error;
    return data as { id: number };
  },

  async update(id: number, dto: UpdatePublicacionDTO) {
    const { error } = await supabase
      .from("publicaciones")
      .update(dto)
      .eq("id", id);
    if (error) throw error;
  },

  async updateAIAssessment(id: number, dto: AIAssessmentDTO) {
    const { error } = await supabase
      .from("publicaciones")
      .update(dto)
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from("publicaciones")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
