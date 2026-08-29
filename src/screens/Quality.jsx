import { useLiveSensorData } from "../hooks/useLiveSensorData";
import { useAppSettings } from "../hooks/useAppSettings";
import LiveBadge from "../components/LiveBadge";
import ErrorState, { LoadingState } from "../components/ErrorState";

const TURBIDITY_LIMIT = 4;

export default function Quality() {
  const { data: d, isLive, error, loading } = useLiveSensorData();
  const { phThreshold, notifications } = useAppSettings();

  if (loading) return <LoadingState label="Connecting to device…" />;
  if (!d) {
    return (
      <>
        <div className="row">
          <span className="label-caps">Water Quality</span>
          <LiveBadge isLive={isLive} />
        </div>
        <ErrorState message={error} />
      </>
    );
  }

  const phSafe = d.phValue >= phThreshold.min && d.phValue <= phThreshold.max;
  const turbSafe = d.turbidity <= TURBIDITY_LIMIT;
  const overallSafe = phSafe && turbSafe;
  const showAlert = !overallSafe && notifications.poorWaterQuality;

  const phMarkerPct = Math.min(Math.max((d.phValue / 14) * 100, 0), 100);
  const turbFillPct = Math.min((d.turbidity / 10) * 100, 100);
  const safeZoneLeft = Math.max((phThreshold.min / 14) * 100, 0);
  const safeZoneWidth = Math.max(((phThreshold.max - phThreshold.min) / 14) * 100, 0);

  return (
    <>
      <div className="row">
        <span className="label-caps">Water Quality</span>
        <LiveBadge isLive={isLive} />
      </div>

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
          <div className="gauge-safe-zone" style={{ left: `${safeZoneLeft}%`, width: `${safeZoneWidth}%` }} />
          <div className="gauge-marker" style={{ left: `${phMarkerPct}%` }} />
        </div>
        <div className="gauge-labels helper-text">
          <span>0</span>
          <span style={{ color: "var(--primary)", fontWeight: 700 }}>{phThreshold.min} - {phThreshold.max} Safe</span>
          <span>14</span>
        </div>
      </section>

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
            <div className="label-caps" style={{ color: "var(--primary)" }}>Limit &lt; {TURBIDITY_LIMIT}.0</div>
            <div className="helper-text">{turbSafe ? "Optimal clarity" : "Cloudy"}</div>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${turbFillPct}%`, background: turbSafe ? "var(--primary)" : "var(--error)" }} />
        </div>
      </section>

      {showAlert ? (
        <section className="alert-banner">
          <div className="icon-circle"><span className="material-symbols-outlined">warning</span></div>
          <div>
            <div className="body-md" style={{ fontWeight: 700 }}>Quality Alerts</div>
            {!phSafe && <div className="helper-text" style={{ color: "inherit", opacity: 0.9 }}>pH out of safe range ({d.phValue})</div>}
            {!turbSafe && <div className="helper-text" style={{ color: "inherit", opacity: 0.9 }}>Turbidity too high ({d.turbidity} NTU)</div>}
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.4 }}>verified_user</span>
          <p className="body-md" style={{ color: "var(--outline)" }}>
            {overallSafe
              ? "No active quality alerts found."
              : "Poor water quality alerts are turned off in Settings."}
          </p>
        </div>
      )}
    </>
  );
}
