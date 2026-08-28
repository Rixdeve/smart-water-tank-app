export const SENSOR_DATA = {
  tankLevelPct: 0.75,
  tankCapacityLiters: 1000,
  currentLiters: 750,
  tankStatus: "Medium",
  pumpStatus: "OFF",
  pumpAutoMode: true,
  phValue: 7.2,
  turbidity: 1.8,
  waterQuality: "Safe",
  deviceOnline: true,
  sensorConnected: true,
  sensorError: false,
  calibrationRequired: false,
  todayUsage: 480,
  weeklyAverage: 450,
  dailyHistory: [
    { day: "Mon", liters: 420 },
    { day: "Tue", liters: 680 },
    { day: "Wed", liters: 473 },
    { day: "Thu", liters: 569 },
    { day: "Fri", liters: 649 },
    { day: "Sat", liters: 447 },
    { day: "Sun", liters: 713 },
  ],
};

export const USER_SETTINGS = {
  tankCapacity: 1000,
  lowWaterThreshold: 20,
  phThreshold: { min: 6.5, max: 8.5 },
  notifications: {
    tankFull: true,
    tankLow: true,
    overflowRisk: true,
    pumpFailure: true,
    poorWaterQuality: true,
  },
};

export const API = "http://127.0.0.1:8000";

export async function fetchLiveSensorData() {
  try {
    const res = await fetch(`${API}/latest`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (!data || data.status === "no data yet") return null;

    const levelPct = data.tank_level_pct / 100;
    const tankStatus =
      levelPct > 0.6 ? "Full" : levelPct > 0.3 ? "Medium" : "Low";

    return {
      tankLevelPct: levelPct,
      currentLiters: data.total_litres ?? SENSOR_DATA.currentLiters,
      tankStatus,
      pumpStatus: data.pump_status ? "ON" : "OFF",
      phValue: data.ph_value,
      turbidity: data.turbidity,
      waterQuality:
        data.ph_value >= 6.5 && data.ph_value <= 8.5 && data.turbidity <= 5
          ? "Safe"
          : "Unsafe",
      deviceOnline: data.device_online,
      sensorConnected: data.device_online,
      sensorError: data.sensor_error,
      calibrationRequired: data.calibration_required,
      todayUsage: data.flow_rate ?? SENSOR_DATA.todayUsage,
    };
  } catch {
    return null; // API unreachable or timed out
  }
}

// Fetches raw historical readings (many per day) from the backend/database
// for the Analytics charts. Returns [] if unreachable, so the caller can
// fall back to hardcoded sample data.
export async function fetchHistory(limit = 500) {
  try {
    const res = await fetch(`${API}/history?limit=${limit}`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
