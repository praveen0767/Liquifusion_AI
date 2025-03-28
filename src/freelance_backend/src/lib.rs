use candid::{CandidType, Deserialize};
use ic_cdk_macros::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk::export_candid;

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
enum JobStatus {
    Open,
    InProgress,
    Completed,
    Cancelled,
    Disputed,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Job {
    id: u64,
    title: String,
    description: String,
    budget: u64,
    deadline: String,
    client: String,
    freelancer: Option<String>, 
    proposals: Vec<Proposal>,
    status: JobStatus,
    funded: bool,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Proposal {
    freelancer: String,
    cover_letter: String,
    expected_budget: u64,
    is_accepted: bool,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Message {
    sender: String,
    content: String,
    timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Error {
    message: String,
}

thread_local! {
    static JOBS: RefCell<Vec<Job>> = RefCell::new(Vec::new());
    static CHAT_HISTORY: RefCell<HashMap<u64, Vec<Message>>> = RefCell::new(HashMap::new());
    static JOB_ID_COUNTER: RefCell<u64> = RefCell::new(1);
}

// Validation functions
fn validate_job_posting(title: &str, description: &str, budget: u64, _deadline: &str, client: &str) -> Result<(), Error> {
    if title.is_empty() || title.len() > 100 {
        return Err(Error { message: "Job title must be between 1 and 100 characters".to_string() });
    }
    
    if description.is_empty() || description.len() > 1000 {
        return Err(Error { message: "Job description must be between 1 and 1000 characters".to_string() });
    }
    
    if budget == 0 {
        return Err(Error { message: "Budget must be greater than 0".to_string() });
    }
    
    if client.is_empty() {
        return Err(Error { message: "Client name cannot be empty".to_string() });
    }
    
    Ok(())
}

fn validate_proposal(_job_id: u64, freelancer: &str, cover_letter: &str, expected_budget: u64) -> Result<(), Error> {
    if freelancer.is_empty() {
        return Err(Error { message: "Freelancer name cannot be empty".to_string() });
    }
    
    if cover_letter.is_empty() || cover_letter.len() > 500 {
        return Err(Error { message: "Cover letter must be between 1 and 500 characters".to_string() });
    }
    
    if expected_budget == 0 {
        return Err(Error { message: "Expected budget must be greater than 0".to_string() });
    }
    
    Ok(())
}

// ✅ Client posts a job
#[update]
fn post_job(title: String, description: String, budget: u64, deadline: String, client: String) -> Result<u64, Error> {
    // Validate input
    validate_job_posting(&title, &description, budget, &deadline, &client)?;
    if title.len() > 100 {
        return Err(Error { 
            message: format!("Title too long. Max 100 chars, got {}", title.len()) 
        });
    }
    JOBS.with(|jobs| {
        JOB_ID_COUNTER.with(|counter| {
            let mut jobs = jobs.borrow_mut();
            let mut job_id_counter = counter.borrow_mut();

            let new_job = Job {
                id: *job_id_counter,
                title,
                description,
                budget,
                deadline,
                client,
                freelancer: None,
                proposals: Vec::new(),
                status: JobStatus::Open,
                funded: false,
            };

            jobs.push(new_job);
            *job_id_counter += 1;

            Ok(*job_id_counter - 1)
        })
    })
}

// ✅ Fetch all jobs with optional filtering
#[query]
fn get_jobs(status: Option<JobStatus>) -> Vec<Job> {
    JOBS.with(|jobs| {
        let jobs_ref = jobs.borrow();
        if let Some(filter_status) = status {
            jobs_ref.iter()
                .filter(|job| job.status == filter_status)
                .cloned()
                .collect()
        } else {
            jobs_ref.clone()
        }
    })
}
#[query]
fn get_freelancer_jobs(freelancer: String) -> Vec<Job> {
    JOBS.with(|jobs| {
        jobs.borrow().iter().filter(|job| job.freelancer == Some(freelancer.clone())).cloned().collect()
    })
}

// ✅ Freelancer submits a proposal
#[update]
fn submit_proposal(job_id: u64, freelancer: String, cover_letter: String, expected_budget: u64) -> Result<bool, Error> {
    // Validate input
    validate_proposal(job_id, &freelancer, &cover_letter, expected_budget)?;
    
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        for job in jobs.iter_mut() {
            if job.id == job_id {
                // Check if job is still open
                if job.status != JobStatus::Open {
                    return Err(Error { message: "Cannot submit proposal to a closed job".to_string() });
                }
                
                // Prevent duplicate proposals from the same freelancer
                if job.proposals.iter().any(|p| p.freelancer == freelancer) {
                    return Err(Error { message: "You have already submitted a proposal for this job".to_string() });
                }
                
                job.proposals.push(Proposal {
                    freelancer,
                    cover_letter,
                    expected_budget,
                    is_accepted: false,
                });
                return Ok(true);
            }
        }
        Err(Error { message: "Job not found".to_string() })
    })
}

// ✅ Client accepts a freelancer's proposal
#[update]
fn accept_proposal(job_id: u64, freelancer: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        for job in jobs.iter_mut() {
            if job.id == job_id {
                // Check if job is still open
                if job.status != JobStatus::Open {
                    return Err(Error { message: "Cannot accept proposal for a closed job".to_string() });
                }
                
                // Check if the job already has a freelancer
                if job.freelancer.is_some() {
                    return Err(Error { message: "Job already has a freelancer".to_string() });
                }
                
                // Find and mark the specific proposal as accepted
                let proposal_index = job.proposals.iter_mut()
                    .position(|p| p.freelancer == freelancer);
                
                match proposal_index {
                    Some(index) => {
                        job.proposals[index].is_accepted = true;
                        job.freelancer = Some(freelancer.clone());
                        job.status = JobStatus::InProgress;
                        
                        // Initialize chat history
                        CHAT_HISTORY.with(|chat| {
                            chat.borrow_mut().insert(job_id, vec![]);
                        });
                        
                        return Ok(true);
                    },
                    None => return Err(Error { message: "Proposal not found".to_string() }),
                }
            }
        }
        Err(Error { message: "Job not found".to_string() })
    })
}

