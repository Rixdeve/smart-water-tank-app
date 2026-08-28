import { useState, useEffect } from "react";
import { useLiveSensorData } from "../hooks/useLiveSensorData";
import LiveBadge from "../components/LiveBadge";

export default function Dashboard() {
  const { data: d, isLive, liveData } = useLiveSensorData();

  const [pump, setPump] = useState(d.pumpStatus === "ON");
  const [auto, setAuto] = useState(d.pumpAutoMode);

  // Keep the pump toggle in sync with real device state once live data arrives
  useEffect(() => {
    if (liveData) setPump(liveData.pumpStatus === "ON");
  }, [liveData]);

  const pct = d.tankLevelPct * 100;
  const level =
    d.tankLevelPct > 0.6 ? "high" : d.tankLevelPct > 0.3 ? "medium" : "low";

  const levelTheme = {
    high:   { fill: "var(--primary)",           badge: "badge-primary" },
    medium: { fill: "var(--tertiary-container)", badge: "badge-tertiary" },
    low:    { fill: "var(--error)",              badge: "badge-error" },
  }[level];

  return (
    <>
      {/* Hero tank card */}
      <section className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="label-caps">Current Tank Level</div>
            <div className="metric-xl" style={{ color: "var(--primary)", marginTop: 4 }}>{pct.toFixed(0)}%</div>
            <div className="helper-text">{d.currentLiters.toLocaleString()}L of {d.tankCapacityLiters.toLocaleString()}L Available</div>
          </div>
          <span className={`badge ${levelTheme.badge}`}>{d.tankStatus} Level</span>
        </div>

        <div className="tank-visual">
          <div className="tank-lid" />
          <div className="tank-body">
            <div className="tank-fill" style={{ height: `${pct}%`, background: levelTheme.fill }} />
          </div>
          <div className="tank-stand" />
          <div className="tank-stand-base" />
        </div>

        <div className="row">
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--on-surface-variant)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
            <span className="helper-text">{isLive ? "Live now" : "Awaiting device"}</span>
          </div>
          <LiveBadge isLive={isLive} />
        </div>
      </section>

      {/* Pump control */}
      <section className="card">
        <div className="row">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <div className="icon-circle" style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
              <span className="material-symbols-outlined">water_pump</span>
            </div>
            <div>
              <div className="headline-md">Main Pump</div>
              <div className="label-caps" style={{ color: pump ? "var(--primary)" : "var(--outline)" }}>
                {pump ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={pump} onChange={(e) => setPump(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        <div className="row" style={{ marginTop: "var(--space-md)", padding: "var(--space-md)", background: "var(--surface-container-low)", borderRadius: "var(--radius-lg)" }}>
          <div>
            <div className="body-md" style={{ fontWeight: 600 }}>Auto-Mode</div>
            <div className="helper-text">
              {isLive ? "Edge logic runs on ESP32" : "Optimal flow management"}
            </div>
          </div>
          <label className="toggle sm">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>
      </section>

      {/* System health */}
      <section className="card">
        <div className="label-caps" style={{ marginBottom: "var(--space-md)" }}>System Health</div>
        <div className="grid-2">
          <HealthTile icon="router" label="Controller" ok={d.deviceOnline} okText="Online" failText="Offline"/>
          <HealthTile icon="sensors" label="Sensors" ok={d.sensorConnected} okText="Connected" failText="Disconnected"/>
        </div>
      </section>

      {pct < 30 && (
        <section className="alert-banner">
          <div className="icon-circle"><span className="material-symbols-outlined">priority_high</span></div>
          <div>
            <div className="body-md" style={{ fontWeight: 700 }}>Low Water Level Detected</div>
            <div className="helper-text" style={{ color: "inherit", opacity: 0.85 }}>
              Consider turning the pump ON to refill the tank.
            </div>
          </div>
        </section>
      )}

      {/* Bento stats */}
      <div className="grid-2">
        <div className="card card-sm" style={{ display: "flex", flexDirection: "column" }}>
          <div className="label-caps">Daily Usage</div>
          <div className="metric-lg" style={{ color: "var(--secondary)", marginTop: 4 }}>{d.todayUsage}L</div>
          <div className="progress-track" style={{ marginTop: "auto", height: 4 }}>
            <div className="progress-fill" style={{ width: `${Math.min((d.todayUsage / d.weeklyAverage) * 100, 100)}%`, background: "var(--secondary)" }} />
          </div>
        </div>
        <div className="card card-sm" style={{ display: "flex", flexDirection: "column" }}>
          <div className="label-caps">Quality</div>
          <div className="metric-lg" style={{ color: d.waterQuality === "Safe" ? "var(--primary)" : "var(--error)", marginTop: 4 }}>
            {d.waterQuality}
          </div>
          <div className="helper-text">pH {d.phValue} · {d.turbidity} NTU</div>
        </div>
      </div>
    </>
  );
}

function HealthTile({ icon, label, ok, okText }) {
  return (
    <div className="row" style={{ padding: "var(--space-sm)", background: "var(--surface-container-low)", borderRadius: "var(--radius-lg)" }}>
      <span className="material-symbols-outlined" style={{ color: ok ? "var(--primary)" : "var(--error)", fontSize: 20 }}>{icon}</span>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 8, marginRight: "auto" }}>
        <span className="helper-text" style={{ fontWeight: 700, color: "var(--on-surface)" }}>{label}</span>
        <span className="label-caps" style={{ fontSize: 10, color: ok ? "var(--primary)" : "var(--error)" }}>
          {ok ? okText : "Error"}
        </span>
      </div>
    </div>
  );
}
