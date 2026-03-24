import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCarMakes = () => {
  return useQuery({
    queryKey: ["car-makes"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("car-api", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: undefined,
      });
      // The edge function is called via invoke which uses POST by default
      // We need to use a different approach - call via fetch
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/car-api?endpoint=makes`,
        {
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch makes");
      const makes: string[] = await res.json();
      return makes.sort();
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useCarModels = (make: string) => {
  return useQuery({
    queryKey: ["car-models", make],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/car-api?endpoint=models&make=${encodeURIComponent(make)}`,
        {
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch models");
      const models: string[] = await res.json();
      return models.sort();
    },
    enabled: !!make,
    staleTime: 1000 * 60 * 60,
  });
};
