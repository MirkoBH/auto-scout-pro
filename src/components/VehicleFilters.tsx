import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface Filters {
  search: string;
  marca: string;
  minPrecio: string;
  maxPrecio: string;
  anioMin: string;
  combustible: string;
  transmision: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
  marcas: string[];
}

const VehicleFilters = ({ filters, onChange, onClear, marcas }: Props) => {
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar marca, modelo..."
          value={filters.search}
          onChange={e => set("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Marca</Label>
          <Select value={filters.marca} onValueChange={v => set("marca", v)}>
            <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {marcas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Precio mín</Label>
          <Input type="number" placeholder="0" value={filters.minPrecio} onChange={e => set("minPrecio", e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Precio máx</Label>
          <Input type="number" placeholder="∞" value={filters.maxPrecio} onChange={e => set("maxPrecio", e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Año mín</Label>
          <Input type="number" placeholder="2000" value={filters.anioMin} onChange={e => set("anioMin", e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Combustible</Label>
          <Select value={filters.combustible} onValueChange={v => set("combustible", v)}>
            <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Gasolina">Gasolina</SelectItem>
              <SelectItem value="Diésel">Diésel</SelectItem>
              <SelectItem value="Eléctrico">Eléctrico</SelectItem>
              <SelectItem value="Híbrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Transmisión</Label>
          <Select value={filters.transmision} onValueChange={v => set("transmision", v)}>
            <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automática">Automática</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
        <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
      </Button>
    </div>
  );
};

export default VehicleFilters;
