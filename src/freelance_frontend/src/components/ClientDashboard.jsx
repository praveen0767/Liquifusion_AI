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
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      console.log("Fetching all jobs...");
      const jobList = await freelance_backend.get_jobs(); // ✅ Get all jobs
      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      console.log(`Attempting to delete job ID: ${jobId}`);
      const result = await freelance_backend.delete_job(jobId);
      console.log("Backend response:", result); // Debugging log

      if (typeof result === "boolean" && result) {
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

  const postJob = async () => {
    try {
      if (!job.title || !job.description || !job.budget || !job.deadline) {
        throw new Error("All fields are required");
      }

      const budgetNum = Number(job.budget);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        throw new Error("Budget must be a positive number");
      }

      const clientId = user.toString();
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
        <h3>All Jobs</h3>
        {jobs.length === 0 ? (
          <p>No jobs available yet.</p>
        ) : (
          jobs.map(
            (
              job // ✅ No extra {}
            ) => (
              <div key={job.id} className="job-item">
                <h4>{job.title}</h4>
                <p>{job.description}</p>
                <p>
                  Budget: {job.budget} ICP | Deadline: {job.deadline}
                </p>

                <button
                  onClick={() => {
                    if (!job.freelancer) {
                      alert(
                        "You cannot delete this job until a freelancer has accepted it and not done according to your expectations."
                      );
                    } else {
                      deleteJob(job.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
