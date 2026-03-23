import { useState } from "react";
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

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { countryList, getStates } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const states = getStates(selectedCountry);

  const [form, setForm] = useState({
    marca: "", modelo: "", anio: "", kilometraje: "", tipo_combustible: "", transmision: "", precio: "", ubicacion: "", descripcion: "",
  });

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data: pub, error: pubError } = await supabase.from("publicaciones").insert({
        marca: form.marca,
        modelo: form.modelo,
        anio: Number(form.anio),
        kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
        tipo_combustible: form.tipo_combustible || null,
        transmision: form.transmision || null,
        precio: Number(form.precio),
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
        await supabase.from("imagenes_publicacion").insert({
          publicacion_id: String(pub.id),
          imagen_ids: imageUrls,
        });
      }

      if (pub) {
        try {
          const { data: aiData } = await supabase.functions.invoke("assess-vehicle", {
            body: {
              publicacion_id: pub.id,
              marca: form.marca,
              modelo: form.modelo,
              anio: Number(form.anio),
              kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
              descripcion: form.descripcion || "",
            },
          });
          if (aiData?.estado) {
            await supabase.from("publicaciones").update({
              estado_vehiculo: aiData.estado,
              estimacion_danos: aiData.estimacion_danos,
            }).eq("id", pub.id);
          }
        } catch {
          console.warn("AI assessment failed, continuing...");
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
                <Input value={form.marca} onChange={e => set("marca", e.target.value)} required placeholder="Toyota" />
              </div>
              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input value={form.modelo} onChange={e => set("modelo", e.target.value)} required placeholder="Corolla" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Año *</Label>
                <Input type="number" value={form.anio} onChange={e => set("anio", e.target.value)} required min={1886} placeholder="2020" />
              </div>
              <div className="space-y-2">
                <Label>Precio (USD) *</Label>
                <Input type="number" value={form.precio} onChange={e => set("precio", e.target.value)} required min={0} placeholder="15000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kilometraje</Label>
                <Input type="number" value={form.kilometraje} onChange={e => set("kilometraje", e.target.value)} min={0} placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input value={form.ubicacion} onChange={e => set("ubicacion", e.target.value)} placeholder="Ciudad de México" />
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
