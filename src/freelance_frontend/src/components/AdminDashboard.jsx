
import React, { useState, useEffect } from 'react';
import { createActor, canisterId } from '../declarations/liquifusion_backend';

const AdminDashboard = ({ user }) => {
  const [dbMetrics, setDbMetrics] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    cpu: 65,
    memory: 78,
    storage: 45,
    cycles: 89
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const backend = createActor(canisterId);
      const metrics = await backend.optimize_database_ai();
      setDbMetrics(metrics);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const optimizeDatabase = async () => {
    try {
      const backend = createActor(canisterId);
      const result = await backend.optimize_database_ai();
      setDbMetrics(result);
      alert('Database optimization completed!');
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>⚙️ Admin Control Panel</h2>
        <p>System management and AI optimization tools</p>
      </div>

      {/* System Health */}
      <div className="system-health">
        <h3>📊 System Health</h3>
        <div className="health-grid">
          <div className="health-item">
            <span>CPU Usage</span>
            <div className="health-bar">
              <div className="health-fill" style={{width: `${systemHealth.cpu}%`}}></div>
            </div>
            <span>{systemHealth.cpu}%</span>
          </div>
          <div className="health-item">
            <span>Memory</span>
            <div className="health-bar">
              <div className="health-fill" style={{width: `${systemHealth.memory}%`}}></div>
            </div>
            <span>{systemHealth.memory}%</span>
          </div>
          <div className="health-item">
            <span>Storage</span>
            <div className="health-bar">
              <div className="health-fill" style={{width: `${systemHealth.storage}%`}}></div>
            </div>
            <span>{systemHealth.storage}%</span>
          </div>
          <div className="health-item">
            <span>Cycles</span>
            <div className="health-bar">
              <div className="health-fill" style={{width: `${systemHealth.cycles}%`}}></div>
            </div>
            <span>{systemHealth.cycles}%</span>
          </div>
        </div>
      </div>

      {/* Database Management */}
      {dbMetrics && (
        <div className="database-section">
          <h3>🗄️ AI Database Optimizer</h3>
          <div className="db-stats">
            <div className="db-stat">
              <h4>Total Queries</h4>
              <p>{dbMetrics.query_count}</p>
            </div>
            <div className="db-stat">
              <h4>Cache Hit Rate</h4>
              <p>{(dbMetrics.cache_hit_ratio * 100).toFixed(1)}%</p>
            </div>
            <div className="db-stat">
              <h4>Avg Response Time</h4>
              <p>{dbMetrics.avg_response_time}ms</p>
            </div>
          </div>
          
          {dbMetrics.optimization_suggestions && dbMetrics.optimization_suggestions.length > 0 && (
            <div className="suggestions">
              <h4>🧠 AI Suggestions:</h4>
              <ul>
                {dbMetrics.optimization_suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <button onClick={optimizeDatabase} className="optimize-btn">
            🚀 Run AI Optimization
          </button>
        </div>
      )}

      {/* AI Model Management */}
      <div className="ai-management">
        <h3>🤖 AI Model Management</h3>
        <div className="model-grid">
          <div className="model-card">
            <h4>Fraud Detection Model</h4>
            <p>Isolation Forest v2.1</p>
            <span className="model-status active">Active</span>
            <button className="model-btn">Update Model</button>
          </div>
          <div className="model-card">
            <h4>Risk Scoring Model</h4>
            <p>Neural Network v1.8</p>
            <span className="model-status active">Active</span>
            <button className="model-btn">Retrain Model</button>
          </div>
          <div className="model-card">
            <h4>Anomaly Detection</h4>
            <p>Autoencoder v3.2</p>
            <span className="model-status active">Active</span>
            <button className="model-btn">Deploy Update</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
