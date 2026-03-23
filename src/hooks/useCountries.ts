import { useMemo } from "react";
import countriesData from "@/data/countries.json";

interface State {
  code: string;
  name: string;
  subdivision: string | null;
}

interface Country {
  code2: string;
  code3: string;
  name: string;
  capital: string;
  region: string;
  subregion: string;
  states: State[];
}

const countries = countriesData as Country[];

export function useCountries() {
  const countryList = useMemo(
    () => countries.map((c) => ({ code: c.code2, name: c.name })).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const getStates = (countryCode: string): { code: string; name: string }[] => {
    const country = countries.find((c) => c.code2 === countryCode);
    if (!country) return [];
    return country.states.map((s) => ({ code: s.code, name: s.name })).sort((a, b) => a.name.localeCompare(b.name));
  };

  return { countryList, getStates };
}
