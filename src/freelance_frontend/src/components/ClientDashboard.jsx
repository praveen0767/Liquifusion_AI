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
      const jobList = await freelance_backend.get_jobs();

      // Debugging: Log each job and its proposals
      jobList.forEach((job) => {
        console.log(`Job ID: ${job.id}`);
        console.log("Proposals:", job.proposals); // Log proposals
      });

      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };
  const fetchMyJobs = async () => {
    try {
      const assignedJobs = await freelance_backend.get_jobs(user);
      setJobs(assignedJobs);
    } catch (error) {
      console.error("Error fetching client jobs:", error);
    }
  };

  const loadChat = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const response = await freelance_backend.get_chat(BigInt(jobId));
      if ("Ok" in response) {
        setChat(response.Ok.messages);
      } else {
        throw new Error(response.Err);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  // ✅ Send a message
  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const response = await freelance_backend.send_message(
        BigInt(selectedJobId),
        userPrincipal,
        message
      );
      if ("Ok" in response) {
        console.log("Message sent successfully!");
        setMessage("");
        loadChat(selectedJobId);
      } else {
        throw new Error(response.Err);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const acceptProposal = async (jobId, freelancerId) => {
    try {
      console.log(
        `Accepting proposal for Job ID: ${jobId}, Freelancer: ${freelancerId}`
      );

      const response = await freelance_backend.accept_proposal(
        BigInt(jobId),
        freelancerId
      );

      if ("Ok" in response) {
        alert("Proposal accepted successfully! Chat started.");
        await loadJobs(); // ✅ Refresh job list after accepting proposal
      } else {
        throw new Error(response.Err);
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const rejectProposal = async (jobId, freelancerId) => {
    try {
      console.log(
        `Rejecting proposal for Job ID: ${jobId}, Freelancer: ${freelancerId}`
      );

      const response = await freelance_backend.reject_proposal(
        BigInt(jobId),
        freelancerId
      );

      if ("Ok" in response) {
        alert("Proposal rejected successfully!");
        await loadJobs(); // ✅ Refresh job list after rejection
      } else {
        throw new Error(response.Err);
      }
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      alert(`Error: ${error.message}`);
    }
  };
  const deleteJob = async (jobId) => {
    try {
      await freelance_backend.delete_job(BigInt(jobId)); // ✅ Call backend

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId)); // ✅ Remove from UI instantly

      alert("Job deleted successfully!");
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
        <h3>Your Jobs</h3>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="job-item">
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p>
                💰 Budget: {Number(job.budget) || 0} ICP | 📅 Deadline:{" "}
                {job.deadline}
              </p>

              {job.proposals && job.proposals.length > 0 ? (
                <ul className="proposal-list">
                  {job.proposals.map((proposal, index) => (
                    <li key={index} className="proposal-item">
                      <p>
                        📩 From: {proposal.freelancer?.toString() || "Unknown"}
                      </p>
                      <p>
                        💬 Cover Letter:{" "}
                        {proposal.cover_letter || "No cover letter provided"}
                      </p>
                      <div className="proposal-buttons">
                        <button
                          className="accept-btn"
                          onClick={() =>
                            acceptProposal(job.id, proposal.freelancer)
                          }
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() =>
                            rejectProposal(job.id, proposal.freelancer)
                          }
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No proposals yet.</p>
              )}

              {/* 🔹 Delete job button */}
              <button
                className="delete-btn"
                onClick={() => deleteJob(job.id)} // ✅ Directly delete job
              >
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
