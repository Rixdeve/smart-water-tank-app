import { useState } from "react";
import { USER_SETTINGS } from "../data/hardcoded";

const KEY = "aquaguard.settings";

const DEFAULTS = {
  lowWaterThreshold: USER_SETTINGS.lowWaterThreshold,
  phThreshold: USER_SETTINGS.phThreshold,
  notifications: USER_SETTINGS.notifications,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      lowWaterThreshold: parsed.lowWaterThreshold ?? DEFAULTS.lowWaterThreshold,
      phThreshold: { ...DEFAULTS.phThreshold, ...(parsed.phThreshold || {}) },
      notifications: { ...DEFAULTS.notifications, ...(parsed.notifications || {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

export function useAppSettings() {
  const [settings] = useState(loadSettings);
  return settings;
}

export function saveAppSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
