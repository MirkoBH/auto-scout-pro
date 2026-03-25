import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import VehicleCard from "@/components/VehicleCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Favorites = () => {
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const [pubs, setPubs] = useState<any[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = [...favoriteIds];
    if (ids.length === 0) { setPubs([]); setLoading(false); return; }
    (async () => {
      const [{ data: p }, { data: imgs }] = await Promise.all([
        supabase.from("publicaciones").select("*").in("id", ids),
        supabase.from("imagenes_publicacion").select("publicacion_id, imagen_ids"),
      ]);
      setPubs(p || []);
      const map: Record<string, string> = {};
      (imgs || []).forEach((img: any) => { if (img.imagen_ids?.length > 0) map[img.publicacion_id] = img.imagen_ids[0]; });
      setImageMap(map);
      setLoading(false);
    })();
  }, [favoriteIds]);

  if (!user) return <div className="container py-20 text-center text-muted-foreground">Inicia sesión para ver tus favoritos</div>;

  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Heart className="h-7 w-7 text-destructive" /> Mis Favoritos
      </h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />)}
        </div>
      ) : pubs.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">No tienes vehículos guardados aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pubs.map(p => (
            <VehicleCard key={p.id} {...p} imageUrl={imageMap[String(p.id)] || null} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
