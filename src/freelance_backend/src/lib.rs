use candid::{CandidType, Deserialize};
use ic_cdk_macros::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk::export_candid;
use ic_cdk::api::caller;

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

// ✅ Client posts a job
#[update]
fn post_job(title: String, description: String, budget: u64, deadline: String, client: String) -> Result<u64, Error> {
    JOBS.with(|jobs| {
        JOB_ID_COUNTER.with(|counter| {
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
                funded: false,
            };

            jobs.borrow_mut().push(new_job);
            *job_id_counter += 1;

            Ok(*job_id_counter - 1)
        })
    })
}

// ✅ Fetch all jobs
#[query]
fn get_jobs() -> Vec<Job> {
    JOBS.with(|jobs| jobs.borrow().clone())
}

#[query]
fn get_jobs_by_principal() -> Vec<Job> {
    let user_principal = caller().to_string(); // Get the logged-in user's Principal ID

    JOBS.with(|jobs| {
        jobs.borrow().iter()
            .filter(|job| job.freelancer.as_ref().map_or(false, |f| f == &user_principal))
            .cloned()
            .collect()
    })
}
// ✅ Fetch freelancer jobs
#[query]
fn get_freelancer_jobs(freelancer: String) -> Vec<Job> {
    JOBS.with(|jobs| {
        jobs.borrow().iter()
            .filter(|job| job.freelancer == Some(freelancer.clone()))
            .cloned()
            .collect()
    })
}

// ✅ Freelancer submits a proposal
#[update]
fn submit_proposal(job_id: u64, freelancer: String, cover_letter: String, expected_budget: u64) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        for job in jobs.iter_mut() {
            if job.id == job_id {
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
                if job.freelancer.is_some() {
                    return Err(Error { message: "Job already has a freelancer".to_string() });
                }
                
                let proposal_index = job.proposals.iter_mut()
                    .position(|p| p.freelancer == freelancer);
                
                match proposal_index {
                    Some(index) => {
                        job.proposals[index].is_accepted = true;
                        job.freelancer = Some(freelancer.clone());

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

// ✅ Delete a job
#[update]
fn delete_job(job_id: u64, client: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        if let Some(index) = jobs.iter().position(|job| job.id == job_id && job.client == client) {
            jobs.remove(index);
            Ok(true)
        } else {
            Err(Error { message: "Job not found or unauthorized".to_string() })
        }
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
                job.funded = true;
                return Ok(true);
            }
        }
        Err(Error { message: "Job not found or unauthorized".to_string() })
    })
}

export_candid!();
