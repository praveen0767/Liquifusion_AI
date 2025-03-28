import React, { useState, useEffect } from "react";
import "./ClientDashboard.css";
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

  const deleteJob = async (jobId) => {
    try {
      console.log(`Attempting to delete job ID: ${jobId}`);

    const result = await freelance_backend.delete_job(jobId);

    console.log("Backend response:", result);

    if (result === true || result.ok) {  // Handle both `true` and `Result` types
      alert("Job deleted successfully!");
      setJobs((prevJobs) => prevJobs.filter((job) => job.jobId !== jobId)); // Update UI
    } else {
      throw new Error(result.err || "Failed to delete job");
    }
  } catch (error) {
    console.error("Error deleting job:", error);
    alert(`Error: ${error.message}`);
  }
  };
  

  const raiseDispute = async (jobId) => {
    try {
      await freelance_backend.raise_dispute(jobId);
      alert("Dispute raised successfully!");
    } catch (error) {
      console.error("Error raising dispute:", error);
    }
  };

  const lockFunds = async (jobId) => {
    try {
      await freelance_backend.lock_funds(jobId);
      alert("Funds locked successfully!");
    } catch (error) {
      console.error("Error locking funds:", error);
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
      if (!user) throw new Error("User is not authenticated");
      if (!job.title || !job.description || !job.budget || !job.deadline)
        throw new Error("All fields are required");

      const budgetNum = BigInt(job.budget);
      const userPrincipal = user.toString();

      const result = await freelance_backend.post_job(
        job.title,
        job.description,
        budgetNum,
        job.deadline,
        userPrincipal
      );

      if (result.ok !== undefined) {
        alert(`Job posted successfully! Job ID: ${result.ok}`);
        setJob({ title: "", description: "", budget: "", deadline: "" });
        loadJobs();
      } else {
        throw new Error(result.err.message || "Job posting failed");
      }
    } catch (error) {
      console.error("Job posting error:", error);
      alert(`Job posting failed: ${error.message}`);
    }
  };

  return (
    <div className="client-dashboard">
      <h2>Client Dashboard</h2>

      <div className="job-form">
        <h3>Post a Job</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            postJob();
          }}
        >
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={job.title}
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
          <textarea
            name="description"
            placeholder="Job Description"
            value={job.description}
            onChange={handleChange}
          />
          <button type="submit">Post Job</button>
        </form>
      </div>

      <div className="job-list">
        <h3>Your Posted Jobs</h3>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          <ul>
            {jobs.map((j, index) => (
              <li key={index}>
                <strong>{j.title}</strong>  {j.description} <br />
                <span>
                  Budget: {j.budget} ICP | Deadline: {j.deadline}
                </span>
                <br />
                <button onClick={() => deleteJob(j.jobId)}>Delete</button>
                <button onClick={() => raiseDispute(j.jobId)}>
                  Raise Dispute
                </button>
                <button onClick={() => lockFunds(j.jobId)}>Lock Funds</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