// ✅ Send message in chat
#[update]
fn send_message(job_id: u64, sender: String, content: String, timestamp: u64) -> Result<bool, Error> {
    // Validate message content
    if content.is_empty() || content.len() > 1000 {
        return Err(Error { message: "Message must be between 1 and 1000 characters".to_string() });
    }
    
    let job_exists = JOBS.with(|jobs| {
        let jobs_ref = jobs.borrow();
        // Verify job exists and is in progress
        jobs_ref.iter().any(|job| 
            job.id == job_id && 
            (job.status == JobStatus::InProgress || job.status == JobStatus::Open)
        )
    });
    
    if !job_exists {
        return Err(Error { message: "Job not found or not active".to_string() });
    }
    
    CHAT_HISTORY.with(|chat| {
        let mut chat = chat.borrow_mut();
        if let Some(messages) = chat.get_mut(&job_id) {
            messages.push(Message { sender, content, timestamp });
            Ok(true)
        } else {
            Err(Error { message: "Chat history not initialized".to_string() })
        }
    })
}

// ✅ Get chat history for a job
#[query]
fn get_chat(job_id: u64) -> Result<Vec<Message>, Error> {
    CHAT_HISTORY.with(|chat| {
        chat.borrow()
            .get(&job_id)
            .cloned()
            .ok_or_else(|| Error { message: "No chat history found for this job".to_string() })
    })
}

// ✅ Mark job as completed
#[update]
fn complete_job(job_id: u64, user: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        for job in jobs.iter_mut() {
            if job.id == job_id {
                // Verify the user is either the client or the freelancer
                if job.client != user && job.freelancer.as_ref().unwrap_or(&"".to_string()) != &user {
                    return Err(Error { message: "Only the client or freelancer can complete this job".to_string() });
                }
                
                // Check if job is in progress
                if job.status != JobStatus::InProgress {
                    return Err(Error { message: "Job must be in progress to be completed".to_string() });
                }
                
                job.status = JobStatus::Completed;
                return Ok(true);
            }
        }
        Err(Error { message: "Job not found".to_string() })
    })
}


#[update]
fn delete_job(job_id: u64, client: String) -> bool {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        if let Some(index) = jobs.iter().position(|job| job.id == job_id && job.client == client) {
            jobs.remove(index);
            true // Job deleted successfully
        } else {
            false // Job not found or unauthorized
        }
    })
}




// ✅ Mark job as disputed
#[update]
fn dispute_job(job_id: u64, user: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        for job in jobs.iter_mut() {
            if job.id == job_id {
                if job.client != user && job.freelancer.as_ref().unwrap_or(&"".to_string()) != &user {
                    return Err(Error { message: "Only the client or freelancer can dispute this job".to_string() });
                }
                if job.status != JobStatus::InProgress {
                    return Err(Error { message: "Only ongoing jobs can be disputed".to_string() });
                }
                job.status = JobStatus::Disputed;
                return Ok(true);
            }
        }
        Err(Error { message: "Job not found".to_string() })
    })
}

// ✅ Fund a job (Placeholder for ICP token transfer integration)
#[update]
fn fund_job(job_id: u64, client: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        for job in jobs.iter_mut() {
            if job.id == job_id && job.client == client {
                if job.funded {
                    return Err(Error { message: "Job is already funded".to_string() });
                }
                // TODO: Integrate ICP token transfer logic
                job.funded = true;
                return Ok(true);
            }
        }
        Err(Error { message: "Job not found or unauthorized".to_string() })
    })
}

export_candid!();