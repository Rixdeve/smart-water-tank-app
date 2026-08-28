export default function LiveBadge({ isLive }) {
  return (
    <span
      className={`badge ${isLive ? "badge-primary" : "badge-neutral"}`}
      title={isLive ? "Showing live ESP32 data" : "Showing simulated data (device unreachable)"}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>wifi</span>
      {isLive ? "Live" : "Demo"}
    </span>
  );
}
