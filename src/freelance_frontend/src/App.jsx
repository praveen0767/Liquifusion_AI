import React, { useState, useEffect } from "react";
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
    <div>
      <div className="header">
        <button
          onClick={() => setRole(role === "client" ? "freelancer" : "client")}
        >
          Switch to {role === "client" ? "Freelancer" : "Client"}
        </button>
        <button onClick={() => (user ? logout(setUser) : login(setUser))}>
          {user ? "Logout" : "Login with ICP"}
        </button>
      </div>

      <div className="main">
        <h1>Decentralized Freelance Platform</h1>
        {user ? (
          role === "client" ? (
            <ClientDashboard user={user} />
          ) : (
            <FreelancerDashboard user={user} />
          )
        ) : (
          <p>Please log in to continue.</p>
        )}
      </div>
    </div>
  );
};

export default App;
