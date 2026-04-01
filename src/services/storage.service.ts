/**
 * Storage Service
 * NestJS migration: replace with StorageController / S3 uploads
 * POST   /api/storage/upload
 * DELETE /api/storage/:path
 */

import { supabase } from "./api";

const BUCKET = "vehiculos";

export const storageService = {
  async uploadImage(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};
