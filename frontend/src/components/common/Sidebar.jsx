import React from "react";
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Users,
  Phone,
  CloudRain,
  X,
  Menu,
} from "lucide-react";

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Weather Dashboard", icon: LayoutDashboard },
    { id: "map", label: "Weather Map", icon: Map },
    { id: "alerts", label: "Weather Alerts", icon: AlertTriangle },
    { id: "emergency", label: "Emergency", icon: Phone },
    { id: "community", label: "Community Feed", icon: Users },
  ];

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <CloudRain size={32} className="logo-icon" />
            <h2>4-Cast</h2>
          </div>
          <p className="subtitle">Weather Alert System</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">Hackathon Team</span>
              <span className="user-role">Thunderbye 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
