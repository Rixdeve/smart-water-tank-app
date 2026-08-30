import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../data/hardcoded";
import { useLiveSensorData } from "../hooks/useLiveSensorData";
import LiveBadge from "../components/LiveBadge";
import ErrorState, { LoadingState } from "../components/ErrorState";

export default function Prediction() {
  const { data: d, isLive, error: sensorError, loading: sensorLoading } = useLiveSensorData();
  const [pred, setPred] = useState(null);
  const [predError, setPredError] = useState(null);
  const [predLoading, setPredLoading] = useState(true);

  useEffect(() => {
    if (d?.tankLevelPct === undefined) return;
    let cancelled = false;

    axios
      .post(`${API}/predict`, {
        day: 101,
        tank_level_pct: d.tankLevelPct,
        tank_capacity_liters: d.tankCapacityLiters,
      })
      .then((r) => {
        if (cancelled) return;
        setPred(r.data);
        setPredError(null);
        setPredLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setPred(null);
        setPredError(err.response ? `Prediction service error (${err.response.status}).` : "Could not reach the prediction service.");
        setPredLoading(false);
      });

    return () => { cancelled = true; };
  }, [d?.tankLevelPct, d?.tankCapacityLiters]);

  if (sensorLoading) return <LoadingState label="Connecting to device…" />;
  if (!d) return <ErrorState message={sensorError} />;

  const vals = d.dailyHistory.map((r) => r.liters);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
  const threshold = mean + 2 * std;
  const leak = d.todayUsage > threshold;

  const trendDown = pred && pred.predicted_liters <= d.weeklyAverage;
  const trendPct = pred ? Math.abs(Math.round(((pred.predicted_liters - d.weeklyAverage) / d.weeklyAverage) * 100)) : 0;

  return (
    <>
      <div className="row">
        <span className="label-caps">AI Predictions</span>
        <LiveBadge isLive={isLive} />
      </div>

      {predLoading ? (
        <LoadingState label="Generating forecast…" />
      ) : predError ? (
        <ErrorState title="Forecast unavailable" message={predError} />
      ) : (
        <section className="hero-gradient">
          <span className="material-symbols-outlined bg-icon">online_prediction</span>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
              <span className="label-caps" style={{ color: "rgba(255,255,255,0.8)" }}>Daily Forecast</span>
            </div>
            <div className="headline-md" style={{ marginBottom: 4 }}>Predicted Tomorrow</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="metric-xl">{pred.predicted_liters}L</span>
              <span className="body-md" style={{ opacity: 0.8 }}>Estimated usage</span>
            </div>
            <div style={{
              marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "var(--radius-full)",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {trendDown ? "trending_down" : "trending_up"}
              </span>
              <span className="helper-text" style={{ color: "#fff" }}>{trendPct}% {trendDown ? "lower" : "higher"} than usual</span>
            </div>
          </div>
        </section>
      )}

      <div className="grid-2">
        <div className="card card-sm" style={{ borderLeft: "4px solid var(--tertiary-container)" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--tertiary)", marginBottom: 8, display: "block" }}>hourglass_empty</span>
          <div className="label-caps">Tank Empty In</div>
          <div className="metric-lg" style={{ color: "var(--tertiary)", marginTop: 4 }}>
            {predLoading || predError ? "-" : pred.days_remaining} <span style={{ fontSize: 16 }}>Days</span>
          </div>
        </div>
        <div className="card card-sm" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", marginBottom: 8, display: "block" }}>
              {leak ? "warning" : "verified"}
            </span>
            <div className="label-caps">Leak Detection</div>
            <div className="body-md" style={{ fontWeight: 600 }}>{leak ? "Possible leak" : "No leaks detected"}</div>
          </div>
          <div className="helper-text" style={{ marginTop: 8 }}>Threshold {threshold.toFixed(0)}L</div>
        </div>
      </div>

      {!predLoading && !predError && (
        <section className="card">
          <div className="row" style={{ marginBottom: "var(--space-md)" }}>
            <div className="icon-circle" style={{ background: "rgba(0,101,145,0.1)", color: "var(--primary)" }}>
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div style={{ marginRight: "auto", marginLeft: "var(--space-sm)" }}>
              <div className="headline-md">Smart Recommendation</div>
              <div className="helper-text">Energy Optimization Plan</div>
            </div>
          </div>
          <p className="body-md" style={{ color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
            {pred.alert ? "High consumption expected! Recommended: fill tank tonight." : pred.recommendation}
          </p>
          <button className="btn-secondary" style={{ marginTop: "var(--space-md)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
            Schedule Automation
          </button>
        </section>
      )}

    </>
  );
}
