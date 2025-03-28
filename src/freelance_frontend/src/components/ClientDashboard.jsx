import React, { useState, useEffect } from "react";
import "./ClientDashboard.css";
import { freelance_backend } from "../../../declarations/freelance_backend";

const ClientDashboard = ({ user }) => {
  const [job, setJob] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (user) {
      console.log("Current User Principal:", user.toString());
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      if (!user) {
        console.error("User not found. Please log in.");
        return;
      }
      const principalId = user.toString(); // Convert Principal ID to string

      console.log("Fetching jobs for freelancer:", principalId);
      const jobList = await freelance_backend.get_jobs_by_principal(); // Call new function
      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const client = user.toString();
      console.log(`Attempting to delete job ID: ${jobId}`);

      const result = await freelance_backend.delete_job(jobId, client);

      if (typeof result === "object" && result.ok) {
        alert("Job deleted successfully!");
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      } else {
        throw new Error(result.err?.message || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  if (!user) {
    return <p>Please log in to access the client dashboard.</p>;
  }

  const postJob = async () => {
    try {
      if (!job.title || !job.description || !job.budget || !job.deadline) {
        throw new Error("All fields are required");
      }

      const budgetNum = Number(job.budget);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        throw new Error("Budget must be a positive number");
      }

      const userPrincipal = user.toString();
      const clientId = userPrincipal;
      console.log(
        "Posting job:",
        job.title,
        job.description,
        budgetNum,
        job.deadline,
        clientId
      );

      const result = await freelance_backend.post_job(
        job.title,
        job.description,
        budgetNum,
        job.deadline,
        clientId
      );

      if (typeof result === "object" && result.err) {
        throw new Error(result.err.message || "Job posting failed");
      }

      alert(`Job posted successfully! Job ID: ${result}`);
      setJob({ title: "", description: "", budget: "", deadline: "" });
      loadJobs();
    } catch (error) {
      console.error("Job posting error:", error);
      alert(`Job posting failed: ${error.message}`);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await postJob();
  };

  return (
    <div className="client-dashboard">
      <h2>Client Dashboard</h2>

      <div className="job-form">
        <h3>Post a Job</h3>
        <form onSubmit={onSubmit}>
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
          <button type="submit">Post Job</button>
        </form>
      </div>

      <div className="job-list">
        <h3>Your Jobs</h3>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="job-item">
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p>
                Budget: {job.budget} ICP | Deadline: {job.deadline}
              </p>
              <p>Status: {job.status}</p>
              <button onClick={() => deleteJob(job.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
