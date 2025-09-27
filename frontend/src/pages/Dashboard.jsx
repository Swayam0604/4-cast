import React, { useState, useEffect } from "react";
import { weatherService } from "../services/weatherService";
import { Plus, X, RefreshCw, MapPin } from "lucide-react";

const WeatherCard = ({ location, onRemove, compact = true }) => {
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [weatherData, alertsData] = await Promise.all([
        weatherService.getCurrentWeather(location),
        weatherService.getWeatherAlerts(location).catch(() => ({ data: [] })),
      ]);

      if (weatherData && weatherData.success) {
        setWeather(weatherData);
        setAlerts(alertsData.data || []);
      } else {
        setError("Weather data not available");
      }
    } catch (err) {
      console.error(`Error fetching weather for ${location}:`, err);
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const getWeatherEmoji = (condition) => {
    if (!condition) return "🌤️";
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("rain")) return "🌧️";
    if (conditionLower.includes("cloud")) return "☁️";
    if (conditionLower.includes("clear")) return "☀️";
    if (conditionLower.includes("storm")) return "⛈️";
    return "🌤️";
  };

  const getAlertLevel = (alerts) => {
    if (!alerts || alerts.length === 0) return "green";
    const highestAlert = alerts.reduce((highest, current) => {
      const levels = { green: 0, yellow: 1, orange: 2, red: 3 };
      return levels[current.alert_level] > levels[highest]
        ? current.alert_level
        : highest;
    }, "green");
    return highestAlert;
  };

  const alertLevel = getAlertLevel(alerts);

  if (loading) {
    return (
      <div className="weather-card-compact loading">
        <div className="card-header">
          <h3>{location}</h3>
          <div className="spinner-small"></div>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-card-compact error">
        <div className="card-header">
          <h3>{location}</h3>
          <button onClick={() => onRemove(location)} className="remove-btn">
            <X size={16} />
          </button>
        </div>
        <p className="error-text">{error}</p>
        <button onClick={fetchWeatherData} className="retry-small">
          Retry
        </button>
      </div>
    );
  }

  if (!weather?.success) {
    return (
      <div className="weather-card-compact no-data">
        <div className="card-header">
          <h3>{location}</h3>
          <button onClick={() => onRemove(location)} className="remove-btn">
            <X size={16} />
          </button>
        </div>
        <p>No data available</p>
      </div>
    );
  }

  const weatherData = weather.data;

  return (
    <div className={`weather-card-compact alert-${alertLevel}`}>
      <div className="card-header">
        <div className="location-info">
          <h3>{location}</h3>
          <p className="update-time">{new Date().toLocaleTimeString()}</p>
        </div>
        <div className="card-actions">
          {alerts.length > 0 && (
            <div className={`alert-indicator ${alertLevel}`}>
              {alertLevel === "red"
                ? "🚨"
                : alertLevel === "orange"
                ? "⚠️"
                : "🌧️"}
            </div>
          )}
          <button onClick={() => onRemove(location)} className="remove-btn">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="weather-main-compact">
        <div className="temp-section">
          <span className="weather-emoji-small">
            {getWeatherEmoji(weatherData.weather_condition)}
          </span>
          <div className="temperature-compact">
            <span className="temp-value-compact">
              {Math.round(weatherData.temperature)}
            </span>
            <span className="temp-unit-compact">°C</span>
          </div>
        </div>
        <div className="condition-compact">{weatherData.weather_condition}</div>
      </div>

      <div className="weather-details-compact">
        <div className="detail-item-compact">
          <span className="detail-icon">💧</span>
          <span>{weatherData.rainfall} mm/hr</span>
        </div>
        <div className="detail-item-compact">
          <span className="detail-icon">💨</span>
          <span>{weatherData.humidity}%</span>
        </div>
        <div className="detail-item-compact">
          <span className="detail-icon">🌬️</span>
          <span>{weatherData.wind_speed} km/h</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="alert-summary">
          <small>
            {alerts.length} active alert{alerts.length > 1 ? "s" : ""}
          </small>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [locations, setLocations] = useState(["Mumbai", "Delhi", "Bangalore"]);
  const [newLocation, setNewLocation] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const availableCities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
  ];

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation("");
      setShowAddForm(false);
    }
  };

  const removeLocation = (locationToRemove) => {
    if (locations.length > 1) {
      // Keep at least one location
      setLocations(locations.filter((loc) => loc !== locationToRemove));
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    // This will trigger re-renders in all WeatherCard components
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
    // Force refresh by updating key
    setLocations([...locations]);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌦️ Weather Dashboard</h1>
          <p>Real-time weather monitoring for multiple locations</p>
        </div>
        <div className="header-controls">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-location-btn"
          >
            <Plus size={20} />
            Add Location
          </button>
          <button
            onClick={refreshAll}
            className="refresh-btn"
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? "spinning" : ""} />
            {refreshing ? "Refreshing..." : "Refresh All"}
          </button>
        </div>
      </div>

      {/* Add Location Form */}
      {showAddForm && (
        <div className="add-location-form">
          <div className="form-content">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter city name..."
              className="location-input"
              list="cities"
            />
            <datalist id="cities">
              {availableCities
                .filter((city) => !locations.includes(city))
                .map((city) => (
                  <option key={city} value={city} />
                ))}
            </datalist>
            <div className="form-actions">
              <button onClick={addLocation} className="add-btn">
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weather Cards Grid */}
      <div className="weather-cards-grid">
        {locations.map((location, index) => (
          <WeatherCard
            key={`${location}-${index}`}
            location={location}
            onRemove={removeLocation}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="dashboard-stats">
        <div className="stat-item">
          <span className="stat-label">📍 Locations</span>
          <span className="stat-value">{locations.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🔄 Last Updated</span>
          <span className="stat-value">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🌐 Data Source</span>
          <span className="stat-value">OpenWeatherMap</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
