 
import api from "./api";

export const weatherService = {
  // Get current weather for a city
  getCurrentWeather: async (city = "Mumbai") => {
    try {
      const response = await api.get(`/weather/current/?city=${city}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      throw new Error(`Failed to fetch weather data for ${city}`);
    }
  },

  // Get weather alerts
  getWeatherAlerts: async (location = "") => {
    try {
      const response = await api.get(`/weather/alerts/?location=${location}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      throw new Error("Failed to fetch weather alerts");
    }
  },

  // Get weather forecast
  getWeatherForecast: async (city = "Mumbai", days = 5) => {
    try {
      const response = await api.get(
        `/weather/forecast/?city=${city}&days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching forecast for ${city}:`, error);
      throw new Error(`Failed to fetch forecast for ${city}`);
    }
  },

  // Get weather history
  getWeatherHistory: async (city = "Mumbai", limit = 10) => {
    try {
      const response = await api.get(
        `/weather/history/?city=${city}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for ${city}:`, error);
      throw new Error(`Failed to fetch weather history for ${city}`);
    }
  },

  // Check API status
  getApiStatus: async () => {
    try {
      const response = await api.get("/weather/status/");
      return response.data;
    } catch (error) {
      console.error("Error checking API status:", error);
      throw new Error("API is not responding");
    }
  },
};
