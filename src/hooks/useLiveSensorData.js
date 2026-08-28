import { useEffect, useState } from "react";
import { SENSOR_DATA, fetchLiveSensorData } from "../data/hardcoded";

// Polls the ESP32 backend and merges live readings over the hardcoded
// fallback, so every screen behaves exactly as it did with pure SENSOR_DATA
// whenever the device is unreachable.
export function useLiveSensorData() {
  const [liveData, setLiveData] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const live = await fetchLiveSensorData();
      if (cancelled) return;
      if (live) {
        setLiveData(live);
        setIsLive(true);
      } else {
        setIsLive(false);
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const data = { ...SENSOR_DATA, ...(liveData || {}) };
  return { data, isLive, liveData };
}
