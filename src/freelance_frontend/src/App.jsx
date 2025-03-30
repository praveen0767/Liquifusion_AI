// src/App.jsx
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
            {
              <button
                onClick={() =>
                  setRole(role === "client" ? "freelancer" : "client")
                }
                className="switch-btn"
              >
                Switch to {role === "client" ? "Freelancer" : "Client"}
              </button>
            }
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
          Connect with top freelancers or find exciting projects on the ICP
          blockchain. Secure, transparent, and decentralized.
        </p>
        {!user && (
          <button onClick={() => login(setUser)} className="get-started-btn">
            Get Started Now
          </button>
        )}
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Why People Choose Us Section */}
        <section className="why-choose-us fade-in">
          <h2 className="section-title">Why People Choose FreelanceHub ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Decentralized & Secure</h3>
              <p>Built on the ICP blockchain for transparency and security.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>No Middleman</h3>
              <p>
                Directly connect with clients or freelancers without
                intermediaries.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💸</div>
              <h3>Fast Payments</h3>
              <p>Instant payments using ICP, no delays or hidden fees.</p>
            </div>
          </div>
        </section>

        <section className="testimonials-section fade-in">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "FreelanceHub made it so easy to find talented freelancers for
                my project. The ICP blockchain ensures everything is secure and
                transparent!"
              </p>
              <p className="testimonial-author">- Sarah M., Client</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "I love how I can connect directly with clients and get paid
                instantly. No more waiting for payments!"
              </p>
              <p className="testimonial-author">- John D., Freelancer</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "The decentralized approach gives me peace of mind. FreelanceHub
                is a game-changer for freelancers!"
              </p>
              <p className="testimonial-author">- Emily R., Freelancer</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "The decentralized approach gives me peace of mind. FreelanceHub
                is a game-changer for freelancers!"
              </p>
              <p className="testimonial-author">- Emily R., Freelancer</p>
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
              <h3 className="faq-question">What is FreelanceHub?</h3>
              <p className="faq-answer">
                FreelanceHub is a decentralized platform on the ICP blockchain
                that connects clients with freelancers securely and
                transparently.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How do I get paid?</h3>
              <p className="faq-answer">
                Payments are made instantly using ICP tokens, ensuring fast and
                secure transactions without intermediaries.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is it safe to use?</h3>
              <p className="faq-answer">
                Yes, our platform leverages the security of the ICP blockchain
                to ensure all transactions and interactions are safe and
                transparent.
              </p>
            </div>

            <section className="cta-section fade-in">
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-subtitle">
                Join FreelanceHub today and experience the future of freelancing
                on the ICP blockchain.
              </p>
              <button onClick={() => login(setUser)} className="cta-btn">
                Join Now
              </button>
            </section>
          </div>
        </section>

        {/* Existing dashboard rendering logic */}
        {user ? (
          role === "client" ? (
            <ClientDashboard user={user} />
          ) : (
            <FreelancerDashboard user={user} />
          )
        ) : (
          <p></p>
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
