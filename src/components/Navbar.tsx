import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Plus, LayoutDashboard, LogOut, LogIn } from "lucide-react";

const Navbar = () => {
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-7 w-7 text-primary" />
          <span className="text-xl font-display font-bold text-foreground">AutoMarket</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {userType === "Seller" && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard"><LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/publicar"><Plus className="mr-1 h-4 w-4" /> Publicar</Link>
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1 h-4 w-4" /> Salir
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth"><LogIn className="mr-1 h-4 w-4" /> Ingresar</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
