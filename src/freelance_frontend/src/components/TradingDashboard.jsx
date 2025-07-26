// src/components/TradingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { createActor, canisterId } from '../declarations/liquifusion_backend';

const TradingDashboard = ({ user }) => {
  const [pools, setPools] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState('');
  const [protectionStats, setProtectionStats] = useState({
    totalProtected: 0,
    threatsBlocked: 0,
    riskScore: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const backend = createActor(canisterId);
      const poolData = await backend.get_pools();
      setPools(poolData);
      if (poolData.length > 0) {
        setSelectedPool(poolData[0].pool_id);
      }
      
      // Mock protection stats
      setProtectionStats({
        totalProtected: 2547632,
        threatsBlocked: 1247,
        riskScore: 15.3
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const assessRisk = async () => {
    if (!selectedPool || !transactionAmount) return;
    
    setLoading(true);
    try {
      const backend = createActor(canisterId);
      const assessment = await backend.ai_risk_assessment(
        selectedPool, 
        parseInt(transactionAmount)
      );
      setRiskData(assessment);
    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 0.3) return '#10B981'; // Green
    if (score < 0.7) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>🛡️ AI Protection Dashboard</h2>
        <p>Real-time DeFi risk monitoring and protection</p>
      </div>

      {/* Protection Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Value Protected</h3>
          <p className="stat-value">${protectionStats.totalProtected.toLocaleString()}</p>
          <span className="stat-change positive">↗ +12.3%</span>
        </div>
        <div className="stat-card">
          <h3>Threats Blocked</h3>
          <p className="stat-value">{protectionStats.threatsBlocked}</p>
          <span className="stat-change positive">↗ +45 today</span>
        </div>
        <div className="stat-card">
          <h3>Current Risk Level</h3>
          <p className="stat-value">{protectionStats.riskScore}%</p>
          <span className="stat-change neutral">◈ Low Risk</span>
        </div>
      </div>

      {/* Risk Assessment Tool */}
      <div className="risk-assessment-section">
        <h3>🤖 AI Risk Assessment</h3>
        <div className="assessment-form">
          <div className="form-group">
            <label>Select Pool:</label>
            <select 
              value={selectedPool} 
              onChange={(e) => setSelectedPool(e.target.value)}
              className="form-select"
            >
              {pools.map(pool => (
                <option key={pool.pool_id} value={pool.pool_id}>
                  {pool.token_a}/{pool.token_b} - TVL: {(pool.balance_a + pool.balance_b).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Transaction Amount:</label>
            <input
              type="number"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
              placeholder="Enter amount..."
              className="form-input"
            />
          </div>
          
          <button 
            onClick={assessRisk} 
            disabled={loading || !selectedPool || !transactionAmount}
            className="assess-btn"
          >
            {loading ? '🔄 Analyzing...' : '🧠 Assess Risk'}
          </button>
        </div>

        {riskData && (
          <div className="risk-result" style={{ borderColor: getRiskColor(riskData.score) }}>
            <div className="risk-header">
              <h4>AI Risk Analysis Result</h4>
              <div 
                className="risk-score"
                style={{ color: getRiskColor(riskData.score) }}
              >
                {(riskData.score * 100).toFixed(1)}%
              </div>
            </div>
            <div className="risk-details">
              <p><strong>Risk Level:</strong> {riskData.level}</p>
              <p><strong>AI Recommendation:</strong> {riskData.recommendation}</p>
              <div className="risk-bar">
                <div 
                  className="risk-fill" 
                  style={{ 
                    width: `${riskData.score * 100}%`,
                    backgroundColor: getRiskColor(riskData.score)
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Pools */}
      <div className="pools-section">
        <h3>💧 Active Liquidity Pools</h3>
        <div className="pools-grid">
          {pools.map(pool => (
            <div key={pool.pool_id} className="pool-card">
              <div className="pool-header">
                <h4>{pool.token_a}/{pool.token_b}</h4>
                <div 
                  className="pool-status"
                  style={{ 
                    backgroundColor: pool.risk_score < 0.3 ? '#10B981' : 
                                   pool.risk_score < 0.7 ? '#F59E0B' : '#EF4444'
                  }}
                >
                  {pool.risk_score < 0.3 ? 'Safe' : 
                   pool.risk_score < 0.7 ? 'Medium' : 'High Risk'}
                </div>
              </div>
              <div className="pool-details">
                <p>Balance A: {pool.balance_a.toLocaleString()}</p>
                <p>Balance B: {pool.balance_b.toLocaleString()}</p>
                <p>Risk Score: {(pool.risk_score * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
