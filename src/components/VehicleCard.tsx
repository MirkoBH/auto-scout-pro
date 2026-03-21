import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Fuel, Gauge } from "lucide-react";

interface VehicleCardProps {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  ubicacion?: string | null;
  kilometraje?: number | null;
  tipo_combustible?: string | null;
  estado_vehiculo?: string | null;
  imageUrl?: string | null;
}

const VehicleCard = ({ id, marca, modelo, anio, precio, ubicacion, kilometraje, tipo_combustible, estado_vehiculo, imageUrl }: VehicleCardProps) => {
  const estadoColor: Record<string, string> = {
    Excelente: "bg-success text-success-foreground",
    Bueno: "bg-primary text-primary-foreground",
    Regular: "bg-warning text-warning-foreground",
    Malo: "bg-destructive text-destructive-foreground",
  };

  return (
    <Link to={`/vehiculo/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={`${marca} ${modelo}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Gauge className="h-12 w-12" />
            </div>
          )}
          {estado_vehiculo && (
            <Badge className={`absolute top-3 right-3 ${estadoColor[estado_vehiculo] || ""}`}>
              {estado_vehiculo}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground">{marca} {modelo}</h3>
            </div>
            <span className="font-display font-bold text-lg text-primary">
              ${precio.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {anio}</span>
            {kilometraje != null && <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {kilometraje.toLocaleString()} km</span>}
            {tipo_combustible && <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {tipo_combustible}</span>}
            {ubicacion && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {ubicacion}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default VehicleCard;
