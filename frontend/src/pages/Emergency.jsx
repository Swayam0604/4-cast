import React from "react";

const Emergency = () => {
  const emergencyContacts = [
    { name: "Police", number: "100", icon: "🚓" },
    { name: "Fire Department", number: "101", icon: "🚒" },
    { name: "Ambulance", number: "102", icon: "🚑" },
    { name: "Disaster Management", number: "108", icon: "🆘" },
  ];

  return (
    <div className="emergency-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🆘 Emergency Services</h1>
          <p>Quick access to emergency contacts and safety information</p>
        </div>
      </div>

      <div className="emergency-content">
        <div className="emergency-grid">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="emergency-card">
              <div className="emergency-icon">{contact.icon}</div>
              <h3>{contact.name}</h3>
              <div className="emergency-number">
                <a href={`tel:${contact.number}`}>{contact.number}</a>
              </div>
              <button className="call-btn">📞 Call Now</button>
            </div>
          ))}
        </div>

        <div className="safety-tips">
          <h2>🛡️ Weather Safety Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>🌧️ Heavy Rain</h4>
              <ul>
                <li>Stay indoors when possible</li>
                <li>Avoid waterlogged areas</li>
                <li>Keep emergency kit ready</li>
              </ul>
            </div>
            <div className="tip-card">
              <h4>⛈️ Thunderstorm</h4>
              <ul>
                <li>Avoid open areas</li>
                <li>Stay away from metal objects</li>
                <li>Unplug electronic devices</li>
              </ul>
            </div>
            <div className="tip-card">
              <h4>🌊 Flood Warning</h4>
              <ul>
                <li>Move to higher ground</li>
                <li>Don't drive through water</li>
                <li>Have evacuation plan ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
