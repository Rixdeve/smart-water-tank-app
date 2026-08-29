export default function LiveBadge({ isLive }) {
  return (
    <span
      className={`badge ${isLive ? "badge-primary" : "badge-error"}`}
      title={isLive ? "Showing live ESP32 data" : "Backend unreachable"}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{isLive ? "wifi" : "wifi_off"}</span>
      {isLive ? "Live" : "Offline"}
    </span>
  );
}
