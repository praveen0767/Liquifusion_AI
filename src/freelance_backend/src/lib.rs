use ic_cdk_macros::{init, query, update};
use ic_cdk::api::time;
use candid::{CandidType, Deserialize};
use std::collections::{HashMap, VecDeque};


#[derive(CandidType, Deserialize, Clone)]
pub struct LiquidityPool {
    pub pool_id: String,
    pub token_a: String,
    pub token_b: String,
    pub balance_a: u64,
    pub balance_b: u64,
    pub risk_score: f64,
    pub last_updated: u64,
}


#[derive(CandidType, Deserialize)]
pub struct RiskAssessment {
    pub score: f64,
    pub level: String,
    pub recommendation: String,
}


#[derive(CandidType, Deserialize, Clone)]
pub struct SecurityEvent {
    pub event_type: String,
    pub severity: u8,
    pub timestamp: u64,
    pub details: String,
}


#[derive(CandidType, Deserialize, Clone)]
pub struct DatabaseMetrics {
    pub query_count: u64,
    pub avg_response_time: f64,
    pub cache_hit_ratio: f64,
    pub optimization_suggestions: Vec<String>,
}


#[derive(CandidType, Deserialize)]
pub struct CrossChainTransfer {
    pub from_chain: String,
    pub to_chain: String,
    pub amount: u64,
    pub token_type: String,
    pub ai_approved: bool,
}

thread_local! {
    static POOLS: std::cell::RefCell<HashMap<String, LiquidityPool>> = std::cell::RefCell::new(HashMap::new());
    static SECURITY_EVENTS: std::cell::RefCell<VecDeque<SecurityEvent>> = std::cell::RefCell::new(VecDeque::new());
    static DB_METRICS: std::cell::RefCell<DatabaseMetrics> = std::cell::RefCell::new(DatabaseMetrics {
        query_count: 0,
        avg_response_time: 0.0,
        cache_hit_ratio: 0.85,
        optimization_suggestions: vec![],
    });
}


#[init]
fn init() {
    POOLS.with(|p| {
        p.borrow_mut().insert(
            "sonic_ckBTC_ckETH".to_string(),
            LiquidityPool {
                pool_id: "sonic_ckBTC_ckETH".to_string(),
                token_a: "ckBTC".to_string(),
                token_b: "ckETH".to_string(),
                balance_a: 1_000_000,
                balance_b: 15_000_000,
                risk_score: 0.25,
                last_updated: time(),
            },
        );
    });
}


#[query]
fn get_pools() -> Vec<LiquidityPool> {
    POOLS.with(|p| p.borrow().values().cloned().collect())
}


#[update]
fn ai_risk_assessment(pool_id: String, transaction_amount: u64) -> RiskAssessment {
    // Base risk: transaction size vs pool size
    let base_risk = POOLS.with(|pools| {
        pools.borrow()
            .get(&pool_id)
            .map(|pool| {
                let frac = (transaction_amount as f64)
                    / ((pool.balance_a + pool.balance_b) as f64);
                (frac * 2.0).min(1.0)
            })
            .unwrap_or(0.95)
    });

    
    let sec_risk = SECURITY_EVENTS.with(|ev| {
        let count_high = ev.borrow().iter().filter(|e| e.severity > 7).count();
        (count_high as f64 * 0.05).min(0.5)
    });

    // Database health factor
    let db_factor = DB_METRICS.with(|m| {
        let m = m.borrow();
        if m.avg_response_time < 100.0 && m.cache_hit_ratio > 0.8 {
            1.0
        } else {
            0.8
        }
    });

    let raw = (base_risk + sec_risk) * db_factor;
    let score = raw.min(1.0);

    let (level, recommendation) = if score < 0.3 {
        ("LOW".to_string(), "PROCEED".to_string())
    } else if score < 0.7 {
        ("MEDIUM".to_string(), "REVIEW advised".to_string())
    } else {
        ("HIGH".to_string(), "BLOCK: admin review".to_string())
    };


    if score > 0.7 {
        log_security_event(
            "HIGH_RISK_TX",
            9,
            format!("Pool {} tx {} flagged", pool_id, transaction_amount),
        );
    }

    RiskAssessment { score, level, recommendation }
}


#[query]
fn get_security_events() -> Vec<SecurityEvent> {
    SECURITY_EVENTS.with(|ev| ev.borrow().iter().cloned().collect())
}


#[update]
fn optimize_database_ai() -> DatabaseMetrics {
    DB_METRICS.with(|m| {
        let mut dm = m.borrow_mut();
        dm.query_count += 1;
        if dm.query_count % 50 == 0 {
            dm.optimization_suggestions
                .push("Add index on pool_id".to_string());
            dm.optimization_suggestions
                .push("Enable result caching for queries".to_string());
        }
        if dm.cache_hit_ratio < 0.95 {
            dm.cache_hit_ratio += 0.01;
        }
        dm.avg_response_time = 80.0 + (20.0 * (1.0 - dm.cache_hit_ratio));
        dm.clone()
    })
}

#[update]
async fn execute_cross_chain_transfer(transfer: CrossChainTransfer) -> Result<String, String> {
    let risk = ai_risk_assessment(
        format!("{}_{}", transfer.from_chain, transfer.to_chain),
        transfer.amount,
    );
    if risk.score > 0.8 {
        return Err(format!("Blocked by AI: {}", risk.recommendation));
    }
    let tx_id = format!(
        "tx_{}_{}_{}",
        transfer.from_chain,
        transfer.to_chain,
        time()
    );
    log_security_event(
        "CROSS_CHAIN_TX",
        3,
        format!("{}→{} {} {}", transfer.from_chain, transfer.to_chain, transfer.amount, transfer.token_type),
    );
    Ok(tx_id)
}

#[query]
fn get_supported_chains() -> Vec<String> {
    vec![
        "Bitcoin".to_string(),
        "Ethereum".to_string(),
        "ICP".to_string(),
        "Sonic".to_string(),
    ]
}

fn log_security_event(event_type: &str, severity: u8, details: String) {
    SECURITY_EVENTS.with(|ev| {
        let mut q = ev.borrow_mut();
        q.push_back(SecurityEvent {
            event_type: event_type.to_string(),
            severity,
            timestamp: time(),
            details,
        });
        if q.len() > 100 {
            q.pop_front();
        }
    });
}
