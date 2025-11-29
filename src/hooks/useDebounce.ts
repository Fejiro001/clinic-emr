import { useEffect, useState } from "react";

const DELAY = 700; // milliseconds
const useDebounce = (query: string) => {
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(query);
    }, DELAY);
    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  return { debouncedValue };
};

export default useDebounce;
