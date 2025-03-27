import React, { useState, useEffect } from "react";
import { freelance_backend } from "../../../declarations/freelance_backend";
import { Principal } from "@dfinity/principal";

const ClientDashboard = ({ user }) => {
  useEffect(() => {
    console.log("Current User Principal:", user ? user.toString() : "No user");
  }, [user]);

  const [job, setJob] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobList = await freelance_backend.get_jobs();
      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };
  const acceptProposal = async (jobId, freelancer) => {
    try {
      await freelance_backend.accept_proposal(jobId, freelancer);
      alert("Proposal accepted! Chat is now available.");
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  if (!user) {
    alert("User not logged in!");
    return;
  }

  const postJob = async () => {
    try {
      console.log("Job data:", {
        title: job.title,
        description: job.description,
        budget: job.budget,
        deadline: job.deadline,
        user: user ? user.toString() : "No user",
      });
      if (!user) {
        throw new Error("User is not authenticated");
      }
      // Validate all inputs
      if (!job.title) throw new Error("Job title is required");
      if (!job.description) throw new Error("Job description is required");
      if (!job.budget) throw new Error("Budget is required");
      if (!job.deadline) throw new Error("Deadline is required");
      
      // const budgetNum = BigInt(Math.floor(Number(job.budget)));
      const budgetNum = BigInt(job.budget);  // Ensures `nat64`

      // Convert user to string explicitly
      const userPrincipal = user.toString();
  
      console.log("Posting Job with:", {
        title: job.title,
        description: job.description,
        budget: budgetNum,
        deadline: job.deadline,
        userPrincipal
      });
  
      // Call backend method
      const result = await freelance_backend.post_job(
        job.title,
        job.description,
        budgetNum,
        job.deadline,
        userPrincipal
      );
  
      // Handle Result type from Rust backend
      if (result.ok !== undefined) {
        const jobId = result.ok;
        alert(`Job posted successfully! Job ID: ${jobId}`);
        setJob({ title: "", description: "", budget: "", deadline: "" });
        loadJobs();
      } else if (result.err) {
        throw new Error(result.err.message || "Job posting failed");
      }
    } catch (error) {
      console.error("Detailed Error:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      alert(`Job posting failed: ${error.message}`);
 }
};

  return (
    <div>
      <h2>Client Dashboard</h2>

      {/* Post Job Form */}
      <div className="job-form">
        <h3>Post a Job</h3>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={job.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={job.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget (ICP)"
          value={job.budget}
          onChange={handleChange}
        />
        <input
          type="date"
          name="deadline"
          value={job.deadline}
          onChange={handleChange}
        />
        <button onClick={postJob}>Post Job</button>
      </div>

      {/* Job Listings */}
      <div className="job-list">
        <h3>Your Posted Jobs</h3>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          <ul>
            {jobs.map((j, index) => (
              <li key={index}>
                <strong>{j.title}</strong> - {j.description} <br />
                <span>
                  Budget: {j.budget} ICP | Deadline: {j.deadline}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
