import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import { weatherService } from "../services/weatherService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import TimelineChart from "../components/charts/TimelineChart";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Major Indian cities with coordinates
const INDIAN_CITIES = [
  { id: 1, name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { id: 2, name: "Delhi", lat: 28.6139, lng: 77.209 },
  { id: 3, name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { id: 4, name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { id: 5, name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { id: 6, name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { id: 7, name: "Pune", lat: 18.5204, lng: 73.8567 },
  { id: 8, name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
];

// Create enhanced weather marker with city name
const createWeatherIcon = (alertLevel = "green", temp = 25, cityName = "City") => {
  const colors = {
    green: "#10b981",
    yellow: "#f59e0b",
    orange: "#ea580c",
    red: "#dc2626",
  };

  const bgColor = colors[alertLevel];

  return L.divIcon({
    html: `
      <div class="enhanced-weather-marker" style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.95);
          color: #1f2937;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: 1px solid rgba(0,0,0,0.1);
          white-space: nowrap;
        ">${cityName}</div>
        <div style="
          width: 50px; 
          height: 50px; 
          border-radius: 50%; 
          background: ${bgColor}; 
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
          transition: all 0.3s ease;
        ">
          <div style="font-size: 13px; line-height: 1;">${temp}°</div>
          <div style="font-size: 8px; opacity: 0.9;">C</div>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${bgColor};
          margin-top: -3px;
        "></div>
      </div>
    `,
    className: "enhanced-weather-icon",
    iconSize: [80, 80],
    iconAnchor: [40, 70],
  });
};

const getRainfallVisualization = (rainfall) => {
  if (rainfall >= 50)
    return { color: "#dc2626", radius: 100000, fillOpacity: 0.4 };
  if (rainfall >= 15)
    return { color: "#ea580c", radius: 80000, fillOpacity: 0.3 };
  if (rainfall >= 2.6)
    return { color: "#f59e0b", radius: 60000, fillOpacity: 0.2 };
  return { color: "#10b981", radius: 30000, fillOpacity: 0.1 };
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const WeatherMap = () => {
  const [weatherLocations, setWeatherLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLayer, setMapLayer] = useState("openstreetmap");
  const [showRainfallOverlay, setShowRainfallOverlay] = useState(true);

  useEffect(() => {
    const fetchAllWeather = async () => {
      setLoading(true);
      try {
        const weatherPromises = INDIAN_CITIES.map(async (city) => {
          try {
            const [weather, alerts] = await Promise.all([
              weatherService.getCurrentWeather(city.name),
              weatherService.getWeatherAlerts(city.name),
            ]);

            return {
              ...city,
              weather,
              alerts: alerts.data || [],
            };
          } catch (error) {
            console.error(`Failed to fetch weather for ${city.name}:`, error);
            return {
              ...city,
              weather: { success: false },
              alerts: [],
            };
          }
        });

        const locations = await Promise.all(weatherPromises);
        setWeatherLocations(locations);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllWeather();
  }, []);

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

  const handleMapClick = (latlng) => {
    console.log("Map clicked at:", latlng);
  };

  const refreshWeatherData = () => {
    const fetchAllWeather = async () => {
      setLoading(true);
      try {
        const weatherPromises = INDIAN_CITIES.map(async (city) => {
          try {
            const [weather, alerts] = await Promise.all([
              weatherService.getCurrentWeather(city.name),
              weatherService.getWeatherAlerts(city.name),
            ]);

            return {
              ...city,
              weather,
              alerts: alerts.data || [],
            };
          } catch (error) {
            console.error(`Failed to fetch weather for ${city.name}:`, error);
            return {
              ...city,
              weather: { success: false },
              alerts: [],
            };
          }
        });

        const locations = await Promise.all(weatherPromises);
        setWeatherLocations(locations);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllWeather();
  };

  return (
    <div className="weather-map-page">
      <div className="page-header enhanced-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🗺️ Interactive Weather Map</h1>
            
          </div>
          {/* <div className="weather-summary">
            <div className="summary-stat">
              <span className="stat-number">
                {weatherLocations.filter((l) => l.weather?.success).length}
              </span>
              <span className="stat-label">Cities Monitored</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number">
                {weatherLocations.filter((l) => l.alerts?.length > 0).length}
              </span>
              <span className="stat-label">Active Alerts</span>
            </div>
          </div> */}
        </div>

        <div className="map-controls enhanced-controls">
          <div className="control-group">
            <label className="control-label">🗺️ Map View:</label>
            <select
              value={mapLayer}
              onChange={(e) => setMapLayer(e.target.value)}
              className="layer-selector enhanced-select"
            >
              <option value="openstreetmap">🌍 Street Map</option>
              <option value="satellite">🛰️ Satellite View</option>
              <option value="terrain">⛰️ Terrain Map</option>
            </select>
          </div>

          <div className="control-group">
            <label className="toggle-control enhanced-toggle">
              <input
                type="checkbox"
                checked={showRainfallOverlay}
                onChange={(e) => setShowRainfallOverlay(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">🌧️ Rainfall Overlay</span>
            </label>
          </div>

          <button
            onClick={refreshWeatherData}
            className="refresh-btn enhanced-refresh"
            disabled={loading}
          >
            <span className={loading ? "spinning" : ""}>🔄</span>
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      <div className="map-container enhanced-map-container">
        {loading && (
          <div className="map-loading-overlay">
            <div className="loading-content">
              <div className="spinner-large"></div>
              <p>Loading weather data for {INDIAN_CITIES.length} cities...</p>
            </div>
          </div>
        )}

        <MapContainer
          center={[20.5937, 78.9629]} 
          zoom={5}
          style={{ height: "90vh", width: "100%" }}
          className="weather-leaflet-map"
        >

          {mapLayer === "satellite" && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, GeoEye'
            />
          )}

          {mapLayer === "terrain" && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, USGS, NOAA'
            />
          )}

          {mapLayer === "openstreetmap" && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          )}

          <MapClickHandler onMapClick={handleMapClick} />

          {weatherLocations.map((location) => {
            if (!location.weather?.success) return null;

            const weatherData = location.weather.data;
            const alertLevel = getAlertLevel(location.alerts);
            const rainfallViz = getRainfallVisualization(weatherData.rainfall);

            return (
              <React.Fragment key={location.id}>
                {showRainfallOverlay && weatherData.rainfall > 0 && (
                  <Circle
                    center={[location.lat, location.lng]}
                    radius={rainfallViz.radius}
                    pathOptions={{
                      color: rainfallViz.color,
                      fillColor: rainfallViz.color,
                      fillOpacity: rainfallViz.fillOpacity,
                      weight: 2,
                      opacity: 0.8,
                    }}
                  />
                )}

                <Marker
                  position={[location.lat, location.lng]}
                  icon={createWeatherIcon(
                    alertLevel,
                    Math.round(weatherData.temperature),
                    location.name
                  )}
                  eventHandlers={{
                    click: () => setSelectedLocation(location),
                  }}
                >
                  <Popup maxWidth={280} minWidth={280} className="enhanced-popup">
                    <div className="enhanced-weather-popup">
                      <div className="popup-header">
                        <h3 className="popup-title">
                          <span className="city-icon">📍</span>
                          {location.name}
                        </h3>
                        <div className={`popup-alert-badge ${alertLevel}`}>
                          {alertLevel === "red"
                            ? "🚨"
                            : alertLevel === "orange"
                            ? "⚠️"
                            : alertLevel === "yellow"
                            ? "🟡"
                            : "✅"}
                        </div>
                      </div>

                      <div className="popup-main-weather">
                        <div className="popup-temp">
                          {Math.round(weatherData.temperature)}°C
                        </div>
                        <div className="popup-condition">
                          {weatherData.weather_condition}
                        </div>
                        <div className="popup-time">
                          Updated: {new Date().toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="popup-details">
                        <div className="detail-row">
                          <span className="detail-icon">🌧️</span>
                          <div className="detail-content">
                            <span className="detail-label">Rainfall</span>
                            <span className="detail-value">
                              {weatherData.rainfall} mm/hr
                            </span>
                          </div>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">💨</span>
                          <div className="detail-content">
                            <span className="detail-label">Humidity</span>
                            <span className="detail-value">
                              {weatherData.humidity}%
                            </span>
                          </div>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">🌬️</span>
                          <div className="detail-content">
                            <span className="detail-label">Wind</span>
                            <span className="detail-value">
                              {weatherData.wind_speed} km/h
                            </span>
                          </div>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">📍</span>
                          <div className="detail-content">
                            <span className="detail-label">Coordinates</span>
                            <span className="detail-value">
                              {weatherData.latitude?.toFixed(2)}°N,{" "}
                              {weatherData.longitude?.toFixed(2)}°E
                            </span>
                          </div>
                        </div>
                      </div>

                      {location.alerts.length > 0 && (
                        <div className="popup-alerts">
                          <div className="alerts-title">
                            ⚠️ Active Alerts ({location.alerts.length})
                          </div>
                          {location.alerts.slice(0, 2).map((alert, index) => (
                            <div
                              key={index}
                              className={`popup-alert ${alert.alert_level}`}
                            >
                              <strong>{alert.alert_level?.toUpperCase()}:</strong>{" "}
                              {alert.message}
                            </div>
                          ))}
                          {location.alerts.length > 2 && (
                            <div className="more-alerts">
                              +{location.alerts.length - 2} more alerts
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        className="view-details-btn enhanced-details-btn"
                        onClick={() => setSelectedLocation(location)}
                      >
                        <span>📊</span> View 24-Hour Timeline
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Enhanced Legend */}
      <div className="weather-legend enhanced-legend">
        <div className="legend-header">
          <h4>🎨 Interactive Map Legend</h4>
          <p>Understanding weather visualizations and alert levels</p>
        </div>
        <div className="legend-content">
          <div className="legend-section">
            <h5>🚨 Alert Levels</h5>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-marker green pulse"></div>
                <span>
                  <strong>Normal</strong> - Safe conditions
                </span>
              </div>
              <div className="legend-item">
                <div className="legend-marker yellow pulse"></div>
                <span>
                  <strong>Advisory</strong> - Monitor conditions
                </span>
              </div>
              <div className="legend-item">
                <div className="legend-marker orange pulse"></div>
                <span>
                  <strong>Warning</strong> - Take precautions
                </span>
              </div>
              <div className="legend-item">
                <div className="legend-marker red pulse"></div>
                <span>
                  <strong>Alert</strong> - Immediate action
                </span>
              </div>
            </div>
          </div>

          {showRainfallOverlay && (
            <div className="legend-section">
              <h5>🌧️ Rainfall Zones</h5>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-circle light-rain"></div>
                  <span>Light (0-2.5 mm/hr)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle moderate-rain"></div>
                  <span>Moderate (2.6-15 mm/hr)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle heavy-rain"></div>
                  <span>Heavy (15-50 mm/hr)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle extreme-rain"></div>
                  <span>Extreme (50+ mm/hr)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal - Timeline Chart */}
      {selectedLocation && selectedLocation.weather?.success && (
        <div className="weather-details-modal enhanced-modal">
          <div
            className="modal-backdrop"
            onClick={() => setSelectedLocation(null)}
          ></div>
          <div className="modal-content enhanced-modal-content">
            <div className="modal-header enhanced-modal-header">
              <div className="modal-title-section">
                <h2>📊 {selectedLocation.name} - Weather Timeline</h2>
                <p>24-hour detailed weather forecast and analysis</p>
              </div>
              <button
                className="modal-close enhanced-close"
                onClick={() => setSelectedLocation(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body enhanced-modal-body">
              <div className="weather-overview enhanced-overview">
                <div className="current-conditions">
                  <div className="condition-main">
                    <div className="main-temp">
                      {Math.round(selectedLocation.weather.data.temperature)}°C
                    </div>
                    <div className="main-condition">
                      {selectedLocation.weather.data.weather_condition}
                    </div>
                  </div>
                  <div className="condition-details">
                    <div className="detail-mini">
                      <span className="mini-icon">🌧️</span>
                      <span>{selectedLocation.weather.data.rainfall} mm/hr</span>
                    </div>
                    <div className="detail-mini">
                      <span className="mini-icon">💨</span>
                      <span>{selectedLocation.weather.data.humidity}%</span>
                    </div>
                    <div className="detail-mini">
                      <span className="mini-icon">🌬️</span>
                      <span>{selectedLocation.weather.data.wind_speed} km/h</span>
                    </div>
                  </div>
                </div>
                <div className="last-updated">
                  <span className="update-icon">🕐</span>
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>

              <TimelineChart
                cityName={selectedLocation.name}
                currentTemp={selectedLocation.weather.data.temperature}
              />

              {selectedLocation.alerts.length > 0 && (
                <div className="modal-alerts enhanced-alerts">
                  <h3>
                    🚨 Active Weather Alerts ({selectedLocation.alerts.length})
                  </h3>
                  <div className="alerts-list">
                    {selectedLocation.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`alert-card enhanced-alert-card modal-alert-${alert.alert_level}`}
                      >
                        <div className="alert-header">
                          <div className="alert-level-tag">
                            {alert.alert_level?.toUpperCase()}
                          </div>
                          <div className="alert-type">
                            {alert.alert_type || "Weather Alert"}
                          </div>
                        </div>
                        <div className="alert-message">{alert.message}</div>
                        <div className="alert-time">
                          <span className="time-icon">⏰</span>
                          Expires: {new Date(alert.expires_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMap;
