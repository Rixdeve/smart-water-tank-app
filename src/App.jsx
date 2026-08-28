import { useState } from "react";
import "./App.css";
import BottomNav from "./components/BottomNav";
import Dashboard from "./screens/Dashboard";
import Analytics from "./screens/Analytics";
import Prediction from "./screens/Prediction";
import Quality from "./screens/Quality";
import Settings from "./screens/Settings";
import DeviceSetup from "./screens/DeviceSetup";

const SCREENS = {
  dashboard: Dashboard,
  analytics: Analytics,
  prediction: Prediction,
  quality: Quality,
  settings: Settings,
  deviceSetup: DeviceSetup,
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const Screen = SCREENS[tab];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <span className="material-symbols-outlined">waves</span>
            <h1>AquaGuard</h1>
          </div>
          <button className="icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        <Screen onNavigate={setTab} />
      </main>

      <BottomNav active={tab === "deviceSetup" ? "settings" : tab} onChange={setTab} />
    </div>
  );
}
