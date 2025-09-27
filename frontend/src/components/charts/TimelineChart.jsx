import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TimelineChart = ({ cityName, currentTemp }) => {
  const [timelineData, setTimelineData] = useState(null);
  const [activeTab, setActiveTab] = useState("temperature");

  useEffect(() => {
    // Generate realistic hourly data for the next 24 hours
    const generateHourlyData = () => {
      const now = new Date();
      const hours = [];
      const temperatures = [];
      const rainfall = [];
      const humidity = [];
      const windSpeed = [];

      for (let i = 0; i < 24; i++) {
        const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
        hours.push(
          hour.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          })
        );

        // Generate realistic temperature variation (±3°C from current)
        const tempVariation = Math.sin((i * Math.PI) / 12) * 3; // Natural daily cycle
        const randomVariation = (Math.random() - 0.5) * 2;
        temperatures.push(
          Math.round(currentTemp + tempVariation + randomVariation)
        );

        // Generate rainfall data (0-15mm with occasional spikes)
        const rainfallChance = Math.random();
        if (rainfallChance < 0.7) {
          rainfall.push(0);
        } else if (rainfallChance < 0.9) {
          rainfall.push(Math.round(Math.random() * 5));
        } else {
          rainfall.push(Math.round(Math.random() * 15 + 5));
        }

        // Generate humidity (60-90%)
        humidity.push(Math.round(65 + Math.random() * 25));

        // Generate wind speed (5-25 km/h)
        windSpeed.push(Math.round(8 + Math.random() * 17));
      }

      return {
        labels: hours,
        temperatures,
        rainfall,
        humidity,
        windSpeed,
      };
    };

    setTimelineData(generateHourlyData());
  }, [cityName, currentTemp]);

  if (!timelineData) {
    return (
      <div className="timeline-chart">
        <div className="chart-loading">
          <div className="spinner-small"></div>
          <p>Loading timeline data...</p>
        </div>
      </div>
    );
  }

  const getChartData = () => {
    const baseConfig = {
      labels: timelineData.labels,
      datasets: [],
    };

    switch (activeTab) {
      case "temperature":
        return {
          ...baseConfig,
          datasets: [
            {
              label: "Temperature (°C)",
              data: timelineData.temperatures,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgb(59, 130, 246)",
              pointBorderColor: "white",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };

      case "rainfall":
        return {
          ...baseConfig,
          datasets: [
            {
              label: "Rainfall (mm/hr)",
              data: timelineData.rainfall,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.3)",
              fill: true,
              tension: 0.1,
              pointBackgroundColor: "rgb(59, 130, 246)",
              pointBorderColor: "white",
              pointBorderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        };

      case "wind":
        return {
          ...baseConfig,
          datasets: [
            {
              label: "Wind Speed (km/h)",
              data: timelineData.windSpeed,
              borderColor: "rgb(16, 185, 129)",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgb(16, 185, 129)",
              pointBorderColor: "white",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };

      default:
        return baseConfig;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return `${context[0].label}`;
          },
          label: function (context) {
            const value = context.parsed.y;
            const unit =
              activeTab === "temperature"
                ? "°C"
                : activeTab === "rainfall"
                ? "mm/hr"
                : "km/h";
            return `${value}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
          callback: function (value) {
            const unit =
              activeTab === "temperature"
                ? "°C"
                : activeTab === "rainfall"
                ? "mm"
                : "km/h";
            return `${value}${unit}`;
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 2.5,
      },
      point: {
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <div className="timeline-chart">
      <div className="chart-header">
        <h3>📊 24-Hour Weather Timeline - {cityName}</h3>
        <div className="chart-tabs">
          <button
            className={`chart-tab ${
              activeTab === "temperature" ? "active" : ""
            }`}
            onClick={() => setActiveTab("temperature")}
          >
            🌡️ Temperature
          </button>
          <button
            className={`chart-tab ${activeTab === "rainfall" ? "active" : ""}`}
            onClick={() => setActiveTab("rainfall")}
          >
            🌧️ Rainfall
          </button>
          <button
            className={`chart-tab ${activeTab === "wind" ? "active" : ""}`}
            onClick={() => setActiveTab("wind")}
          >
            💨 Wind
          </button>
        </div>
      </div>

      <div className="chart-container">
        <Line data={getChartData()} options={chartOptions} height={300} />
      </div>

      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Current</span>
          <span className="summary-value">
            {activeTab === "temperature"
              ? `${currentTemp}°C`
              : activeTab === "rainfall"
              ? `${timelineData.rainfall[0]}mm/hr`
              : `${timelineData.windSpeed[0]}km/h`}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">24h High</span>
          <span className="summary-value">
            {activeTab === "temperature"
              ? `${Math.max(...timelineData.temperatures)}°C`
              : activeTab === "rainfall"
              ? `${Math.max(...timelineData.rainfall)}mm/hr`
              : `${Math.max(...timelineData.windSpeed)}km/h`}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">24h Low</span>
          <span className="summary-value">
            {activeTab === "temperature"
              ? `${Math.min(...timelineData.temperatures)}°C`
              : activeTab === "rainfall"
              ? `${Math.min(...timelineData.rainfall)}mm/hr`
              : `${Math.min(...timelineData.windSpeed)}km/h`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
