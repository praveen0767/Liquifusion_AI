import React, { useState, useEffect } from "react";
import "./FreelanceDashboard.css"; // Import the CSS file
import { freelance_backend } from "../../../declarations/freelance_backend";

const FreelancerDashboard = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchMyJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobList = await freelance_backend.get_jobs();
      setJobs(jobList.filter((job) => !job.freelancer));
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

  const submitProposal = async (jobId, expectedBudget) => {
    try {
      await freelance_backend.submit_proposal(
        jobId,
        user,
        coverLetter,
        expectedBudget
      );
      alert("Proposal submitted successfully!");
    } catch (error) {
      console.error("Error submitting proposal:", error);
    }
  };

  return (
    <div className="freelancer-dashboard">
      <h2>Freelancer Dashboard</h2>

      <h3>Available Jobs</h3>
      {jobs.length === 0 ? (
        <p>No available jobs.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.id}>
              <strong>{job.title}</strong> - {job.description} | Budget:{" "}
              {job.budget} ICP
              <br />
              <textarea
                placeholder="Cover Letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <button onClick={() => submitProposal(job.id, job.budget)}>
                Submit Proposal
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FreelancerDashboard;
