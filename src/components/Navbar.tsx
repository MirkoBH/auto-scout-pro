import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Plus, LayoutDashboard, LogOut, LogIn, UserCircle } from "lucide-react";

const Navbar = () => {
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold tracking-tight text-foreground">AutoMarket</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {userType === "Seller" && (
                <>
                  <Button variant="ghost" size="sm" asChild className="rounded-full">
                    <Link to="/dashboard"><LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard</Link>
                  </Button>
                  <Button size="sm" asChild className="rounded-full">
                    <Link to="/publicar"><Plus className="mr-1.5 h-4 w-4" /> Publicar</Link>
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link to="/perfil"><UserCircle className="mr-1.5 h-4 w-4" /> Perfil</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-full">
                <LogOut className="mr-1.5 h-4 w-4" /> Salir
              </Button>
            </>
          ) : (
            <Button size="sm" asChild className="rounded-full">
              <Link to="/auth"><LogIn className="mr-1.5 h-4 w-4" /> Ingresar</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
