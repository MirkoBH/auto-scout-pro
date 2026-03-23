import { useEffect, useMemo, useState } from "react";

interface CarMakeResponseItem {
  make: string;
  model: string;
}

const API_URL = "https://api.api-ninjas.com/v1/carmakes";
const DEFAULT_LIMIT = 50;

export const useCarMakes = () => {
  const [rows, setRows] = useState<CarMakeResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchMakes = async () => {
      const apiKey = import.meta.env.VITE_API_NINJAS_KEY as string | undefined;

      if (!apiKey) {
        if (active) {
          setError("Falta VITE_API_NINJAS_KEY para cargar marcas/modelos.");
          setLoading(false);
        }
        return;
      }

      try {
        const requests = Array.from({ length: 6 }, (_, i) => i);
        const pages = await Promise.all(
          requests.map(async (offset) => {
            const response = await fetch(`${API_URL}?limit=${DEFAULT_LIMIT}&offset=${offset * DEFAULT_LIMIT}`, {
              headers: { "X-Api-Key": apiKey },
            });

            if (!response.ok) throw new Error("No se pudieron cargar marcas/modelos");
            return (await response.json()) as CarMakeResponseItem[];
          }),
        );

        const flattened = pages.flat();
        if (active) setRows(flattened);
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Error cargando marcas/modelos");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMakes();

    return () => {
      active = false;
    };
  }, []);

  const makes = useMemo(() => [...new Set(rows.map((r) => r.make).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [rows]);

  const modelsByMake = useMemo(() => {
    const map = new Map<string, string[]>();

    rows.forEach(({ make, model }) => {
      if (!make || !model) return;
      const existing = map.get(make) ?? [];
      if (!existing.includes(model)) existing.push(model);
      map.set(make, existing);
    });

    map.forEach((arr, key) => map.set(key, arr.sort((a, b) => a.localeCompare(b))));
    return map;
  }, [rows]);

  return { makes, modelsByMake, loadingMakes: loading, makesError: error };
};
