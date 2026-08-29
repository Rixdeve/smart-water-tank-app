import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLiveSensorData } from "../hooks/useLiveSensorData";
import { useHistory } from "../hooks/useHistory";
import LiveBadge from "../components/LiveBadge";
import ErrorState, { LoadingState } from "../components/ErrorState";

export default function Analytics() {
  const { data: d, isLive, error: sensorError, loading: sensorLoading } = useLiveSensorData();
  const { daily, monthly, error: historyError, loading: historyLoading } = useHistory();
  const [range, setRange] = useState("7d");

  if (sensorLoading) return <LoadingState label="Connecting to device…" />;
  if (!d) {
    return (
      <>
        <div className="row">
          <span className="label-caps">Usage Analytics</span>
          <LiveBadge isLive={isLive} />
        </div>
        <ErrorState message={sensorError} />
      </>
    );
  }

  const data = range === "7d" ? daily.slice(-7) : range === "30d" ? daily.slice(-30) : monthly;
  const hasChartData = data.length > 0;

  const total = hasChartData ? data.reduce((s, r) => s + r.liters, 0) : 0;
  const avg = hasChartData ? Math.round(total / data.length) : 0;
  const max = hasChartData ? Math.max(...data.map((r) => r.liters)) : 0;
  const min = hasChartData ? Math.min(...data.map((r) => r.liters)) : 0;
  const trendDown = hasChartData && avg <= d.weeklyAverage;
  const trendPct = hasChartData ? Math.abs(Math.round(((avg - d.weeklyAverage) / d.weeklyAverage) * 100)) : 0;

  const breakdown = [
    { label: "Bathroom",  liters: Math.round(d.todayUsage * 0.31), color: "var(--primary)" },
    { label: "Kitchen",   liters: Math.round(d.todayUsage * 0.25), color: "var(--secondary)" },
    { label: "Laundry",   liters: Math.round(d.todayUsage * 0.21), color: "var(--tertiary)" },
    { label: "Gardening", liters: Math.round(d.todayUsage * 0.23), color: "var(--error)" },
  ];

  return (
    <>
      <div className="row">
        <span className="label-caps">Usage Analytics</span>
        <LiveBadge isLive={isLive} />
      </div>

      <div className="period-tabs">
        {[["7d", "7D"], ["30d", "30D"], ["90d", "90D"]].map(([id, lbl]) => (
          <button key={id} className={`period-tab ${range === id ? "active" : ""}`} onClick={() => setRange(id)}>
            {lbl}
          </button>
        ))}
      </div>

      {historyLoading ? (
        <LoadingState label="Loading usage history…" />
      ) : !hasChartData ? (
        <ErrorState title="No usage history" message={historyError} />
      ) : (
        <>
          <section className="card">
            <div className="row" style={{ marginBottom: "var(--space-lg)" }}>
              <div>
                <div className="label-caps">Total Usage</div>
                <div className="metric-xl" style={{ color: "var(--primary)" }}>
                  {(total / 1000).toFixed(1)}k <span className="headline-md">L</span>
                </div>
              </div>
              <span className={`badge ${trendDown ? "badge-primary" : "badge-error"}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {trendDown ? "trending_down" : "trending_up"}
                </span>
                {trendPct}%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--outline)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--outline)" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--outline-variant)", fontSize: 12 }} cursor={{ fill: "var(--surface-container)" }} />
                <Bar dataKey="liters" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <div className="grid-2">
            <StatTile label="Avg Daily" value={`${avg}L`} icon="check_circle" note="Normal range" color="var(--primary)" />
            <StatTile label="Max Peak" value={`${max}L`} icon="warning" note="Peak day" color="var(--tertiary)" />
            <StatTile label="Min Usage" value={`${min}L`} icon="bedtime" note="Lowest day" color="var(--secondary)" />
            <StatTile label="Today" value={`${d.todayUsage}L`} icon="water_drop" note="Live reading" color="var(--primary)" />
          </div>

          <section className="card" style={{ background: "rgba(0,101,145,0.05)", border: "1px solid rgba(0,101,145,0.1)" }}>
            <div className="row">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                <div className="icon-circle" style={{ background: "var(--surface-container-lowest)", boxShadow: "var(--shadow-card)", color: "var(--primary)" }}>
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <div className="body-md" style={{ fontWeight: 600 }}>Efficiency Status</div>
                  <div className="helper-text">
                    Today is {trendPct}% {trendDown ? "lower" : "higher"} than average
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 28 }}>
                {trendDown ? "arrow_downward" : "arrow_upward"}
              </span>
            </div>
          </section>
        </>
      )}

      <section className="card">
        <div className="label-caps" style={{ marginBottom: "var(--space-md)" }}>Today's Usage Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="row helper-text" style={{ marginBottom: 6 }}>
                <span style={{ color: "var(--on-surface)" }}>{b.label}</span>
                <span style={{ color: "var(--on-surface)", fontWeight: 700 }}>{b.liters}L</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${d.todayUsage ? (b.liters / d.todayUsage) * 100 : 0}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="helper-text" style={{ marginTop: "var(--space-md)" }}>
          Category split is estimated; only total flow is currently measured by hardware.
        </div>
      </section>
    </>
  );
}

function StatTile({ label, value, icon, note, color }) {
  return (
    <div className="card card-sm">
      <div className="label-caps">{label}</div>
      <div className="metric-lg" style={{ marginTop: 4 }}>{value}</div>
      <div className="helper-text" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
        {note}
      </div>
    </div>
  );
}
