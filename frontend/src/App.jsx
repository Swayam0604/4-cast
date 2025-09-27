import React, { useState } from "react";
import Sidebar from "./components/common/Sidebar";
import Dashboard from "./pages/Dashboard";
import WeatherMap from "./pages/WeatherMap";
import AlertPages from "./pages/AlertPages";
import Emergency from "./pages/Emergency";
import CommunityPage from "./pages/CommunityPage";

// Import organized CSS files
import "./App.css";
import "./styles/layouts/sidebar.css";
import "./styles/layouts/main.css";
import "./styles/components/weather-card.css";
import "./styles/components/weather-map.css";
import "./styles/pages/dashboard.css";

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "map":
        return <WeatherMap />;
      case "alerts":
        return <AlertPages />;
      case "emergency":
        return <Emergency />;
      case "community":
        return <CommunityPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default App;
