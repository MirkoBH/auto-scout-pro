import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";

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
  paises: string[];
  provincias: string[];
}

const currentYear = new Date().getFullYear();
const yearOptions = [
  { value: "all", label: "Todos" },
  ...Array.from({ length: currentYear - 1886 + 1 }, (_, i) => {
    const y = String(currentYear - i);
    return { value: y, label: y };
  }),
];

const FilterFields = ({ filters, onChange, marcas, paises, provincias }: { filters: Filters; onChange: (f: Filters) => void; marcas: string[]; paises: string[]; provincias: string[] }) => {
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });

  const marcaOptions = useMemo(
    () => [{ value: "all", label: "Todas" }, ...marcas.map((m) => ({ value: m, label: m }))],
    [marcas]
  );

  const paisOptions = useMemo(
    () => [{ value: "all", label: "Todos" }, ...paises.map((p) => ({ value: p, label: p }))],
    [paises]
  );

  const provinciaOptions = useMemo(
    () => [{ value: "all", label: "Todas" }, ...provincias.map((p) => ({ value: p, label: p }))],
    [provincias]
  );

  const handlePrecioChange = (key: "minPrecio" | "maxPrecio", val: string) => {
    const num = Number(val);
    if (val && num < 0) return;
    set(key, val);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Marca</Label>
        <Combobox
          options={marcaOptions}
          value={filters.marca}
          onValueChange={(v) => set("marca", v)}
          placeholder="Todas"
          searchPlaceholder="Buscar marca..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Precio mín</Label>
        <Input type="number" placeholder="0" min={0} value={filters.minPrecio} onChange={(e) => handlePrecioChange("minPrecio", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Precio máx</Label>
        <Input type="number" placeholder="∞" min={0} value={filters.maxPrecio} onChange={(e) => handlePrecioChange("maxPrecio", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Año mín</Label>
        <Combobox
          options={yearOptions}
          value={filters.anioMin}
          onValueChange={(v) => set("anioMin", v)}
          placeholder="Todos"
          searchPlaceholder="Buscar año..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Combustible</Label>
        <Select value={filters.combustible} onValueChange={(v) => set("combustible", v)}>
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
        <Select value={filters.transmision} onValueChange={(v) => set("transmision", v)}>
          <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Manual">Manual</SelectItem>
            <SelectItem value="Automática">Automática</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">País</Label>
        <Combobox
          options={paisOptions}
          value={filters.pais}
          onValueChange={(v) => { onChange({ ...filters, pais: v, provincia: "" }); }}
          placeholder="Todos"
          searchPlaceholder="Buscar país..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Provincia</Label>
        <Combobox
          options={provinciaOptions}
          value={filters.provincia}
          onValueChange={(v) => set("provincia", v)}
          placeholder={!filters.pais || filters.pais === "all" ? "Selecciona país" : "Todas"}
          searchPlaceholder="Buscar provincia..."
          disabled={!filters.pais || filters.pais === "all"}
        />
      </div>
    </div>
  );
};

const VehicleFilters = ({ filters, onChange, onClear, marcas, paises, provincias }: Props) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });

  const hasActiveFilters = filters.marca || filters.minPrecio || filters.maxPrecio || filters.anioMin || filters.combustible || filters.transmision || filters.pais || filters.provincia;

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marca, modelo..."
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
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
                <FilterFields filters={filters} onChange={onChange} marcas={marcas} paises={paises} provincias={provincias} />
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
          onChange={(e) => set("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <FilterFields filters={filters} onChange={onChange} marcas={marcas} paises={paises} provincias={provincias} />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
};

export default VehicleFilters;
