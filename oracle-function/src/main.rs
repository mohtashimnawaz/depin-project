use switchboard_solana::prelude::*;
// Explicit path for v0.29 to avoid "undeclared type" errors
use switchboard_solana::attestation_program::FunctionRunner;
use solana_sdk::instruction::{Instruction, AccountMeta};
use solana_sdk::pubkey::Pubkey;
use std::sync::Arc;
use std::str::FromStr;

#[tokio::main]
async fn main() {
    match run_oracle().await {
        Ok(_) => println!("✅ Oracle executed successfully."),
        Err(e) => {
            eprintln!("❌ Oracle Error: {:?}", e);
            std::process::exit(1);
        }
    }
}

async fn run_oracle() -> std::result::Result<(), Box<dyn std::error::Error>> {
    
    // Initialize Runner using the direct path
    let runner = Arc::new(FunctionRunner::from_env().unwrap());

    println!("Oracle Signer: {}", runner.enclave_signer.pubkey());

    // DePIN Logic
    let user_lat = 34.0522;
    let user_long = -118.2437;
    println!("Verifying DePIN activity at {}, {}", user_lat, user_long);

    // Target Program ID
    let program_id = Pubkey::from_str("11111111111111111111111111111111")
        .map_err(|e| format!("Invalid Program ID: {}", e))?;

    // Discriminator
    let discriminator = get_anchor_discriminator("global:reward_user");

    // Instruction
    let reward_ix = Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(runner.enclave_signer.pubkey(), true),
        ],
        data: discriminator.to_vec(), 
    };

    // Emit
    runner.emit(vec![reward_ix]).await.map_err(|e| format!("Emit Error: {:?}", e))?;

    Ok(())
}

fn get_anchor_discriminator(preimage: &str) -> [u8; 8] {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(preimage.as_bytes());
    let hash = hasher.finalize();
    let mut discriminator = [0u8; 8];
    discriminator.copy_from_slice(&hash[..8]);
    discriminator
}