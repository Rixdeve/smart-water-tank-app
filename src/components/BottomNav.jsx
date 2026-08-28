const TABS = [
  { id: "dashboard",  label: "Dashboard", icon: "dashboard" },
  { id: "analytics",  label: "Analytics", icon: "monitoring" },
  { id: "prediction", label: "Forecast",  icon: "online_prediction" },
  { id: "quality",    label: "Quality",   icon: "water_drop" },
  { id: "settings",   label: "Settings",  icon: "settings" },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onChange(t.id)}
            >
              <span className={`material-symbols-outlined ${isActive ? "icon-fill" : ""}`}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
