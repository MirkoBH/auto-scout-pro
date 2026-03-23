import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useState } from "react";

export interface Filters {
  search: string;
  marca: string;
  minPrecio: string;
  maxPrecio: string;
  anioMin: string;
  combustible: string;
  transmision: string;
  pais: string;
  provincia: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
  marcas: string[];
}

const FilterFields = ({ filters, onChange, marcas }: { filters: Filters; onChange: (f: Filters) => void; marcas: string[] }) => {
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Marca</Label>
        <Select value={filters.marca} onValueChange={v => set("marca", v)}>
          <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {marcas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Precio mín</Label>
        <Input type="number" placeholder="0" value={filters.minPrecio} onChange={e => set("minPrecio", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Precio máx</Label>
        <Input type="number" placeholder="∞" value={filters.maxPrecio} onChange={e => set("maxPrecio", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Año mín</Label>
        <Input type="number" placeholder="2000" value={filters.anioMin} onChange={e => set("anioMin", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Combustible</Label>
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

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Transmisión</Label>
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
  );
};

const VehicleFilters = ({ filters, onChange, onClear, marcas }: Props) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });

  const hasActiveFilters = filters.marca || filters.minPrecio || filters.maxPrecio || filters.anioMin || filters.combustible || filters.transmision;

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marca, modelo..."
              value={filters.search}
              onChange={e => set("search", e.target.value)}
              className="pl-9"
            />
          </div>
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filtros</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-4">
                <FilterFields filters={filters} onChange={onChange} marcas={marcas} />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { onClear(); setDrawerOpen(false); }} className="text-muted-foreground">
                    <X className="mr-1 h-3.5 w-3.5" /> Limpiar
                  </Button>
                  <Button size="sm" onClick={() => setDrawerOpen(false)} className="flex-1 rounded-full">
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-0 shadow-sm rounded-2xl p-5 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar marca, modelo..."
          value={filters.search}
          onChange={e => set("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <FilterFields filters={filters} onChange={onChange} marcas={marcas} />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
};

export default VehicleFilters;
