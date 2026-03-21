import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import VehicleCard from "@/components/VehicleCard";
import VehicleFilters, { Filters } from "@/components/VehicleFilters";
import { Car, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const emptyFilters: Filters = { search: "", marca: "", minPrecio: "", maxPrecio: "", anioMin: "", combustible: "", transmision: "" };

interface Publicacion {
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
}

interface ImagenPublicacion {
  publicacion_id: string;
  imagen_ids: string[];
}

const Index = () => {
  const { user, userType } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [imagenes, setImagenes] = useState<ImagenPublicacion[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: pubs }, { data: imgs }] = await Promise.all([
        supabase.from("publicaciones").select("id, marca, modelo, anio, precio, ubicacion, kilometraje, tipo_combustible, transmision, estado_vehiculo").order("created_at", { ascending: false }),
        supabase.from("imagenes_publicacion").select("publicacion_id, imagen_ids"),
      ]);
      setPublicaciones((pubs as Publicacion[]) || []);
      setImagenes((imgs as ImagenPublicacion[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const marcas = useMemo(() => [...new Set(publicaciones.map(p => p.marca))].sort(), [publicaciones]);

  const imageMap = useMemo(() => {
    const map: Record<string, string> = {};
    imagenes.forEach(img => {
      if (img.imagen_ids?.length > 0) map[img.publicacion_id] = img.imagen_ids[0];
    });
    return map;
  }, [imagenes]);

  const filtered = useMemo(() => {
    return publicaciones.filter(p => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!`${p.marca} ${p.modelo}`.toLowerCase().includes(q)) return false;
      }
      if (filters.marca && filters.marca !== "all" && p.marca !== filters.marca) return false;
      if (filters.minPrecio && p.precio < Number(filters.minPrecio)) return false;
      if (filters.maxPrecio && p.precio > Number(filters.maxPrecio)) return false;
      if (filters.anioMin && p.anio < Number(filters.anioMin)) return false;
      if (filters.combustible && filters.combustible !== "all" && p.tipo_combustible !== filters.combustible) return false;
      if (filters.transmision && filters.transmision !== "all" && p.transmision !== filters.transmision) return false;
      return true;
    });
  }, [publicaciones, filters]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-28">
        <div className="container text-center space-y-6">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Encuentra tu próximo <span className="text-primary">auto ideal</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compra y vende autos usados con evaluación inteligente de condición del vehículo.
          </p>
          {!user && (
            <Button size="lg" asChild>
              <Link to="/auth">Comienza ahora</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="container py-10 space-y-6">
        <VehicleFilters filters={filters} onChange={setFilters} onClear={() => setFilters(emptyFilters)} marcas={marcas} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Search className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No se encontraron vehículos con estos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <VehicleCard
                key={p.id}
                {...p}
                imageUrl={imageMap[String(p.id)] || null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
