import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("app_users")
        .select("nombre, telefono")
        .eq("id", user.id)
        .single();
      if (data) {
        setNombre(data.nombre || "");
        setTelefono(data.telefono || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("app_users")
      .update({ nombre, telefono })
      .eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil actualizado" });
    }
    setSaving(false);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setChangingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verificación enviada", description: "Revisá tu nuevo email para confirmar el cambio." });
      setEmailDialogOpen(false);
      setNewEmail("");
    }
    setChangingEmail(false);
  };

  if (!user) return null;

  return (
    <div className="container max-w-lg py-10 animate-fade-in">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight flex items-center gap-2">
            <User className="h-6 w-6" /> Mi Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Nombre
                </Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Teléfono
                </Label>
                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <div className="flex gap-2">
                  <Input value={user.email || ""} disabled className="flex-1" />
                  <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="shrink-0 rounded-full">
                        Cambiar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cambiar email</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                          Se enviará un email de verificación a tu nueva dirección.
                        </p>
                        <Input
                          type="email"
                          placeholder="nuevo@email.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <Button
                          onClick={handleChangeEmail}
                          disabled={changingEmail || !newEmail.trim()}
                          className="w-full rounded-full"
                        >
                          {changingEmail ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                          ) : (
                            "Enviar verificación"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-full"
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
