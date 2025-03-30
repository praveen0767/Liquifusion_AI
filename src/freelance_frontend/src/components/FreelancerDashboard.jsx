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

  const submitProposal = async (jobId, coverLetter) => {
    try {
      if (!coverLetter) {
        throw new Error("Cover Letter cannot be empty!");
      }

      console.log(`Submitting proposal for Job ID: ${jobId}`);

      const freelancerId = "freelancer_123"; // Replace with actual freelancer ID

      const response = await freelance_backend.submit_proposal(
        BigInt(jobId),
        freelancerId,
        coverLetter
      );

      console.log("Proposal Submission Response:", response);

      if ("Ok" in response) {
        alert("Proposal submitted successfully!");
        setProposals((prev) => ({
          ...prev,
          [jobId]: true,
        }));
      } else {
        throw new Error(response.Err);
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      alert(`Error: ${error.message}`);
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
