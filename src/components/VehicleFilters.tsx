import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";

export interface Filters {
  search: string;
  marca: string;
  modelo: string;
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
  modelos: string[];
  paises: string[];
  provincias: string[];
  currentYear: number;
}

const MIN_VEHICLE_YEAR = 1886;

const FilterFields = ({
  filters,
  onChange,
  marcas,
  modelos,
  paises,
  provincias,
  currentYear,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  marcas: string[];
  modelos: string[];
  paises: string[];
  provincias: string[];
  currentYear: number;
}) => {
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });
  const marcaOptions = marcas.map((m) => ({ value: m, label: m }));
  const modeloOptions = modelos.map((m) => ({ value: m, label: m }));
  const paisOptions = paises.map((p) => ({ value: p, label: p }));
  const provinciaOptions = provincias.map((p) => ({ value: p, label: p }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Marca</Label>
        <SearchableSelect
          value={filters.marca}
          onChange={(v) => {
            if (v !== filters.marca) onChange({ ...filters, marca: v, modelo: "" });
          }}
          options={marcaOptions}
          allLabel="Todas"
          placeholder="Todas"
          searchPlaceholder="Buscar marca..."
          emptyText="Sin marcas"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Modelo</Label>
        <SearchableSelect
          value={filters.modelo}
          onChange={(v) => set("modelo", v)}
          options={modeloOptions}
          allLabel="Todos"
          placeholder={!filters.marca || filters.marca === "all" ? "Selecciona marca" : "Todos"}
          searchPlaceholder="Buscar modelo..."
          emptyText="Sin modelos"
          disabled={!filters.marca || filters.marca === "all"}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Precio mín</Label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minPrecio}
          min={0}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return set("minPrecio", "");
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return;
            set("minPrecio", String(Math.max(0, parsed)));
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Precio máx</Label>
        <Input
          type="number"
          placeholder="∞"
          value={filters.maxPrecio}
          min={0}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return set("maxPrecio", "");
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return;
            set("maxPrecio", String(Math.max(0, parsed)));
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Año mín</Label>
        <Input
          type="number"
          placeholder="2000"
          value={filters.anioMin}
          min={MIN_VEHICLE_YEAR}
          max={currentYear}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return set("anioMin", "");
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return;
            const clamped = Math.min(currentYear, Math.max(MIN_VEHICLE_YEAR, Math.trunc(parsed)));
            set("anioMin", String(clamped));
          }}
        />
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

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">País</Label>
        <SearchableSelect
          value={filters.pais}
          onChange={(v) => {
            if (v !== filters.pais) onChange({ ...filters, pais: v, provincia: "" });
          }}
          options={paisOptions}
          allLabel="Todos"
          placeholder="Todos"
          searchPlaceholder="Buscar país..."
          emptyText="Sin países"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Provincia</Label>
        <SearchableSelect
          value={filters.provincia}
          onChange={(v) => set("provincia", v)}
          options={provinciaOptions}
          allLabel="Todas"
          placeholder={!filters.pais || filters.pais === "all" ? "Selecciona país" : "Todas"}
          searchPlaceholder="Buscar provincia/localidad..."
          emptyText="Sin provincias/localidades"
          disabled={!filters.pais || filters.pais === "all"}
        />
      </div>
    </div>
  );
};

const VehicleFilters = ({ filters, onChange, onClear, marcas, modelos, paises, provincias, currentYear }: Props) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val });

  const hasActiveFilters = filters.marca || filters.modelo || filters.minPrecio || filters.maxPrecio || filters.anioMin || filters.combustible || filters.transmision || filters.pais || filters.provincia;

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
                <FilterFields
                  filters={filters}
                  onChange={onChange}
                  marcas={marcas}
                  modelos={modelos}
                  paises={paises}
                  provincias={provincias}
                  currentYear={currentYear}
                />
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

      <FilterFields
        filters={filters}
        onChange={onChange}
        marcas={marcas}
        modelos={modelos}
        paises={paises}
        provincias={provincias}
        currentYear={currentYear}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
};

export default VehicleFilters;
