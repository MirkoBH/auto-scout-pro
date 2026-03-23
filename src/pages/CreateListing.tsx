import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import SearchableSelect from "@/components/SearchableSelect";
import { useCarMakes } from "@/hooks/useCarMakes";
import { useCurrentYear } from "@/hooks/useCurrentYear";

const MIN_VEHICLE_YEAR = 1886;

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { countryList, getStates } = useCountries();
  const { makes, modelsByMake, loadingMakes, makesError } = useCarMakes();
  const { currentYear, isApiYear } = useCurrentYear();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const states = getStates(selectedCountry);

  const [form, setForm] = useState({
    marca: "", modelo: "", anio: "", kilometraje: "", tipo_combustible: "", transmision: "", precio: "", ubicacion: "", descripcion: "",
  });

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const makeOptions = useMemo(() => makes.map((make) => ({ value: make, label: make })), [makes]);
  const modelOptions = useMemo(
    () => (form.marca ? (modelsByMake.get(form.marca) ?? []).map((model) => ({ value: model, label: model })) : []),
    [form.marca, modelsByMake],
  );
  const countryOptions = useMemo(() => countryList.map((c) => ({ value: c.code, label: c.name })), [countryList]);
  const stateOptions = useMemo(() => states.map((s) => ({ value: s.code, label: s.name })), [states]);

  useEffect(() => {
    if (!makesError) return;
    toast({ title: "No se cargaron marcas/modelos", description: makesError, variant: "destructive" });
  }, [makesError, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const anio = Number(form.anio);
    const precio = Number(form.precio);
    const kilometraje = form.kilometraje ? Number(form.kilometraje) : null;

    if (!form.marca || !form.modelo) {
      toast({ title: "Error", description: "Debes seleccionar marca y modelo", variant: "destructive" });
      return;
    }

    if (!Number.isInteger(anio) || anio < MIN_VEHICLE_YEAR || anio > currentYear) {
      toast({
        title: "Año inválido",
        description: `El año debe estar entre ${MIN_VEHICLE_YEAR} y ${currentYear}`,
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      toast({ title: "Precio inválido", description: "El precio debe ser un número mayor o igual a 0", variant: "destructive" });
      return;
    }

    if (kilometraje !== null && (!Number.isInteger(kilometraje) || kilometraje < 0)) {
      toast({
        title: "Kilometraje inválido",
        description: "El kilometraje debe ser un número entero mayor o igual a 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: pub, error: pubError } = await supabase.from("publicaciones").insert({
        marca: form.marca,
        modelo: form.modelo,
        anio,
        kilometraje,
        tipo_combustible: form.tipo_combustible || null,
        transmision: form.transmision || null,
        precio,
        ubicacion: selectedState && selectedCountry
          ? `${states.find(s => s.code === selectedState)?.name || selectedState}, ${countryList.find(c => c.code === selectedCountry)?.name || selectedCountry}`
          : selectedCountry
            ? countryList.find(c => c.code === selectedCountry)?.name || selectedCountry
            : null,
        descripcion: form.descripcion || null,
        user_id: user.id,
      }).select("id").single();

      if (pubError) throw pubError;

      if (imageUrls.length > 0 && pub) {
        const { error: imageInsertError } = await supabase.from("imagenes_publicacion").insert({
          publicacion_id: String(pub.id),
          imagen_ids: imageUrls,
        });
        if (imageInsertError) throw imageInsertError;
      }

      if (pub) {
        try {
          const { data: aiData } = await supabase.functions.invoke("assess-vehicle", {
            body: {
                publicacion_id: pub.id,
                marca: form.marca,
                modelo: form.modelo,
                anio,
                kilometraje,
                descripcion: form.descripcion || "",
              },
            });
          if (aiData?.estado) {
            await supabase.from("publicaciones").update({
              estado_vehiculo: aiData.estado,
              estimacion_danos: aiData.estimacion_danos,
            }).eq("id", pub.id);
          }
        } catch (aiError) {
          console.warn("AI assessment failed, continuing...", aiError);
        }
      }

      toast({ title: "¡Publicación creada!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-2xl py-10">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Publicar Vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca *</Label>
                <SearchableSelect
                  value={form.marca}
                  onChange={(value) => {
                    set("marca", value === "all" ? "" : value);
                    set("modelo", "");
                  }}
                  options={makeOptions}
                  placeholder={loadingMakes ? "Cargando marcas..." : "Seleccionar marca"}
                  searchPlaceholder="Buscar marca..."
                  emptyText={loadingMakes ? "Cargando..." : "Sin marcas"}
                  disabled={loadingMakes}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo *</Label>
                <SearchableSelect
                  value={form.modelo}
                  onChange={(value) => set("modelo", value === "all" ? "" : value)}
                  options={modelOptions}
                  placeholder={!form.marca ? "Elige una marca primero" : "Seleccionar modelo"}
                  searchPlaceholder="Buscar modelo..."
                  emptyText={!form.marca ? "Selecciona marca" : "Sin modelos"}
                  disabled={!form.marca || loadingMakes}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Año *</Label>
                <Input
                  type="number"
                  value={form.anio}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return set("anio", "");
                    const parsed = Math.trunc(Number(value));
                    if (!Number.isFinite(parsed)) return;
                    const clamped = Math.min(currentYear, Math.max(MIN_VEHICLE_YEAR, parsed));
                    set("anio", String(clamped));
                  }}
                  required
                  min={MIN_VEHICLE_YEAR}
                  max={currentYear}
                  placeholder={String(currentYear)}
                />
                <p className="text-xs text-muted-foreground">
                  {isApiYear ? `Validado contra año actual (${currentYear})` : `Usando año local del dispositivo (${currentYear})`}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Precio (USD) *</Label>
                <Input
                  type="number"
                  value={form.precio}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return set("precio", "");
                    const parsed = Number(value);
                    if (!Number.isFinite(parsed)) return;
                    set("precio", String(Math.max(0, parsed)));
                  }}
                  required
                  min={0}
                  step="0.01"
                  placeholder="15000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kilometraje</Label>
                <Input
                  type="number"
                  value={form.kilometraje}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return set("kilometraje", "");
                    const parsed = Math.trunc(Number(value));
                    if (!Number.isFinite(parsed)) return;
                    set("kilometraje", String(Math.max(0, parsed)));
                  }}
                  min={0}
                  step="1"
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <SearchableSelect
                  value={selectedCountry}
                  onChange={(value) => {
                    setSelectedCountry(value === "all" ? "" : value);
                    setSelectedState("");
                  }}
                  options={countryOptions}
                  placeholder="Seleccionar país"
                  searchPlaceholder="Buscar país..."
                  emptyText="Sin países"
                />
              </div>
              <div className="space-y-2">
                <Label>Provincia / Estado</Label>
                <SearchableSelect
                  value={selectedState}
                  onChange={(value) => setSelectedState(value === "all" ? "" : value)}
                  options={stateOptions}
                  placeholder={!selectedCountry ? "Selecciona un país primero" : states.length === 0 ? "Sin provincias" : "Seleccionar provincia"}
                  searchPlaceholder="Buscar provincia/estado..."
                  emptyText="Sin provincias/estados"
                  disabled={!selectedCountry || states.length === 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Combustible</Label>
                <Select value={form.tipo_combustible} onValueChange={v => set("tipo_combustible", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Diésel">Diésel</SelectItem>
                    <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transmisión</Label>
                <Select value={form.transmision} onValueChange={v => set("transmision", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automática">Automática</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={e => set("descripcion", e.target.value)} placeholder="Describe el estado del vehículo, características especiales..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Imágenes</Label>
              <ImageUpload userId={user.id} onImagesUploaded={setImageUrls} />
            </div>

            <Button type="submit" className="w-full rounded-full active:scale-[0.98] transition-transform" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</> : "Publicar Vehículo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateListing;
