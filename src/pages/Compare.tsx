import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gauge, Calendar, Fuel, Cog, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const estadoColor: Record<string, string> = {
  Excelente: "bg-success text-success-foreground",
  Bueno: "bg-primary text-primary-foreground",
  Regular: "bg-warning text-warning-foreground",
  Malo: "bg-destructive text-destructive-foreground",
};

interface Pub {
  id: number; marca: string; modelo: string; anio: number; precio: number;
  kilometraje: number | null; tipo_combustible: string | null; transmision: string | null;
  ubicacion: string | null; estado_vehiculo: string | null; estimacion_danos: string | null;
  puntaje: number | null; precio_estimado_min: number | null; precio_estimado_max: number | null;
}

const Compare = () => {
  const [params] = useSearchParams();
  const ids = (params.get("ids") || "").split(",").map(Number).filter(Boolean);
  const [vehicles, setVehicles] = useState<Pub[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    (async () => {
      const [{ data: pubs }, { data: imgs }] = await Promise.all([
        supabase.from("publicaciones").select("*").in("id", ids),
        supabase.from("imagenes_publicacion").select("publicacion_id, imagen_ids"),
      ]);
      setVehicles((pubs || []) as Pub[]);
      const map: Record<string, string> = {};
      (imgs || []).forEach((img: any) => { if (img.imagen_ids?.length > 0) map[img.publicacion_id] = img.imagen_ids[0]; });
      setImages(map);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="container max-w-5xl py-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-2 gap-6"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
    </div>
  );

  if (vehicles.length < 2) return (
    <div className="container py-20 text-center space-y-4">
      <p className="text-muted-foreground">Selecciona 2 vehículos para comparar.</p>
      <Button asChild variant="outline" className="rounded-full"><Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Link></Button>
    </div>
  );

  const rows: { label: string; icon: React.ReactNode; get: (p: Pub) => string; better?: "higher" | "lower" }[] = [
    { label: "Precio", icon: <TrendingUp className="h-4 w-4" />, get: p => `$${Number(p.precio).toLocaleString()}`, better: "lower" },
    { label: "Año", icon: <Calendar className="h-4 w-4" />, get: p => String(p.anio), better: "higher" },
    { label: "Kilometraje", icon: <Gauge className="h-4 w-4" />, get: p => p.kilometraje != null ? `${p.kilometraje.toLocaleString()} km` : "N/A", better: "lower" },
    { label: "Combustible", icon: <Fuel className="h-4 w-4" />, get: p => p.tipo_combustible || "N/A" },
    { label: "Transmisión", icon: <Cog className="h-4 w-4" />, get: p => p.transmision || "N/A" },
    { label: "Ubicación", icon: <MapPin className="h-4 w-4" />, get: p => p.ubicacion || "N/A" },
    { label: "Puntaje IA", icon: <Sparkles className="h-4 w-4" />, get: p => p.puntaje != null ? `${p.puntaje}/100` : "N/A", better: "higher" },
    { label: "Precio Est. Min", icon: <TrendingUp className="h-4 w-4" />, get: p => p.precio_estimado_min != null ? `$${Number(p.precio_estimado_min).toLocaleString()}` : "N/A" },
    { label: "Precio Est. Max", icon: <TrendingUp className="h-4 w-4" />, get: p => p.precio_estimado_max != null ? `$${Number(p.precio_estimado_max).toLocaleString()}` : "N/A" },
  ];

  const [a, b] = vehicles;

  const getBetterClass = (row: typeof rows[0], vIdx: number) => {
    if (!row.better) return "";
    const va = row.get(a), vb = row.get(b);
    const na = parseFloat(va.replace(/[^0-9.-]/g, "")), nb = parseFloat(vb.replace(/[^0-9.-]/g, ""));
    if (isNaN(na) || isNaN(nb) || na === nb) return "";
    const isBetter = row.better === "higher" ? (vIdx === 0 ? na > nb : nb > na) : (vIdx === 0 ? na < nb : nb < na);
    return isBetter ? "text-success font-semibold" : "text-muted-foreground";
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" asChild className="rounded-full">
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Link>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">Comparar Vehículos</h1>

      {/* Headers */}
      <div className="grid grid-cols-[180px_1fr_1fr] gap-4">
        <div />
        {vehicles.map((v, i) => (
          <Card key={v.id} className="border-0 shadow-md overflow-hidden">
            <div className="aspect-[16/10] bg-muted">
              {images[String(v.id)] ? <img src={images[String(v.id)]} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Gauge className="h-10 w-10 text-muted-foreground" /></div>}
            </div>
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold">{v.marca} {v.modelo}</h3>
              {v.estado_vehiculo && <Badge className={`mt-1 ${estadoColor[v.estado_vehiculo] || ""} text-xs`}><Sparkles className="mr-1 h-3 w-3" />{v.estado_vehiculo}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison rows */}
      <div className="rounded-2xl border border-border overflow-hidden">
        {rows.map((row, ri) => (
          <div key={row.label} className={`grid grid-cols-[180px_1fr_1fr] gap-4 px-4 py-3 ${ri % 2 === 0 ? "bg-muted/30" : ""}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">{row.icon} {row.label}</div>
            <div className={`text-sm text-center ${getBetterClass(row, 0)}`}>{row.get(a)}</div>
            <div className={`text-sm text-center ${getBetterClass(row, 1)}`}>{row.get(b)}</div>
          </div>
        ))}
      </div>

      {/* Damage descriptions */}
      <div className="grid grid-cols-2 gap-4">
        {vehicles.map(v => (
          <Card key={v.id} className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-1">
              <h4 className="font-semibold text-sm">Estimación de daños</h4>
              <p className="text-sm text-muted-foreground">{v.estimacion_danos || "Sin evaluación disponible"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Compare;
