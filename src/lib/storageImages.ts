import { supabase } from "@/integrations/supabase/client";

const VEHICULOS_BUCKET = "vehiculos";

export const getStoragePathFromPublicUrl = (publicUrl: string, bucket = VEHICULOS_BUCKET): string | null => {
  try {
    const parsed = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) return null;

    const storagePath = decodeURIComponent(parsed.pathname.slice(index + marker.length));
    return storagePath || null;
  } catch {
    return null;
  }
};

export const deleteVehicleImageUrls = async (urls: string[]) => {
  const paths = urls
    .map((url) => getStoragePathFromPublicUrl(url))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(VEHICULOS_BUCKET).remove(paths);
  if (error) throw error;
};
