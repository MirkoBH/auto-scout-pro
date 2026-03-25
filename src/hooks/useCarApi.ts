import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCarMakes = () => {
  return useQuery({
    queryKey: ["car-makes"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("car-api", {
        body: { endpoint: "makes" },
      });
      if (error) throw new Error("Failed to fetch makes");
      return (data as string[]).sort();
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useCarModels = (make: string) => {
  return useQuery({
    queryKey: ["car-models", make],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("car-api", {
        body: { endpoint: "models", make },
      });
      if (error) throw new Error("Failed to fetch models");
      return (data as string[]).sort();
    },
    enabled: !!make,
    staleTime: 1000 * 60 * 60,
  });
};
