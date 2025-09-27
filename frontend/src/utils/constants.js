 
// App configuration constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || '4-Cast Weather App';

// Weather alert levels (matching Django backend)
export const ALERT_LEVELS = {
  GREEN: 'green',
  YELLOW: 'yellow', 
  ORANGE: 'orange',
  RED: 'red'
};

// Alert colors for UI
export const ALERT_COLORS = {
  green: '#28a745',
  yellow: '#ffc107',
  orange: '#fd7e14', 
  red: '#dc3545'
};

// Default cities for weather app
export const DEFAULT_CITIES = [
  'Mumbai',
  'Delhi', 
  'Bangalore',
  'Chennai',
  'Kolkata'
];
