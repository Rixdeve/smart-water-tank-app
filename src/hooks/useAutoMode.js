import { useEffect, useState } from "react";
import { API } from "../data/hardcoded";

export function useAutoMode() {
  const [autoMode, setAutoMode] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${API}/auto-mode`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.auto_mode === "boolean") setAutoMode(data.auto_mode);
      } catch {
        return;
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return autoMode;
}
