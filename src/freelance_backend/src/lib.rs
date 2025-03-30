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
    chat: Option<Chat>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Proposal {
    freelancer: String,
    cover_letter: String,

    is_accepted: bool,
}
#[derive(Clone, Debug, CandidType, Deserialize)]
struct Message {
    sender: String,
    content: String,
    timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Chat {
    participants: Vec<String>,
    messages: Vec<Message>,
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
                chat: None,
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
fn get_jobs_by_client() -> Vec<Job> {
    let client_principal = caller().to_string(); // Get the logged-in user's Principal ID

    JOBS.with(|jobs| {
        jobs.borrow().iter()
            .filter(|job| job.client == client_principal)
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

#[update]
fn submit_proposal(job_id: u64, freelancer: String, cover_letter: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();

        for job in jobs.iter_mut() {
            if job.id == job_id {
                // Check if this freelancer has already submitted a proposal
                if job.proposals.iter().any(|p| p.freelancer == freelancer) {
                    return Err(Error {
                        message: "You have already submitted a proposal for this job".to_string(),
                    });
                }

                // Add new proposal
                job.proposals.push(Proposal {
                    freelancer,
                    cover_letter,
                    is_accepted: false,
                });

                return Ok(true);
            }
        }

        Err(Error {
            message: "Job not found".to_string(),
        })
    })
}

#[update]
fn send_message(job_id: u64, sender: String, content: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        if let Some(job) = jobs.iter_mut().find(|j| j.id == job_id) {
            if let Some(chat) = job.chat.as_mut() {
                if !chat.participants.contains(&sender) {
                    return Err(Error { message: "You are not a participant in this chat".to_string() });
                }

                let timestamp = ic_cdk::api::time(); // Get current timestamp

                chat.messages.push(Message {
                    sender,
                    content,
                    timestamp,
                });

                return Ok(true);
            }
            return Err(Error { message: "Chat not found for this job".to_string() });
        }
        Err(Error { message: "Job not found".to_string() })
    })
}

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

                        // ✅ Automatically start chat when proposal is accepted
                        job.chat = Some(Chat {
                            participants: vec![job.client.clone(), freelancer.clone()],
                            messages: vec![],
                        });

                        ic_cdk::println!(
                            "Chat started between {} and {} for job ID: {}",
                            job.client,
                            freelancer,
                            job.id
                        );

                        return Ok(true);
                    },
                    None => return Err(Error { message: "Proposal not found".to_string() }),
                }
            }
        }
        Err(Error { message: "Job not found".to_string() })
    })
}


#[query]
fn get_chat(job_id: u64) -> Result<Chat, Error> {
    JOBS.with(|jobs| {
        let jobs = jobs.borrow();
        if let Some(job) = jobs.iter().find(|j| j.id == job_id) {
            if let Some(chat) = &job.chat {
                return Ok(chat.clone());
            }
            return Err(Error { message: "Chat not found".to_string() });
        }
        Err(Error { message: "Job not found".to_string() })
    })
}

#[update]
fn reject_proposal(job_id: u64, freelancer: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        if let Some(job) = jobs.iter_mut().find(|j| j.id == job_id) {
            let original_len = job.proposals.len();
            job.proposals.retain(|p| p.freelancer != freelancer);

            ic_cdk::println!(
                "Proposals before: {}, after rejection: {}",
                original_len,
                job.proposals.len()
            );

            if job.proposals.is_empty() {
                ic_cdk::println!("All proposals rejected, job can now be deleted.");
            }

            if job.proposals.len() < original_len {
                return Ok(true);
            } else {
                return Err(Error { message: "Proposal not found".to_string() });
            }
        }
        Err(Error { message: "Job not found".to_string() })
    })
}


#[update]
fn start_chat(job_id: u64, freelancer: String) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        if let Some(job) = jobs.iter_mut().find(|j| j.id == job_id) {
            if job.freelancer.as_ref() != Some(&freelancer) {
                return Err(Error { message: "Freelancer is not assigned to this job".to_string() });
            }

            job.chat = Some(Chat {
                participants: vec![job.client.clone(), freelancer.clone()],
                messages: vec![],
            });

            Ok(true)
        } else {
            Err(Error { message: "Job not found".to_string() })
        }
    })
}


#[update]
fn delete_job(job_id: u64) -> Result<bool, Error> {
    JOBS.with(|jobs| {
        let mut jobs = jobs.borrow_mut();
        if let Some(index) = jobs.iter().position(|job| job.id == job_id) {
            jobs.remove(index); // ✅ Remove job directly, no checks
            ic_cdk::println!("Job deleted successfully.");
            Ok(true)
        } else {
            Err(Error { message: "Job not found".to_string() })
        }
    })
}







export_candid!();
