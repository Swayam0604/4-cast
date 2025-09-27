import React from "react";

const CommunityPage = () => {
  const communityUpdates = [
    {
      user: "Local Weather Station",
      message:
        "Heavy rainfall expected in South Mumbai from 3 PM onwards. Please plan accordingly.",
      time: "2 hours ago",
      type: "warning",
    },
    {
      user: "Resident - Andheri",
      message:
        "Waterlogging reported at Andheri subway. Traffic is slow, use alternate routes.",
      time: "45 minutes ago",
      type: "info",
    },
    {
      user: "Emergency Services",
      message: "All emergency services are on standby. Stay safe everyone!",
      time: "1 hour ago",
      type: "safety",
    },
  ];

  return (
    <div className="community-page">
      <div className="page-header">
        <div className="header-content">
          <h1>👥 Community Feed</h1>
          <p>Real-time updates and information from your local community</p>
        </div>
      </div>

      <div className="community-content">
        <div className="community-feed">
          <h2>📢 Recent Updates</h2>
          <div className="updates-list">
            {communityUpdates.map((update, index) => (
              <div key={index} className={`update-card ${update.type}`}>
                <div className="update-header">
                  <div className="user-info">
                    <div className="user-avatar">👤</div>
                    <div className="user-details">
                      <span className="user-name">{update.user}</span>
                      <span className="update-time">{update.time}</span>
                    </div>
                  </div>
                  <div className={`update-type ${update.type}`}>
                    {update.type === "warning" && "⚠️"}
                    {update.type === "info" && "ℹ️"}
                    {update.type === "safety" && "🛡️"}
                  </div>
                </div>
                <div className="update-message">{update.message}</div>
                <div className="update-actions">
                  <button className="action-btn">👍 Helpful</button>
                  <button className="action-btn">💬 Reply</button>
                  <button className="action-btn">📤 Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="post-update">
          <h3>📝 Share an Update</h3>
          <div className="post-form">
            <textarea
              placeholder="Share weather conditions, road closures, or safety information with your community..."
              rows={4}
            ></textarea>
            <div className="post-actions">
              <select className="update-type-select">
                <option value="info">General Info</option>
                <option value="warning">Warning</option>
                <option value="safety">Safety Update</option>
              </select>
              <button className="post-btn">📮 Post Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
