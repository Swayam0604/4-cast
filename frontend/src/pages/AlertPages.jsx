import React from "react";
import { useWeather } from "../hooks/useWeather";

const AlertPages = () => {
  const { alerts, loading } = useWeather("Mumbai");

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>⚠️ Weather Alerts</h1>
          <p>Active weather warnings and emergency notifications</p>
        </div>
      </div>

      <div className="alerts-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading weather alerts...</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts && alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`alert-card-large ${alert.alert_level}`}
                >
                  <div className="alert-header-large">
                    <span className="alert-level-badge">
                      {alert.alert_level?.toUpperCase()}
                    </span>
                    <span className="alert-time">
                      {alert.created_at
                        ? new Date(alert.created_at).toLocaleString()
                        : "Active"}
                    </span>
                  </div>
                  <h3>{alert.alert_type || "Weather Alert"}</h3>
                  <p className="alert-message-large">
                    {alert.message || "Weather alert is active for your area."}
                  </p>
                  <div className="alert-footer">
                    <span>Location: {alert.location || "Mumbai"}</span>
                    <span>
                      Expires:{" "}
                      {alert.expires_at
                        ? new Date(alert.expires_at).toLocaleString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-alerts">
                <div className="no-alerts-icon">✅</div>
                <h3>No Active Alerts</h3>
                <p>All weather conditions are currently normal in your area.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPages;
