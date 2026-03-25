import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavoriteIds(new Set()); return; }
    setLoading(true);
    const { data } = await supabase
      .from("favoritos")
      .select("publicacion_id")
      .eq("user_id", user.id);
    setFavoriteIds(new Set((data || []).map((f: any) => Number(f.publicacion_id))));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (pubId: number) => {
    if (!user) return;
    const isFav = favoriteIds.has(pubId);
    if (isFav) {
      await supabase.from("favoritos").delete().eq("user_id", user.id).eq("publicacion_id", pubId);
      setFavoriteIds(prev => { const n = new Set(prev); n.delete(pubId); return n; });
    } else {
      await supabase.from("favoritos").insert({ user_id: user.id, publicacion_id: pubId });
      setFavoriteIds(prev => new Set(prev).add(pubId));
    }
  }, [user, favoriteIds]);

  const isFavorite = useCallback((pubId: number) => favoriteIds.has(pubId), [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite, loading, count: favoriteIds.size };
}
