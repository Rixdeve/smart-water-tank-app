import { useState } from "react";
import { USER_SETTINGS, API } from "../data/hardcoded";
import { useAppSettings, saveAppSettings } from "../hooks/useAppSettings";

const notifItems = [
  { key: "tankFull",         label: "Tank Full",          desc: "Notify when tank reaches capacity", icon: "water_full" },
  { key: "tankLow",          label: "Tank Low",           desc: "Notify when tank hits threshold",    icon: "water_drop" },
  { key: "overflowRisk",     label: "Overflow Risk",      desc: "Warn before the tank overflows",     icon: "waves" },
  { key: "pumpFailure",      label: "Pump Failure",       desc: "Alert if pump stops responding",     icon: "build" },
  { key: "poorWaterQuality", label: "Poor Water Quality", desc: "Alert when pH is out of range",      icon: "block" },
];

export default function Settings({ onNavigate }) {
  const appSettings = useAppSettings();

  const [capacity, setCapacity]   = useState(USER_SETTINGS.tankCapacity);
  const [lowThresh, setLowThresh] = useState(appSettings.lowWaterThreshold);
  const [phMin, setPhMin]         = useState(appSettings.phThreshold.min);
  const [phMax, setPhMax]         = useState(appSettings.phThreshold.max);
  const [notif, setNotif]         = useState(appSettings.notifications);
  const [saved, setSaved]         = useState(false);

  const [deviceIp, setDeviceIp]       = useState(() => localStorage.getItem("deviceIp") || "");
  const [calibStatus, setCalibStatus] = useState(null);
  const [calibrating, setCalibrating] = useState(false);

  const toggle = (k) => setNotif((p) => ({ ...p, [k]: !p[k] }));

  const save = async (e) => {
    e.preventDefault();
    await fetch(`${API}/device-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tank_capacity_liters: Number(capacity) }),
    }).catch(() => {});

    saveAppSettings({
      lowWaterThreshold: lowThresh,
      phThreshold: { min: Number(phMin), max: Number(phMax) },
      notifications: notif,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateDeviceIp = (v) => {
    setDeviceIp(v);
    localStorage.setItem("deviceIp", v);
  };

  const callDevice = async (path, successText) => {
    if (!deviceIp) {
      setCalibStatus({ type: "error", text: "Enter the device IP address first." });
      return;
    }
    setCalibrating(true);
    setCalibStatus({ type: "info", text: "Talking to device…" });
    try {
      const res = await fetch(`http://${deviceIp}:81${path}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Device responded with ${res.status}`);
      }
      setCalibStatus({ type: "success", text: successText(data) });
    } catch (err) {
      setCalibStatus({
        type: "error",
        text: err.message?.includes("Failed to fetch")
          ? `Could not reach the device at ${deviceIp}. Make sure it's on the same network.`
          : err.message,
      });
    } finally {
      setCalibrating(false);
    }
  };

  const calibrateEmpty = () => callDevice("/calibrate-empty", (d) => `Empty calibrated at ${d.empty_distance_cm ?? "-"} cm`);
  const calibrateFull  = () => callDevice("/calibrate-full", (d) => `Full calibrated at ${d.full_distance_cm ?? "-"} cm`);

  return (
    <>
      <section>
        <div className="headline-md">Settings</div>
        <p className="helper-text" style={{ marginTop: 2 }}>Configure your tank monitoring parameters</p>
      </section>

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <section className="card">
          <div className="row" style={{ marginBottom: "var(--space-md)", justifyContent: "flex-start", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>settings_input_component</span>
            <span className="label-caps" style={{ color: "var(--primary)" }}>Tank Parameters</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div className="field">
              <label>Tank Capacity (Liters)</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
              <p className="helper-text" style={{ marginTop: 4 }}>
                Sent to the cloud on save The device syncs this automatically, no direct connection needed.
              </p>
            </div>

            <div className="field">
              <label>Low Level Threshold (%)</label>
              <input type="range" min={5} max={40} value={lowThresh} onChange={(e) => setLowThresh(Number(e.target.value))} />
              <div className="range-labels helper-text">
                <span>5%</span>
                <span style={{ color: "var(--primary)", fontWeight: 700 }}>{lowThresh}%</span>
                <span>40%</span>
              </div>
            </div>

            <div className="field">
              <label>Target pH Range</label>
              <div className="ph-range-row">
                <input type="text" value={phMin} onChange={(e) => setPhMin(e.target.value)} placeholder="Min" />
                <span style={{ color: "var(--outline-variant)" }}>-</span>
                <input type="text" value={phMax} onChange={(e) => setPhMax(e.target.value)} placeholder="Max" />
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <button
            type="button" className="row"
            onClick={() => onNavigate("deviceSetup")}
            style={{ width: "100%", border: "none", background: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
              <div className="icon-circle" style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)", width: 36, height: 36 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>wifi</span>
              </div>
              <div>
                <div className="body-md" style={{ fontWeight: 600 }}>Device Wi-Fi Setup</div>
                <div className="helper-text">Connect or reconnect the ESP32 to your network</div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ color: "var(--outline)" }}>chevron_right</span>
          </button>
        </section>

        <section className="card">
          <div className="row" style={{ marginBottom: "var(--space-md)", justifyContent: "flex-start", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>straighten</span>
            <span className="label-caps" style={{ color: "var(--primary)" }}>Tank Calibration</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div className="field">
              <label>Device IP Address</label>
              <input
                type="text" placeholder="e.g. 192.168.1.42"
                value={deviceIp} onChange={(e) => updateDeviceIp(e.target.value)}
              />
              <p className="helper-text" style={{ marginTop: 4 }}>
                Needed only for the two live calibration actions below - must be on the same Wi-Fi as the device.
              </p>
            </div>

            <p className="helper-text">Step 1: Empty the tank completely, then calibrate.</p>
            <button type="button" className="btn-secondary" onClick={calibrateEmpty} disabled={calibrating}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>water_drop</span>
              Calibrate Empty
            </button>

            <p className="helper-text">Step 2: Fill the tank completely, then calibrate.</p>
            <button type="button" className="btn-secondary" onClick={calibrateFull} disabled={calibrating}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>water_full</span>
              Calibrate Full
            </button>

            {calibStatus && (
              <div className={`status-banner ${calibStatus.type}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {calibStatus.type === "success" ? "check_circle" : calibStatus.type === "error" ? "error" : "info"}
                </span>
                <span>{calibStatus.text}</span>
              </div>
            )}

            <p className="helper-text" style={{ fontStyle: "italic" }}>
              The device will reject a calibration reading that falls within its ultrasonic sensor's
              blind zone (below ~22cm) or beyond its maximum range (~400cm) - you'll see the reason here if that happens.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="row" style={{ marginBottom: "var(--space-md)", justifyContent: "flex-start", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>notifications_active</span>
            <span className="label-caps" style={{ color: "var(--primary)" }}>Alerts &amp; Notifications</span>
          </div>
          <div className="divider-list">
            {notifItems.map(({ key, label, desc }) => (
              <div key={key} className="row">
                <div>
                  <div className="body-md" style={{ fontWeight: 600 }}>{label}</div>
                  <div className="helper-text">{desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notif[key]} onChange={() => toggle(key)} />
                  <span className="toggle-track" />
                </label>
              </div>
            ))}
          </div>
        </section>

        <div className="info-box">
          <span className="material-symbols-outlined" style={{ color: "var(--outline)" }}>info</span>
          <div>
            <div className="label-caps">App Status</div>
            <div className="helper-text" style={{ marginTop: 4, fontStyle: "italic" }}>Data Source: Live ESP32 (shows a connection error if unreachable)</div>
            <div className="helper-text">Version 1.0.0</div>
          </div>
        </div>

        <button className="btn-primary" type="submit">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saved ? "check_circle" : "save"}</span>
          {saved ? "Settings Saved!" : "Save Settings"}
        </button>
      </form>
    </>
  );
}
