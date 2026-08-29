import { useEffect, useState } from "react";
import { fetchHistory } from "../data/hardcoded";

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

export function useHistory() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const result = await fetchHistory(500);
      if (cancelled) return;
      if (result.ok) {
        setRows(result.rows);
        setError(null);
      } else {
        setRows([]);
        setError(result.error);
      }
      setLoading(false);
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { daily: groupByDay(rows), monthly: groupByMonth(rows), isLive: rows.length > 0, error, loading };
}
