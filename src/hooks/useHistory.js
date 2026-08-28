import { useEffect, useState } from "react";
import { fetchHistory } from "../data/hardcoded";

// The ESP32 uploads a reading every 5 seconds, but Analytics wants one
// total-per-day figure. total_litres is a running counter, so the day's
// usage is the max value seen that day.
function groupByDay(rows) {
  const byDay = {};
  rows.forEach((r) => {
    const day = new Date(r.timestamp).toISOString().slice(0, 10);
    byDay[day] = Math.max(byDay[day] || 0, r.total_litres || 0);
  });
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, liters]) => ({
      label: new Date(day).toLocaleDateString(undefined, { weekday: "short" }),
      liters: Math.round(liters),
    }));
}

function groupByMonth(rows) {
  const byMonth = {};
  rows.forEach((r) => {
    const key = new Date(r.timestamp).toLocaleDateString(undefined, { month: "short" });
    byMonth[key] = Math.max(byMonth[key] || 0, r.total_litres || 0);
  });
  return Object.entries(byMonth).map(([label, liters]) => ({ label, liters: Math.round(liters) }));
}

// Polls the backend/database for historical readings and groups them into
// daily/monthly totals for the Analytics charts. isLive is true only once
// real rows have come back, so the caller can fall back to sample data.
export function useHistory() {
  const [rows, setRows] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const data = await fetchHistory(500);
      if (cancelled) return;
      if (data.length > 0) {
        setRows(data);
        setIsLive(true);
      } else {
        setIsLive(false);
      }
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { daily: groupByDay(rows), monthly: groupByMonth(rows), isLive };
}
