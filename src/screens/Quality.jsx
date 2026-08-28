import { useLiveSensorData } from "../hooks/useLiveSensorData";
import LiveBadge from "../components/LiveBadge";

export default function Quality() {
  const { data: d, isLive } = useLiveSensorData();
  const phSafe = d.phValue >= 6.5 && d.phValue <= 8.5;
  const turbSafe = d.turbidity <= 4;
  const overallSafe = phSafe && turbSafe;

  const phMarkerPct = Math.min(Math.max((d.phValue / 14) * 100, 0), 100);
  const turbFillPct = Math.min((d.turbidity / 10) * 100, 100);

  return (
    <>
      <div className="row">
        <span className="label-caps">Water Quality</span>
        <LiveBadge isLive={isLive} />
      </div>

      {/* Status banner */}
      <section
        className="card"
        style={{
          textAlign: "center", color: "#fff",
          background: overallSafe ? "var(--primary)" : "var(--error)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="pulse" style={{
          display: "inline-flex", background: "rgba(255,255,255,0.2)", padding: 10,
          borderRadius: "var(--radius-full)", marginBottom: 8,
        }}>
          <span className="material-symbols-outlined icon-fill" style={{ fontSize: 30 }}>
            {overallSafe ? "check_circle" : "warning"}
          </span>
        </div>
        <div className="label-caps" style={{ color: "rgba(255,255,255,0.8)" }}>System Status</div>
        <div className="metric-lg" style={{ marginTop: 4 }}>Status: {overallSafe ? "SAFE" : "UNSAFE"}</div>
        <p className="helper-text" style={{ color: "rgba(255,255,255,0.9)", marginTop: 8, maxWidth: 280, marginInline: "auto" }}>
          All parameters are {overallSafe ? "within" : "outside"} health organization standards for residential use.
        </p>
      </section>

      {/* pH gauge */}
      <section className="card">
        <div className="row" style={{ marginBottom: "var(--space-md)" }}>
          <div>
            <div className="label-caps">pH Level</div>
            <div className="metric-lg" style={{ marginTop: 4 }}>
              {d.phValue} <span className="body-md" style={{ color: "var(--outline)" }}>pH</span>
            </div>
          </div>
          <span className={`badge ${phSafe ? "badge-secondary" : "badge-error"}`}>{phSafe ? "Neutral" : "Abnormal"}</span>
        </div>
        <div className="gauge-track">
          <div className="gauge-safe-zone" style={{ left: "46.4%", width: "14.3%" }} />
          <div className="gauge-marker" style={{ left: `${phMarkerPct}%` }} />
        </div>
        <div className="gauge-labels helper-text">
          <span>0</span>
          <span style={{ color: "var(--primary)", fontWeight: 700 }}>6.5 - 8.5 Safe</span>
          <span>14</span>
        </div>
      </section>

      {/* Turbidity */}
      <section className="card">
        <div className="row" style={{ marginBottom: "var(--space-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <div className="icon-circle" style={{ background: "var(--surface-container-high)" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>water_drop</span>
            </div>
            <div>
              <div className="label-caps">Turbidity</div>
              <div className="metric-lg">
                {d.turbidity} <span className="body-md" style={{ color: "var(--outline)" }}>NTU</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="label-caps" style={{ color: "var(--primary)" }}>Limit &lt; 4.0</div>
            <div className="helper-text">{turbSafe ? "Optimal clarity" : "Cloudy"}</div>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${turbFillPct}%`, background: turbSafe ? "var(--primary)" : "var(--error)" }} />
        </div>
      </section>

      {overallSafe ? (
        <div className="empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.4 }}>verified_user</span>
          <p className="body-md" style={{ color: "var(--outline)" }}>No active quality alerts found.</p>
        </div>
      ) : (
        <section className="alert-banner">
          <div className="icon-circle"><span className="material-symbols-outlined">warning</span></div>
          <div>
            <div className="body-md" style={{ fontWeight: 700 }}>Quality Alerts</div>
            {!phSafe && <div className="helper-text" style={{ color: "inherit", opacity: 0.9 }}>pH out of safe range ({d.phValue})</div>}
            {!turbSafe && <div className="helper-text" style={{ color: "inherit", opacity: 0.9 }}>Turbidity too high ({d.turbidity} NTU)</div>}
          </div>
        </section>
      )}
    </>
  );
}
