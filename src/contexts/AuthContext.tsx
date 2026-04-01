import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";

type UserType = "Seller" | "Buyer";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userType: UserType | null;
  loading: boolean;
  signUp: (email: string, password: string, type: UserType) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserType = async (userId: string) => {
    const type = await profileService.getUserType(userId);
    if (type) setUserType(type as UserType);
  };

  useEffect(() => {
    const subscription = authService.onAuthStateChange((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserType(session.user.id), 0);
      } else {
        setUserType(null);
      }
      setLoading(false);
    });

    authService.getSession().then(({ session, user }) => {
      setSession(session);
      setUser(user);
      if (user) fetchUserType(user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, type: UserType) => {
    await authService.signUp(email, password);
    const newUser = await authService.getUser();
    if (newUser) {
      await profileService.updateUserType(newUser.id, type);
      setUserType(type);
    }
  };

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, userType, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
