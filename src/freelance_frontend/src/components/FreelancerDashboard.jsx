import React, { useState, useEffect } from "react";
import "./FreelanceDashboard.css";
import { freelance_backend } from "../../../declarations/freelance_backend";

const FreelancerDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [coverLetters, setCoverLetters] = useState({}); // Map jobId -> coverLetter

  useEffect(() => {
    fetchJobs();
    fetchMyJobs();
  }, []);

  // ✅ Fetch ALL jobs (without filtering)
  const fetchJobs = async () => {
    try {
      const jobList = await freelance_backend.get_jobs();
      console.log("Fetched jobs:", jobList); // Debugging
      setJobs(jobList); // No filtering
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const assignedJobs = await freelance_backend.get_freelancer_jobs(user);
      setAppliedJobs(assignedJobs);
    } catch (error) {
      console.error("Error fetching freelancer jobs:", error);
    }
  };

  const handleCoverLetterChange = (jobId, value) => {
    setCoverLetters((prev) => ({
      ...prev,
      [jobId]: value,
    }));
  };

  const [proposals, setProposals] = useState({}); // Store submitted proposals (jobId -> boolean)

  const submitProposal = async (jobId, coverLetter, jobBudget) => {
    try {
      if (!coverLetter) throw new Error("Cover Letter cannot be empty!");
      if (!user) throw new Error("User not authenticated. Please log in.");

      console.log("User Debugging:", user);
      console.log("Type of User:", typeof user);

      let clientId;
      if (typeof user === "string") {
        clientId = user; // ✅ Already a valid Principal ID string
      } else if (user.toText) {
        clientId = user.toText(); // ✅ Convert Principal to text format
      } else {
        throw new Error("Invalid user ID format. Ensure you are logged in.");
      }

      console.log(
        `Submitting proposal for Job ID: ${jobId}, Client ID: ${clientId}`
      );

      const response = await freelance_backend.submit_proposal(
        BigInt(jobId),
        clientId, // ✅ Pass the correctly formatted client ID
        coverLetter,
        BigInt(jobBudget)
      );

      console.log("Proposal Submission Response:", response);

      if ("Ok" in response) {
        alert("Proposal submitted successfully!");
      } else {
        throw new Error(response.Err);
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="freelancer-dashboard">
      <h2>Freelancer Dashboard</h2>

      <h3>My Jobs</h3>

      <h3>All Jobs</h3>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.id}>
              <strong>{job.title}</strong> - {job.description} | Budget:{" "}
              {Number(job.budget)} ICP
              <br />
              {proposals[job.id] ? (
                <p>✅ Proposal submitted. Waiting for client acceptance.</p>
              ) : (
                <>
                  <textarea
                    placeholder="Cover Letter"
                    value={coverLetters[job.id] || ""}
                    onChange={(e) =>
                      handleCoverLetterChange(job.id, e.target.value)
                    }
                  />

                  <button
                    onClick={() =>
                      submitProposal(job.id, coverLetters[job.id], job.budget)
                    }
                  >
                    Submit Proposal
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FreelancerDashboard;
