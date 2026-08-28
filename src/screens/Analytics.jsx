import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLiveSensorData } from "../hooks/useLiveSensorData";
import { useHistory } from "../hooks/useHistory";
import LiveBadge from "../components/LiveBadge";

const MONTHLY_FALLBACK = [
  { label: "Jan", liters: 14200 },
  { label: "Feb", liters: 12800 },
  { label: "Mar", liters: 15600 },
  { label: "Apr", liters: 9400 },
];

export default function Analytics() {
  const { data: d, isLive } = useLiveSensorData();
  const { daily: dailyFromDb, monthly: monthlyFromDb, isLive: hasHistory } = useHistory();
  const [range, setRange] = useState("7d");

  const weekly7 = hasHistory && dailyFromDb.length > 0
    ? dailyFromDb.slice(-7)
    : d.dailyHistory.map((r) => ({ label: r.day, liters: r.liters }));

  const weekly30 = hasHistory && dailyFromDb.length > 0
    ? dailyFromDb.slice(-30)
    : [...weekly7, { label: "W2", liters: 3200 }, { label: "W3", liters: 2900 }, { label: "W4", liters: 3400 }];

  const monthly = hasHistory && monthlyFromDb.length > 0 ? monthlyFromDb : MONTHLY_FALLBACK;

  const data = range === "7d" ? weekly7 : range === "30d" ? weekly30 : monthly;
  const total = data.reduce((s, r) => s + r.liters, 0);
  const avg = Math.round(total / data.length);
  const max = Math.max(...data.map((r) => r.liters));
  const min = Math.min(...data.map((r) => r.liters));
  const trendDown = avg <= d.weeklyAverage;
  const trendPct = Math.abs(Math.round(((avg - d.weeklyAverage) / d.weeklyAverage) * 100));

  // Only total flow is measured by hardware, so the per-category split is
  // an estimated proportion of today's real usage rather than its own reading.
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
        <div className="helper-text" style={{ marginTop: "var(--space-sm)" }}>
          {hasHistory ? "From device history" : "Sample data — waiting for device history"}
        </div>
      </section>

      <div className="grid-2">
        <StatTile label="Avg Daily" value={`${avg}L`} icon="check_circle" note="Normal range" color="var(--primary)" />
        <StatTile label="Max Peak" value={`${max}L`} icon="warning" note="Peak day" color="var(--tertiary)" />
        <StatTile label="Min Usage" value={`${min}L`} icon="bedtime" note="Lowest day" color="var(--secondary)" />
        <StatTile label="Today" value={`${d.todayUsage}L`} icon="water_drop" note={isLive ? "Live reading" : "Sample reading"} color="var(--primary)" />
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
        {isLive && (
          <div className="helper-text" style={{ marginTop: "var(--space-md)" }}>
            Category split is estimated; only total flow is currently measured by hardware.
          </div>
        )}
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
