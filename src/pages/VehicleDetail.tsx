import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Fuel, Gauge, MapPin, Cog, Shield, AlertTriangle } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const estadoColor: Record<string, string> = {
  Excelente: "bg-success text-success-foreground",
  Bueno: "bg-primary text-primary-foreground",
  Regular: "bg-warning text-warning-foreground",
  Malo: "bg-destructive text-destructive-foreground",
};

const VehicleDetail = () => {
  const { id } = useParams();
  const [pub, setPub] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: p }, { data: imgs }] = await Promise.all([
        supabase.from("publicaciones").select("*").eq("id", Number(id)).single(),
        supabase.from("imagenes_publicacion").select("imagen_ids").eq("publicacion_id", String(id)),
      ]);
      setPub(p);
      if (imgs && imgs.length > 0) setImages(imgs[0].imagen_ids || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!pub) return <div className="container py-20 text-center text-muted-foreground">Vehículo no encontrado</div>;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Link>
      </Button>

      {/* Image Carousel */}
      {images.length > 0 ? (
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((url, i) => (
              <CarouselItem key={i}>
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-muted">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && <><CarouselPrevious /><CarouselNext /></>}
        </Carousel>
      ) : (
        <div className="aspect-[16/9] rounded-lg bg-muted flex items-center justify-center">
          <Gauge className="h-16 w-16 text-muted-foreground" />
        </div>
      )}

      {/* Details */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">{pub.marca} {pub.modelo}</h1>
            <p className="text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-4 w-4" /> {pub.anio}</p>
          </div>
          <span className="font-display text-3xl font-bold text-primary">${Number(pub.precio).toLocaleString()}</span>
        </div>

        {/* AI Assessment */}
        {pub.estado_vehiculo && (
          <Card className="border-2">
            <CardContent className="flex items-center gap-4 p-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold">Evaluación IA:</span>
                  <Badge className={estadoColor[pub.estado_vehiculo] || ""}>{pub.estado_vehiculo}</Badge>
                </div>
                {pub.estimacion_danos && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> {pub.estimacion_danos}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pub.kilometraje != null && (
            <Card><CardContent className="p-4 text-center space-y-1"><Gauge className="h-5 w-5 mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground">Kilometraje</p><p className="font-semibold">{Number(pub.kilometraje).toLocaleString()} km</p></CardContent></Card>
          )}
          {pub.tipo_combustible && (
            <Card><CardContent className="p-4 text-center space-y-1"><Fuel className="h-5 w-5 mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground">Combustible</p><p className="font-semibold">{pub.tipo_combustible}</p></CardContent></Card>
          )}
          {pub.transmision && (
            <Card><CardContent className="p-4 text-center space-y-1"><Cog className="h-5 w-5 mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground">Transmisión</p><p className="font-semibold">{pub.transmision}</p></CardContent></Card>
          )}
          {pub.ubicacion && (
            <Card><CardContent className="p-4 text-center space-y-1"><MapPin className="h-5 w-5 mx-auto text-muted-foreground" /><p className="text-sm text-muted-foreground">Ubicación</p><p className="font-semibold">{pub.ubicacion}</p></CardContent></Card>
          )}
        </div>

        {pub.descripcion && (
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold">Descripción</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{pub.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;
