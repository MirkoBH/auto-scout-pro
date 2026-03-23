import { useEffect, useMemo, useState } from "react";

const WORLD_TIME_API = "https://worldtimeapi.org/api/timezone/Etc/UTC";

export const useCurrentYear = () => {
  const [apiYear, setApiYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchYear = async () => {
      try {
        const response = await fetch(WORLD_TIME_API);
        if (!response.ok) throw new Error("No se pudo obtener la fecha actual");

        const payload = (await response.json()) as { datetime?: string };
        if (!payload.datetime) throw new Error("Respuesta de fecha inválida");

        const year = new Date(payload.datetime).getUTCFullYear();
        if (Number.isNaN(year)) throw new Error("Año inválido");

        if (active) setApiYear(year);
      } catch {
        if (active) setApiYear(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchYear();
    return () => {
      active = false;
    };
  }, []);

  const fallbackYear = useMemo(() => new Date().getUTCFullYear(), []);
  return { currentYear: apiYear ?? fallbackYear, isApiYear: apiYear !== null, loadingYear: loading };
};
