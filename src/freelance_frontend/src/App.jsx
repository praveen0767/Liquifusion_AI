// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import { initAuth, login, logout } from "./auth";
import TradingDashboard from "./components/TradingDashboard";
import AdminDashboard from "./components/AdminDashboard";
import RiskMonitor from "./components/RiskMonitor";

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("trader");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🛡️ LiquiFusion AI</h1>
          <div className="header-nav">
            {user && (
              <>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("risk")}
                  className={`nav-btn ${activeTab === "risk" ? "active" : ""}`}
                >
                  Risk Monitor
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`nav-btn ${activeTab === "analytics" ? "active" : ""}`}
                >
                  AI Analytics
                </button>
              </>
            )}
          </div>
          <div className="header-buttons">
            {user && (
              <button
                onClick={() =>
                  setRole(role === "trader" ? "admin" : "trader")
                }
                className="switch-btn"
              >
                Switch to {role === "trader" ? "Admin" : "Trader"}
              </button>
            )}
            <button
              onClick={() => (user ? logout(setUser) : login(setUser))}
              className="login-btn"
            >
              {user ? "Logout" : "Login with ICP"}
            </button>
          </div>
        </div>
      </header>

      {!user ? (
        <>
          {/* Hero Section */}
          <section className="hero">
            <h1 className="hero-title">
              AI-Powered <span>DeFi Risk Protection</span>
            </h1>
            <p className="hero-subtitle">
              Advanced machine learning algorithms protect your DeFi transactions in real-time.
              Built on the Internet Computer for maximum security and transparency.
            </p>
            <button onClick={() => login(setUser)} className="get-started-btn">
              Start Protecting Your Assets
            </button>
          </section>

          {/* Main Content */}
          <main className="main-content">
            {/* Features Section */}
            <section className="why-choose-us fade-in">
              <h2 className="section-title">Why Choose LiquiFusion AI?</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🤖</div>
                  <h3>AI-Powered Risk Scoring</h3>
                  <p>Advanced machine learning models analyze transactions in real-time to detect fraud and anomalies.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Real-Time Protection</h3>
                  <p>Block suspicious transactions before they execute, preventing losses before they happen.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔗</div>
                  <h3>Cross-Chain Security</h3>
                  <p>Protect assets across Bitcoin, Ethereum, and ICP using Chain Key cryptography.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h3>Smart Database Optimization</h3>
                  <p>AI-driven database management ensures fast queries and optimal performance.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🛡️</div>
                  <h3>Advanced Threat Detection</h3>
                  <p>Continuous monitoring with adaptive ML models that learn from new attack patterns.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💎</div>
                  <h3>Transparent & Decentralized</h3>
                  <p>All AI decisions are recorded on-chain for complete transparency and auditability.</p>
                </div>
              </div>
            </section>

            <section className="testimonials-section fade-in">
              <h2 className="section-title">What DeFi Users Say</h2>
              <div className="testimonials-grid">
                <div className="testimonial-card">
                  <p className="testimonial-text">
                    "LiquiFusion AI saved my portfolio from a flash loan attack. The AI detected the anomaly within milliseconds!"
                  </p>
                  <p className="testimonial-author">- Alex K., DeFi Trader</p>
                </div>
                <div className="testimonial-card">
                  <p className="testimonial-text">
                    "The cross-chain protection gives me confidence to trade across multiple DEXs. No more bridge risks!"
                  </p>
                  <p className="testimonial-author">- Maria S., Yield Farmer</p>
                </div>
                <div className="testimonial-card">
                  <p className="testimonial-text">
                    "As a protocol developer, LiquiFusion's database optimization has improved our query speeds by 300%."
                  </p>
                  <p className="testimonial-author">- Dev Team, SonicDEX</p>
                </div>
                <div className="testimonial-card">
                  <p className="testimonial-text">
                    "The transparency of on-chain AI decisions builds trust. I can verify every protection decision."
                  </p>
                  <p className="testimonial-author">- Robert L., Institutional Investor</p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section fade-in">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Frequently Asked Questions
              </h2>
              <div className="faq-list">
                <div className="faq-item">
                  <h3 className="faq-question">How does AI risk scoring work?</h3>
                  <p className="faq-answer">
                    Our AI uses Isolation Forest and neural network models trained on thousands of DeFi transactions
                    to identify patterns associated with fraud, exploits, and anomalous behavior.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">Is my transaction data private?</h3>
                  <p className="faq-answer">
                    Yes, all AI processing happens on-chain in ICP canisters. Your data never leaves the blockchain,
                    ensuring complete privacy and security.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">What chains are supported?</h3>
                  <p className="faq-answer">
                    LiquiFusion protects assets on Bitcoin, Ethereum, and ICP using Chain Key signatures.
                    No bridges required - direct cross-chain protection.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">How fast is the protection?</h3>
                  <p className="faq-answer">
                    AI risk assessment happens in under 100ms. Suspicious transactions are blocked
                    before they execute, providing real-time protection.
                  </p>
                </div>
              </div>
            </section>

            <section className="cta-section fade-in">
              <h2 className="cta-title">Ready to Secure Your DeFi Portfolio?</h2>
              <p className="cta-subtitle">
                Join LiquiFusion AI today and experience the future of DeFi security
                powered by the Internet Computer.
              </p>
              <button onClick={() => login(setUser)} className="cta-btn">
                Get Protected Now
              </button>
            </section>
          </main>
        </>
      ) : (
        <main className="main-content">
          {activeTab === "dashboard" && (
            role === "trader" ? (
              <TradingDashboard user={user} />
            ) : (
              <AdminDashboard user={user} />
            )
          )}
          {activeTab === "risk" && <RiskMonitor user={user} />}
          {activeTab === "analytics" && <div>AI Analytics Dashboard (Coming Soon)</div>}
        </main>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            © 2025 LiquiFusion AI. Powered by <span>Internet Computer Protocol</span>.
          </p>
          <div className="footer-links">
            <a href="#">Whitepaper</a>
            <a href="#">API Docs</a>
            <a href="#">Security</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
