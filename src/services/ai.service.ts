/**
 * AI Assessment Service
 * NestJS migration: replace with AIController
 * POST   /api/ai/assess-vehicle
 */

import { supabase } from "./api";

export interface AssessVehicleDTO {
  marca: string;
  modelo: string;
  anio: number;
  kilometraje: number | null;
  descripcion: string;
  imagen_urls: string[];
}

export interface AssessmentResult {
  estado: string;
  estimacion_danos: string;
  puntaje: number;
  precio_estimado_min: number;
  precio_estimado_max: number;
}

export const aiService = {
  async assessVehicle(dto: AssessVehicleDTO): Promise<AssessmentResult | null> {
    try {
      const { data } = await supabase.functions.invoke("assess-vehicle", {
        body: dto,
      });
      if (data?.estado) return data as AssessmentResult;
      return null;
    } catch {
      console.warn("AI assessment failed");
      return null;
    }
  },
};
