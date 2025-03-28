import React, { useState, useEffect } from "react";
import "./App.css"; // Import the CSS file
import { initAuth, login, logout } from "./auth";
import ClientDashboard from "./components/ClientDashboard";
import FreelancerDashboard from "./components/FreelancerDashboard";

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("client");

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">FreelanceHub</h1>
          <div className="header-buttons">
            <button
              onClick={() => setRole(role === "client" ? "freelancer" : "client")}
              className="switch-btn"
            >
              Switch to {role === "client" ? "Freelancer" : "Client"}
            </button>
            <button
              onClick={() => (user ? logout(setUser) : login(setUser))}
              className="login-btn"
            >
              {user ? "Logout" : "Login with ICP"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Welcome to the <span>Decentralized Freelance Platform</span>
        </h1>
        <p className="hero-subtitle">
          Connect with top freelancers or find exciting projects on the ICP blockchain. Secure, transparent, and decentralized.
        </p>
        {!user && (
          <button onClick={() => login(setUser)} className="get-started-btn">
            Get Started Now
          </button>
        )}
      </section>

      {/* Main Content */}
      <main className="main-content">
        {user ? (
          role === "client" ? (
            <ClientDashboard user={user} />
          ) : (
            <FreelancerDashboard user={user} />
          )
        ) : (
          <p>Please log in to access your dashboard.</p>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            © 2025 FreelanceHub. Powered by <span>ICP Blockchain</span>.
          </p>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;