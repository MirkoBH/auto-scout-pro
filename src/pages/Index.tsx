import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import VehicleCard from "@/components/VehicleCard";
import VehicleFilters, { Filters } from "@/components/VehicleFilters";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCarMakes } from "@/hooks/useCarMakes";
import { useCurrentYear } from "@/hooks/useCurrentYear";
import { useToast } from "@/hooks/use-toast";

const emptyFilters: Filters = { search: "", marca: "", modelo: "", minPrecio: "", maxPrecio: "", anioMin: "", combustible: "", transmision: "", pais: "", provincia: "" };
const MIN_VEHICLE_YEAR = 1886;

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

const CardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-card shadow-sm">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  </div>
);

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { makes, modelsByMake, makesError } = useCarMakes();
  const { currentYear } = useCurrentYear();
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

  useEffect(() => {
    if (!makesError) return;
    toast({ title: "Marcas/modelos API no disponible", description: makesError, variant: "destructive" });
  }, [makesError, toast]);

  const marcasFromListings = useMemo(() => [...new Set(publicaciones.map((p) => p.marca))].sort(), [publicaciones]);
  const marcas = makes.length > 0 ? makes : marcasFromListings;

  const modelos = useMemo(() => {
    if (!filters.marca || filters.marca === "all") return [];
    if (modelsByMake.size > 0) return modelsByMake.get(filters.marca) ?? [];
    return [...new Set(publicaciones.filter((p) => p.marca === filters.marca).map((p) => p.modelo))].sort();
  }, [filters.marca, modelsByMake, publicaciones]);

  // Extract unique countries and provinces from ubicacion "Province, Country"
  const paises = useMemo(() => {
    const paisSet = new Set<string>();
    publicaciones.forEach(p => {
      if (!p.ubicacion) return;
      const parts = p.ubicacion.split(", ");
      const pais = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
      paisSet.add(pais);
    });
    return [...paisSet].sort();
  }, [publicaciones]);

  const filteredProvincias = useMemo(() => {
    if (!filters.pais || filters.pais === "all") return [];
    const provSet = paises.length > 0 ? (publicaciones.reduce((acc, p) => {
      if (!p.ubicacion) return acc;
      const parts = p.ubicacion.split(", ");
      if (parts.length >= 2 && parts[parts.length - 1] === filters.pais) {
        acc.add(parts.slice(0, -1).join(", "));
      }
      return acc;
    }, new Set<string>())) : new Set<string>();
    return [...provSet].sort();
  }, [publicaciones, filters.pais, paises]);

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
      if (filters.modelo && filters.modelo !== "all" && p.modelo !== filters.modelo) return false;
      if (filters.minPrecio && p.precio < Number(filters.minPrecio)) return false;
      if (filters.maxPrecio && p.precio > Number(filters.maxPrecio)) return false;
      if (filters.anioMin) {
        const anioMinInput = Number(filters.anioMin);
        const safeAnioMin = Math.min(currentYear, Math.max(MIN_VEHICLE_YEAR, Math.trunc(anioMinInput)));
        if (p.anio < safeAnioMin) return false;
      }
      if (filters.combustible && filters.combustible !== "all" && p.tipo_combustible !== filters.combustible) return false;
      if (filters.transmision && filters.transmision !== "all" && p.transmision !== filters.transmision) return false;
      if (filters.pais && filters.pais !== "all") {
        if (!p.ubicacion) return false;
        const parts = p.ubicacion.split(", ");
        const pais = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
        if (pais !== filters.pais) return false;
      }
      if (filters.provincia && filters.provincia !== "all") {
        if (!p.ubicacion) return false;
        const parts = p.ubicacion.split(", ");
        const prov = parts.length >= 2 ? parts.slice(0, -1).join(", ") : "";
        if (prov !== filters.provincia) return false;
      }
      return true;
    });
  }, [publicaciones, filters, currentYear]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28">
        <div className="container text-center space-y-5">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Encuentra tu próximo<br />
            <span className="text-primary">auto ideal</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Compra y vende autos usados con evaluación inteligente de condición del vehículo.
          </p>
          {!user && (
            <Button size="lg" asChild className="rounded-full px-8 active:scale-[0.98] transition-transform">
              <Link to="/auth">Comienza ahora</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="container pb-16 space-y-6">
        <VehicleFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(emptyFilters)}
          marcas={marcas}
          modelos={modelos}
          paises={paises}
          provincias={filteredProvincias}
          currentYear={currentYear}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Search className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No se encontraron vehículos con estos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <VehicleCard
                  {...p}
                  imageUrl={imageMap[String(p.id)] || null}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
