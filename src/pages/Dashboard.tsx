import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Car, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        <h1 className="font-display text-3xl font-bold">Mi Dashboard</h1>
        <Button asChild><Link to="/publicar"><Plus className="mr-1 h-4 w-4" /> Nueva Publicación</Link></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Car className="h-10 w-10 text-primary" />
            <div>
              <p className="text-2xl font-bold">{listings.length}</p>
              <p className="text-sm text-muted-foreground">Publicaciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Eye className="h-10 w-10 text-primary" />
            <div>
              <p className="text-2xl font-bold">{listings.filter(l => l.estado_vehiculo).length}</p>
              <p className="text-sm text-muted-foreground">Evaluados por IA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold">$</div>
            <div>
              <p className="text-2xl font-bold">${listings.reduce((s, l) => s + Number(l.precio), 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Valor total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings table */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : listings.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Aún no tienes publicaciones. ¡Crea tu primera!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <Card key={l.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">{l.marca} {l.modelo} ({l.anio})</h3>
                  <p className="text-sm text-muted-foreground">${Number(l.precio).toLocaleString()} · {l.ubicacion || "Sin ubicación"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {l.estado_vehiculo && <Badge>{l.estado_vehiculo}</Badge>}
                  <Button variant="ghost" size="icon" asChild><Link to={`/vehiculo/${l.id}`}><Eye className="h-4 w-4" /></Link></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
