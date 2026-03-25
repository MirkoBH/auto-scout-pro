import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Car, Eye, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    if (!user) return;
    const { data } = await supabase.from("publicaciones").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [user]);

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("publicaciones").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Publicación eliminada" });
      fetchListings();
    }
  };

  if (!user) return null;

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
        <Button asChild className="rounded-full">
          <Link to="/publicar"><Plus className="mr-1.5 h-4 w-4" /> Nueva Publicación</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center"><Car className="h-6 w-6 text-primary" /></div>
            <div><p className="text-2xl font-bold">{listings.length}</p><p className="text-sm text-muted-foreground">Publicaciones</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center"><Eye className="h-6 w-6 text-primary" /></div>
            <div><p className="text-2xl font-bold">{listings.filter(l => l.estado_vehiculo).length}</p><p className="text-sm text-muted-foreground">Evaluados por IA</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center"><span className="text-success font-bold text-lg">$</span></div>
            <div><p className="text-2xl font-bold">${listings.reduce((s, l) => s + Number(l.precio), 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Valor total</p></div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
      ) : listings.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-10 text-center text-muted-foreground">Aún no tienes publicaciones. ¡Crea tu primera!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <Card key={l.id} className="border-0 shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{l.marca} {l.modelo} ({l.anio})</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>${Number(l.precio).toLocaleString()}</span>
                    <span>·</span>
                    <span>{l.ubicacion || "Sin ubicación"}</span>
                    {l.puntaje != null && <><span>·</span><span>Puntaje: {l.puntaje}/100</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {l.estado_vehiculo && <Badge>{l.estado_vehiculo}</Badge>}
                  <Button variant="ghost" size="icon" asChild className="rounded-full"><Link to={`/editar/${l.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                  <Button variant="ghost" size="icon" asChild className="rounded-full"><Link to={`/vehiculo/${l.id}`}><Eye className="h-4 w-4" /></Link></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)} className="rounded-full"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
