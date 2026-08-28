import { useState } from "react";

const SETUP_HOTSPOT = "SmartWaterTank-AquaGaurd";

export default function DeviceSetup({ onNavigate }) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    setStatus({ type: "info", text: "Connecting" });
    try {
      const res = await fetch("http://192.168.4.1/wifi-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid, password }),
      });
      if (!res.ok) throw new Error(`Device responded with ${res.status}`);
      setStatus({ type: "success", text: "Saved! The device is rebooting and connecting to your Wi-Fi." });
    } catch {
      setStatus({
        type: "error",
        text: `Could not reach the device. Make sure your phone is connected to "${SETUP_HOTSPOT}" Wi-Fi first.`,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button className="back-btn" onClick={() => onNavigate("settings")}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Settings
      </button>

      <section className="card" style={{ textAlign: "center" }}>
        <div className="icon-circle" style={{ background: "var(--secondary-container)", color: "var(--on-secondary-container)", width: 56, height: 56, margin: "0 auto var(--space-sm)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>wifi</span>
        </div>
        <div className="headline-md">Device Wi-Fi Setup</div>
        <p className="helper-text" style={{ marginTop: 4 }}>
          Connect your ESP32 tank controller to your home network.
        </p>
      </section>

      <section className="card">
        <div className="label-caps" style={{ marginBottom: "var(--space-md)" }}>How it works</div>
        <div className="step-list">
          <div className="step-item">
            <span className="step-num">1</span>
            <p className="body-md" style={{ fontSize: 14 }}>
              In your phone's Wi-Fi settings, connect to <b>"{SETUP_HOTSPOT}"</b>.
            </p>
          </div>
          <div className="step-item">
            <span className="step-num">2</span>
            <p className="body-md" style={{ fontSize: 14 }}>
              Come back here and enter your home Wi-Fi name and password below.
            </p>
          </div>
          <div className="step-item">
            <span className="step-num">3</span>
            <p className="body-md" style={{ fontSize: 14 }}>
              Tap Connect Device. It will reboot and join your network.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ marginBottom: "var(--space-md)", justifyContent: "flex-start", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>router</span>
          <span className="label-caps" style={{ color: "var(--primary)" }}>Home Network</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div className="field">
            <label>Wi-Fi Name (SSID)</label>
            <input
              type="text" placeholder="e.g. MyHomeWiFi"
              value={ssid} onChange={(e) => setSsid(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Wi-Fi Password</label>
            <div className="ph-range-row">
              <input
                type={showPassword ? "text" : "password"} placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button" className="icon-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <button
          className="btn-primary" style={{ marginTop: "var(--space-lg)" }}
          onClick={submit} disabled={sending || !ssid}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {sending ? "sync" : "wifi_tethering"}
          </span>
          {sending ? "Connecting…" : "Connect Device"}
        </button>

        {status && (
          <div className={`status-banner ${status.type}`} style={{ marginTop: "var(--space-md)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {status.type === "success" ? "check_circle" : status.type === "error" ? "error" : "info"}
            </span>
            <span>{status.text}</span>
          </div>
        )}
      </section>
    </>
  );
}
