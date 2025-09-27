import React from "react";

const WeatherCard = ({ weather, alerts, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <div className="weather-card loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="weather-card error">
        <div className="error-message">
          <h3>⚠️ Unable to load weather data</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!weather || !weather.success) {
    return (
      <div className="weather-card no-data">
        <p>No weather data available</p>
      </div>
    );
  }

  const weatherData = weather.data;
  const activeAlert = alerts.find((alert) => alert.is_active);
  const alertLevel = activeAlert?.alert_level || "green";

  // Get alert emoji
  const getAlertEmoji = (level) => {
    switch (level) {
      case "red":
        return "🚨";
      case "orange":
        return "⚠️";
      case "yellow":
        return "🌧️";
      default:
        return "☀️";
    }
  };

  // Get weather emoji
  const getWeatherEmoji = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("rain")) return "🌧️";
    if (conditionLower.includes("cloud")) return "☁️";
    if (conditionLower.includes("clear")) return "☀️";
    if (conditionLower.includes("storm")) return "⛈️";
    return "🌤️";
  };

  return (
    <div className={`weather-card alert-${alertLevel}`}>
      {/* Header with city and alert */}
      <div className="weather-header">
        <div className="location-info">
          <h2>{weatherData.city}</h2>
          <p className="last-updated">
            Updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {activeAlert && (
          <div className={`alert-badge ${alertLevel}`}>
            {getAlertEmoji(alertLevel)} {alertLevel.toUpperCase()}
          </div>
        )}
      </div>

      {/* Main weather info */}
      <div className="weather-main">
        <div className="temperature-section">
          <span className="weather-emoji">
            {getWeatherEmoji(weatherData.weather_condition)}
          </span>
          <div className="temperature">
            <span className="temp-value">
              {Math.round(weatherData.temperature)}
            </span>
            <span className="temp-unit">°C</span>
          </div>
        </div>

        <div className="condition">
          <p className="weather-condition">{weatherData.weather_condition}</p>
        </div>
      </div>

      {/* Weather details grid */}
      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">💧 Rainfall</span>
          <span className="detail-value">{weatherData.rainfall} mm/hr</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">💨 Humidity</span>
          <span className="detail-value">{weatherData.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">🌬️ Wind Speed</span>
          <span className="detail-value">{weatherData.wind_speed} km/h</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">📍 Location</span>
          <span className="detail-value">
            {weatherData.latitude.toFixed(2)}°N,{" "}
            {weatherData.longitude.toFixed(2)}°E
          </span>
        </div>
      </div>

      {/* Alert message */}
      {activeAlert && (
        <div className="alert-message">
          <p>{activeAlert.message}</p>
          <small>
            Expires: {new Date(activeAlert.expires_at).toLocaleString()}
          </small>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
