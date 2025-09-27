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

// Fix for default markers in React Leaflet
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

// Create custom weather icon
const createWeatherIcon = (alertLevel = "green", temp = 25) => {
  const colors = {
    green: "#10b981",
    yellow: "#f59e0b",
    orange: "#ea580c",
    red: "#dc2626",
  };

  const bgColor = colors[alertLevel];

  return L.divIcon({
    html: `
      <div class="weather-marker" style="
        width: 60px; 
        height: 60px; 
        border-radius: 50%; 
        background: ${bgColor}; 
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        <div style="font-size: 14px; font-weight: 600;">${temp}°C</div>
        <div style="font-size: 8px; opacity: 0.9;">●</div>
      </div>
    `,
    className: "custom-weather-icon",
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
};

// Get rainfall visualization
const getRainfallVisualization = (rainfall) => {
  if (rainfall >= 50)
    return { color: "#dc2626", radius: 100000, fillOpacity: 0.4 }; // Extreme
  if (rainfall >= 15)
    return { color: "#ea580c", radius: 80000, fillOpacity: 0.3 }; // Heavy
  if (rainfall >= 2.6)
    return { color: "#f59e0b", radius: 60000, fillOpacity: 0.2 }; // Moderate
  return { color: "#10b981", radius: 30000, fillOpacity: 0.1 }; // Light/None
};

// Map click handler component
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

  // Fetch weather for all cities
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

  // Get alert level for a location
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

  // Handle map clicks
  const handleMapClick = (latlng) => {
    console.log("Map clicked at:", latlng);
    // Future: Add ability to check weather at clicked location
  };

  // Refresh all weather data
  const refreshWeatherData = () => {
    console.log("Refreshing weather data...");
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
      <div className="page-header">
        <div className="header-content">
          <h1>🗺️ Interactive Weather Map</h1>
          <p>
            Real-time weather visualization across India with geographical
            overlays
          </p>
        </div>
        <div className="map-controls">
          <select
            value={mapLayer}
            onChange={(e) => setMapLayer(e.target.value)}
            className="layer-selector"
          >
            <option value="openstreetmap">Street Map</option>
            <option value="satellite">Satellite View</option>
            <option value="terrain">Terrain Map</option>
          </select>

          <label className="toggle-control">
            <input
              type="checkbox"
              checked={showRainfallOverlay}
              onChange={(e) => setShowRainfallOverlay(e.target.checked)}
            />
            <span>Rainfall Overlay</span>
          </label>

          <button
            onClick={refreshWeatherData}
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? "🔄 Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          style={{ height: "75vh", width: "100%" }}
          className="weather-leaflet-map"
        >
          {/* Different tile layers based on selection */}
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

          {/* Map click handler */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Weather markers and rainfall overlays */}
          {weatherLocations.map((location) => {
            if (!location.weather?.success) return null;

            const weatherData = location.weather.data;
            const alertLevel = getAlertLevel(location.alerts);
            const rainfallViz = getRainfallVisualization(weatherData.rainfall);

            return (
              <React.Fragment key={location.id}>
                {/* Rainfall visualization circle */}
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

                {/* Weather marker */}
                <Marker
                  position={[location.lat, location.lng]}
                  icon={createWeatherIcon(
                    alertLevel,
                    Math.round(weatherData.temperature)
                  )}
                  eventHandlers={{
                    click: () => setSelectedLocation(location),
                  }}
                >
                  <Popup maxWidth={300}>
                    <div className="weather-popup">
                      <h3 className="popup-title">{location.name}</h3>

                      <div className="popup-main-weather">
                        <div className="popup-temp">
                          {Math.round(weatherData.temperature)}°C
                        </div>
                        <div className="popup-condition">
                          {weatherData.weather_condition}
                        </div>
                      </div>

                      <div className="popup-details">
                        <div className="detail-row">
                          <span className="detail-icon">🌧️</span>
                          <span>
                            Rainfall:{" "}
                            <strong>{weatherData.rainfall} mm/hr</strong>
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">💨</span>
                          <span>
                            Humidity: <strong>{weatherData.humidity}%</strong>
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">🌬️</span>
                          <span>
                            Wind: <strong>{weatherData.wind_speed} km/h</strong>
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">📍</span>
                          <span>
                            <strong>
                              {weatherData.latitude?.toFixed(2)}°N,{" "}
                              {weatherData.longitude?.toFixed(2)}°E
                            </strong>
                          </span>
                        </div>
                      </div>

                      {location.alerts.length > 0 && (
                        <div className="popup-alerts">
                          <div className="alerts-title">⚠️ Active Alerts:</div>
                          {location.alerts.map((alert, index) => (
                            <div
                              key={index}
                              className={`popup-alert ${alert.alert_level}`}
                            >
                              <strong>
                                {alert.alert_level?.toUpperCase()}:
                              </strong>{" "}
                              {alert.message}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        className="view-details-btn"
                        onClick={() => setSelectedLocation(location)}
                      >
                        View Detailed Report
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Weather Legend */}
      <div className="weather-legend">
        <h4>🎨 Map Legend</h4>
        <div className="legend-content">
          <div className="legend-section">
            <h5>Alert Levels</h5>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-marker green"></div>
                <span>Normal Conditions</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker yellow"></div>
                <span>Be Aware</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker orange"></div>
                <span>Be Prepared</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker red"></div>
                <span>Take Action</span>
              </div>
            </div>
          </div>

          {showRainfallOverlay && (
            <div className="legend-section">
              <h5>Rainfall Intensity</h5>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-circle light-rain"></div>
                  <span>Light Rain (0-2.5mm/hr)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle moderate-rain"></div>
                  <span>Moderate Rain (2.6-15mm/hr)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle heavy-rain"></div>
                  <span>Heavy Rain (15-50mm/hr)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-circle extreme-rain"></div>
                  <span>Extreme Rain (50+ mm/hr)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Weather Panel */}
      {selectedLocation && selectedLocation.weather?.success && (
        <div className="weather-details-modal">
          <div
            className="modal-backdrop"
            onClick={() => setSelectedLocation(null)}
          ></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedLocation.name} - Detailed Weather Report</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedLocation(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="weather-overview">
                <div className="main-stats">
                  <div className="main-temp">
                    {Math.round(selectedLocation.weather.data.temperature)}°C
                  </div>
                  <div className="main-condition">
                    {selectedLocation.weather.data.weather_condition}
                  </div>
                  <div className="last-updated">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="detailed-stats">
                <div className="stat-card">
                  <div className="stat-icon">🌧️</div>
                  <div className="stat-info">
                    <div className="stat-label">Rainfall</div>
                    <div className="stat-value">
                      {selectedLocation.weather.data.rainfall} mm/hr
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💨</div>
                  <div className="stat-info">
                    <div className="stat-label">Humidity</div>
                    <div className="stat-value">
                      {selectedLocation.weather.data.humidity}%
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🌬️</div>
                  <div className="stat-info">
                    <div className="stat-label">Wind Speed</div>
                    <div className="stat-value">
                      {selectedLocation.weather.data.wind_speed} km/h
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📍</div>
                  <div className="stat-info">
                    <div className="stat-label">Coordinates</div>
                    <div className="stat-value">
                      {selectedLocation.weather.data.latitude?.toFixed(2)}°N
                      <br />
                      {selectedLocation.weather.data.longitude?.toFixed(2)}°E
                    </div>
                  </div>
                </div>
              </div>

              {selectedLocation.alerts.length > 0 && (
                <div className="modal-alerts">
                  <h3>🚨 Active Weather Alerts</h3>
                  <div className="alerts-list">
                    {selectedLocation.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`alert-card modal-alert-${alert.alert_level}`}
                      >
                        <div className="alert-header">
                          <span className="alert-level">
                            {alert.alert_level?.toUpperCase()}
                          </span>
                          <span className="alert-type">{alert.alert_type}</span>
                        </div>
                        <div className="alert-message">{alert.message}</div>
                        <div className="alert-time">
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
