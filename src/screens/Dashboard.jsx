import { useState, useEffect } from "react";
import { useLiveSensorData } from "../hooks/useLiveSensorData";
import { useAppSettings } from "../hooks/useAppSettings";
import { useAutoMode } from "../hooks/useAutoMode";
import { API } from "../data/hardcoded";
import LiveBadge from "../components/LiveBadge";
import ErrorState, { LoadingState } from "../components/ErrorState";

const OVERFLOW_RISK_PCT = 95;

export default function Dashboard() {
  const { data: d, isLive, error, loading } = useLiveSensorData();
  const { lowWaterThreshold, notifications } = useAppSettings();
  const cloudAutoMode = useAutoMode();

  const [pump, setPump] = useState(false);
  const [auto, setAuto] = useState(false);
  const [pumpBusy, setPumpBusy] = useState(false);
  const [autoBusy, setAutoBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    if (d) setPump(d.pumpStatus === "ON");
  }, [d]);

  useEffect(() => {
    if (cloudAutoMode !== null) setAuto(cloudAutoMode);
  }, [cloudAutoMode]);

  const togglePump = async (checked) => {
    setPump(checked);
    setPumpBusy(true);
    setActionMsg(null);
    try {
      const res = await fetch(`${API}/pump-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pump_on: checked }),
      });
      if (!res.ok) throw new Error();
      setActionMsg({
        type: "info",
        text: "Command sent.",
      });
    } catch {
      setActionMsg({ type: "error", text: "Could not reach the device. Check your connection." });
      setPump(!checked);
    } finally {
      setPumpBusy(false);
    }
  };

  const toggleAutoMode = async (checked) => {
    setAuto(checked);
    setAutoBusy(true);
    setActionMsg(null);
    try {
      const res = await fetch(`${API}/auto-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_mode: checked }),
      });
      if (!res.ok) throw new Error();
      setActionMsg({
        type: "info",
        text: checked
          ? "Auto mode enabled - device will fill/stop automatically based on level."
          : "Auto mode disabled - device will only respond to manual pump commands.",
      });
    } catch {
      setActionMsg({ type: "error", text: "Could not reach the device. Check your connection." });
      setAuto(!checked);
    } finally {
      setAutoBusy(false);
    }
  };

  if (loading) return <LoadingState label="Connecting to device…" />;
  if (!d) {
    return (
      <>
        <div className="row">
          <span className="label-caps">Dashboard</span>
          <LiveBadge isLive={isLive} />
        </div>
        <ErrorState message={error} />
      </>
    );
  }

  const pct = d.tankLevelPct * 100;
  const outflowActive = d.todayUsage > 0;
  const level =
    d.tankLevelPct > 0.6 ? "high" : d.tankLevelPct > 0.3 ? "medium" : "low";

  const levelTheme = {
    high:   { fill: "var(--primary)",           badge: "badge-primary" },
    medium: { fill: "var(--tertiary-container)", badge: "badge-tertiary" },
    low:    { fill: "var(--error)",              badge: "badge-error" },
  }[level];

  return (
    <>
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
          <div className="tank-stack">
            <div className="tank-lid" />
            <div className="tank-body">
              <div className="tank-fill" style={{ height: `${pct}%`, background: levelTheme.fill }} />
            </div>
            <div className="tank-stand" />
            <div className="tank-stand-base" />
          </div>

          <div className="pipe-stack">
            <div className="pipe-group">
              <div className="pipe-row">
                <span className={`material-symbols-outlined pipe-arrow-icon ${pump ? "active" : ""}`}>arrow_back</span>
                <div className={`pipe pipe-in ${pump ? "active" : ""}`} />
              </div>
              <span className={`pipe-label ${pump ? "active" : ""}`}>Inflow</span>
            </div>
            <div className="pipe-group">
              <div className="pipe-row">
                <div className={`pipe pipe-out ${outflowActive ? "active" : ""}`} />
                <span className={`material-symbols-outlined pipe-arrow-icon ${outflowActive ? "active" : ""}`}>arrow_forward</span>
              </div>
              <span className={`pipe-label ${outflowActive ? "active" : ""}`}>Outflow</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--on-surface-variant)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
            <span className="helper-text">Live now</span>
          </div>
          <LiveBadge isLive={isLive} />
        </div>
      </section>

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
            <input type="checkbox" checked={pump} disabled={pumpBusy} onChange={(e) => togglePump(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        <div className="row" style={{ marginTop: "var(--space-md)", padding: "var(--space-md)", background: "var(--surface-container-low)", borderRadius: "var(--radius-lg)" }}>
          <div>
            <div className="body-md" style={{ fontWeight: 600 }}>Auto-Mode</div>
            <div className="helper-text">
              {auto ? "Fills automatically when low, stops when full" : "Off - pump only responds to manual control"}
            </div>
          </div>
          <label className="toggle sm">
            <input type="checkbox" checked={auto} disabled={autoBusy} onChange={(e) => toggleAutoMode(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        {actionMsg && (
          <div className={`status-banner ${actionMsg.type}`} style={{ marginTop: "var(--space-md)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {actionMsg.type === "error" ? "error" : "info"}
            </span>
            <span>{actionMsg.text}</span>
          </div>
        )}

        <p className="helper-text" style={{ marginTop: "var(--space-md)", fontStyle: "italic" }}>
          An unsafe water-quality reading or an active dry-run fault always overrides manual control - this cannot be disabled, in either mode.
        </p>
      </section>

      <section className="card">
        <div className="label-caps" style={{ marginBottom: "var(--space-md)" }}>System Health</div>
        <div className="grid-2">
          <HealthTile icon="router" label="Controller" ok={d.deviceOnline} okText="Online" failText="Offline"/>
          <HealthTile icon="sensors" label="Sensors" ok={d.sensorConnected} okText="Connected" failText="Disconnected"/>
        </div>
      </section>

      {pct < lowWaterThreshold && notifications.tankLow && (
        <section className="alert-banner">
          <div className="icon-circle"><span className="material-symbols-outlined">priority_high</span></div>
          <div>
            <div className="body-md" style={{ fontWeight: 700 }}>Low Water Level Detected</div>
            <div className="helper-text" style={{ color: "inherit", opacity: 0.85 }}>
              Below the {lowWaterThreshold}% threshold set in Settings - consider turning the pump ON to refill the tank.
            </div>
          </div>
        </section>
      )}

      {pct >= OVERFLOW_RISK_PCT && notifications.overflowRisk && (
        <section className="alert-banner">
          <div className="icon-circle"><span className="material-symbols-outlined">waves</span></div>
          <div>
            <div className="body-md" style={{ fontWeight: 700 }}>Overflow Risk</div>
            <div className="helper-text" style={{ color: "inherit", opacity: 0.85 }}>
              Tank is at {pct.toFixed(0)}% capacity. Consider turning the pump OFF.
            </div>
          </div>
        </section>
      )}

      {auto && !pump && pct < lowWaterThreshold && notifications.pumpFailure && (
        <section className="alert-banner">
          <div className="icon-circle"><span className="material-symbols-outlined">build</span></div>
          <div>
            <div className="body-md" style={{ fontWeight: 700 }}>Pump Failure</div>
            <div className="helper-text" style={{ color: "inherit", opacity: 0.85 }}>
              Auto-mode is on and the tank is low, but the pump isn't running. Check that it's responding.
            </div>
          </div>
        </section>
      )}

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
