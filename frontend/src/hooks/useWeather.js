import { useState, useEffect, useCallback } from "react";
import { weatherService } from "../services/weatherService";

export const useWeather = (initialCity = "Mumbai") => {
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState(initialCity);

  // Fetch current weather data
  const fetchWeatherData = useCallback(
    async (cityName = city) => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🌦️ Fetching weather data for: ${cityName}`);

        // Test API connection first
        try {
          const statusResponse = await weatherService.getApiStatus();
          console.log("✅ API Status:", statusResponse);
        } catch (statusError) {
          console.error("❌ API Status Check Failed:", statusError);
          setError(
            "Cannot connect to weather service. Make sure Django backend is running on http://localhost:8000"
          );
          setLoading(false);
          return;
        }

        // Fetch current weather and alerts in parallel
        const [weatherData, alertsData] = await Promise.all([
          weatherService.getCurrentWeather(cityName),
          weatherService.getWeatherAlerts(cityName).catch((err) => {
            console.warn("Alerts failed, continuing:", err);
            return { data: [] };
          }),
        ]);

        console.log("🌤️ Weather data received:", weatherData);
        console.log("⚠️ Alerts data received:", alertsData);

        if (weatherData && weatherData.success) {
          setWeather(weatherData);
          setAlerts(alertsData.data || []);
          setError(null);
        } else {
          setError("Weather data not available for this location");
          setWeather(null);
          setAlerts([]);
        }
      } catch (err) {
        console.error("❌ Error in fetchWeatherData:", err);

        // Provide specific error messages
        if (err.message.includes("Network Error")) {
          setError(
            "Network error: Make sure Django backend is running on http://localhost:8000"
          );
        } else if (err.message.includes("404")) {
          setError("Weather service not found. Check API endpoints.");
        } else if (err.message.includes("CORS")) {
          setError("CORS error: Check Django CORS configuration.");
        } else {
          setError(`Weather service error: ${err.message}`);
        }

        setWeather(null);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    },
    [city]
  );

  // Fetch forecast data
  const fetchForecast = useCallback(
    async (cityName = city, days = 3) => {
      try {
        console.log(`📅 Fetching forecast for: ${cityName}`);
        const forecastData = await weatherService.getWeatherForecast(
          cityName,
          days
        );
        setForecast(forecastData);
      } catch (err) {
        console.error("❌ Error fetching forecast:", err);
      }
    },
    [city]
  );

  // Change city
  const changeCity = useCallback((newCity) => {
    console.log(`🏙️ Changing city to: ${newCity}`);
    setCity(newCity);
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    console.log("🔄 Refreshing weather data...");
    fetchWeatherData(city);
  }, [city, fetchWeatherData]);

  // Load data on city change
  useEffect(() => {
    fetchWeatherData(city);
  }, [city, fetchWeatherData]);

  return {
    weather,
    alerts,
    forecast,
    loading,
    error,
    city,
    changeCity,
    refresh,
    fetchForecast,
  };
};
