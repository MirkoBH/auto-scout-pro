import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Fuel, Gauge, Sparkles } from "lucide-react";

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

const estadoColor: Record<string, string> = {
  Excelente: "bg-success text-success-foreground",
  Bueno: "bg-primary text-primary-foreground",
  Regular: "bg-warning text-warning-foreground",
  Malo: "bg-destructive text-destructive-foreground",
};

const VehicleCard = ({ id, marca, modelo, anio, precio, ubicacion, kilometraje, tipo_combustible, estado_vehiculo, imageUrl }: VehicleCardProps) => {
  return (
    <Link to={`/vehiculo/${id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 shadow-sm">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={`${marca} ${modelo}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Gauge className="h-12 w-12" />
            </div>
          )}
          {estado_vehiculo && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <Badge className={`${estadoColor[estado_vehiculo] || ""} text-xs font-medium`}>
                <Sparkles className="mr-1 h-3 w-3" /> {estado_vehiculo}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base text-foreground leading-tight">{marca} {modelo}</h3>
            <span className="font-bold text-lg text-primary whitespace-nowrap">
              ${precio.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
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
