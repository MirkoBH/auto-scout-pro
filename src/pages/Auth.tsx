import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Car, UserCheck, ShoppingCart } from "lucide-react";

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regType, setRegType] = useState<"Buyer" | "Seller">("Buyer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast({ title: "¡Bienvenido!" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(regEmail, regPassword, regType);
      toast({ title: "Cuenta creada", description: "Revisa tu email para confirmar tu cuenta." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">AutoMarket</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-full p-1">
            <TabsTrigger value="login" className="rounded-full">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register" className="rounded-full">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full rounded-full active:scale-[0.98] transition-transform" disabled={loading}>
                    {loading ? "Cargando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>Elige tu tipo de cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <Input id="reg-password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de cuenta</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRegType("Buyer")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                          regType === "Buyer" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <ShoppingCart className={`h-6 w-6 ${regType === "Buyer" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${regType === "Buyer" ? "text-primary" : "text-muted-foreground"}`}>Comprador</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegType("Seller")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                          regType === "Seller" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <UserCheck className={`h-6 w-6 ${regType === "Seller" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${regType === "Seller" ? "text-primary" : "text-muted-foreground"}`}>Vendedor</span>
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-full active:scale-[0.98] transition-transform" disabled={loading}>
                    {loading ? "Cargando..." : "Crear Cuenta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
