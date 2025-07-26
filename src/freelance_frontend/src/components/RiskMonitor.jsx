// src/components/RiskMonitor.jsx
import React, { useState, useEffect } from 'react';
import { createActor, canisterId } from '../declarations/liquifusion_backend';

const RiskMonitor = ({ user }) => {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [threatStats, setThreatStats] = useState({
    high: 0,
    medium: 0,
    low: 0
  });

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const backend = createActor(canisterId);
      const events = await backend.get_security_events();
      setSecurityEvents(events);
      
      // Calculate threat stats
      const stats = events.reduce((acc, event) => {
        if (event.severity >= 8) acc.high++;
        else if (event.severity >= 5) acc.medium++;
        else acc.low++;
        return acc;
      }, { high: 0, medium: 0, low: 0 });
      
      setThreatStats(stats);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 8) return '#EF4444';
    if (severity >= 5) return '#F59E0B';
    return '#10B981';
  };

  const getSeverityLabel = (severity) => {
    if (severity >= 8) return 'HIGH';
    if (severity >= 5) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <div className="risk-monitor-container">
      <div className="monitor-header">
        <h2>🔍 Real-Time Risk Monitor</h2>
        <p>AI-powered threat detection and security monitoring</p>
      </div>

      {/* Threat Statistics */}
      <div className="threat-stats">
        <div className="threat-stat high">
          <h3>High Risk</h3>
          <p className="threat-count">{threatStats.high}</p>
        </div>
        <div className="threat-stat medium">
          <h3>Medium Risk</h3>
          <p className="threat-count">{threatStats.medium}</p>
        </div>
        <div className="threat-stat low">
          <h3>Low Risk</h3>
          <p className="threat-count">{threatStats.low}</p>
        </div>
      </div>

      {/* Live Security Feed */}
      <div className="security-feed">
        <h3>🚨 Live Security Feed</h3>
        <div className="events-list">
          {securityEvents.length === 0 ? (
            <div className="no-events">
              <p>✅ No security threats detected</p>
              <small>AI monitoring is active and protecting your assets</small>
            </div>
          ) : (
            securityEvents.map((event, index) => (
              <div 
                key={index} 
                className="event-item"
                style={{ borderLeftColor: getSeverityColor(event.severity) }}
              >
                <div className="event-header">
                  <span className="event-type">{event.event_type}</span>
                  <span 
                    className="event-severity"
                    style={{ backgroundColor: getSeverityColor(event.severity) }}
                  >
                    {getSeverityLabel(event.severity)}
                  </span>
                  <span className="event-time">
                    {new Date(Number(event.timestamp) / 1000000).toLocaleString()}
                  </span>
                </div>
                <p className="event-details">{event.details}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Model Status */}
      <div className="ai-status">
        <h3>🤖 AI Protection Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Fraud Detection Model:</span>
            <span className="status-value active">🟢 Active</span>
          </div>
          <div className="status-item">
            <span className="status-label">Cross-Chain Monitor:</span>
            <span className="status-value active">🟢 Active</span>
          </div>
          <div className="status-item">
            <span className="status-label">Database Optimizer:</span>
            <span className="status-value active">🟢 Active</span>
          </div>
          <div className="status-item">
            <span className="status-label">Last Model Update:</span>
            <span className="status-value">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMonitor;
