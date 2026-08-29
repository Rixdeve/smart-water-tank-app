import { useEffect, useState } from "react";
import { SENSOR_DATA, fetchLiveSensorData } from "../data/hardcoded";

export function useLiveSensorData() {
  const [liveData, setLiveData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const result = await fetchLiveSensorData();
      if (cancelled) return;
      if (result.ok) {
        setLiveData(result.data);
        setError(null);
      } else {
        setLiveData(null);
        setError(result.error);
      }
      setLoading(false);
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const data = liveData ? { ...SENSOR_DATA, ...liveData } : null;
  return { data, isLive: !!liveData, error, loading };
}
