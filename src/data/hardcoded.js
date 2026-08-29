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

export const API = "https://smart-water-tank-api.onrender.com";

export async function fetchLiveSensorData() {
  let res;
  try {
    res = await fetch(`${API}/latest`, { signal: AbortSignal.timeout(5000) });
  } catch (e) {
    return {
      ok: false,
      error: e.name === "TimeoutError" || e.name === "AbortError"
        ? "Connection to the backend timed out."
        : "Could not reach the backend server.",
    };
  }

  if (!res.ok) return { ok: false, error: `Backend responded with an error (${res.status}).` };

  let data;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "Backend sent a response that couldn't be read." };
  }

  if (!data || data.status === "no data yet") {
    return { ok: false, error: "No sensor readings received from the device yet." };
  }
  if (typeof data.tank_level_pct !== "number" || typeof data.total_litres !== "number") {
    return { ok: false, error: "Backend sent incomplete sensor data." };
  }

  const levelPct = data.tank_level_pct / 100;
  const tankStatus =
    levelPct > 0.6 ? "Full" : levelPct > 0.3 ? "Medium" : "Low";

  return {
    ok: true,
    data: {
      tankLevelPct: levelPct,
      currentLiters: data.total_litres,
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
      todayUsage: data.flow_rate ?? 0,
    },
  };
}

export async function fetchHistory(limit = 500) {
  let res;
  try {
    res = await fetch(`${API}/history?limit=${limit}`, { signal: AbortSignal.timeout(5000) });
  } catch (e) {
    return {
      ok: false,
      error: e.name === "TimeoutError" || e.name === "AbortError"
        ? "Connection to the backend timed out."
        : "Could not reach the backend server.",
    };
  }

  if (!res.ok) return { ok: false, error: `Backend responded with an error (${res.status}).` };

  let data;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "Backend sent a response that couldn't be read." };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { ok: false, error: "No historical readings recorded yet." };
  }
  return { ok: true, rows: data };
}
