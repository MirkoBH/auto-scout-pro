import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services";
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
    (async () => {
      try {
        const profile = await profileService.get(user.id);
        setNombre(profile.nombre || "");
        setTelefono(profile.telefono || "");
      } catch {
        // silent
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profileService.update(user.id, { nombre, telefono });
      toast({ title: "Perfil actualizado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setChangingEmail(true);
    try {
      await profileService.changeEmail(newEmail.trim());
      toast({ title: "Verificación enviada", description: "Revisá tu nuevo email para confirmar el cambio." });
      setEmailDialogOpen(false);
      setNewEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
                <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Nombre</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Teléfono</Label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 11 1234-5678" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                <div className="flex gap-2">
                  <Input value={user.email || ""} disabled className="flex-1" />
                  <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="shrink-0 rounded-full">Cambiar</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Cambiar email</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">Se enviará un email de verificación a tu nueva dirección.</p>
                        <Input type="email" placeholder="nuevo@email.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                        <Button onClick={handleChangeEmail} disabled={changingEmail || !newEmail.trim()} className="w-full rounded-full">
                          {changingEmail ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : "Enviar verificación"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full rounded-full">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
