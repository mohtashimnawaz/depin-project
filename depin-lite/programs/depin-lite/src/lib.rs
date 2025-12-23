use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

declare_id!("7nMrAY8nNgHcyAimQJgrzM5LisT2jVaNRX2s6hvnNsxU");

#[program]
pub mod depin_lite {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.authority = authority;
        program_state.map_mint = ctx.accounts.map_mint.key();
        program_state.total_rewards_distributed = 0;
        program_state.bump = ctx.bumps.program_state;
        
        msg!("DePIN Lite program initialized with authority: {:?}", authority);
        Ok(())
    }

    pub fn submit_activity(
        ctx: Context<SubmitActivity>,
        gps_lat: f64,
        gps_long: f64,
        signal_strength: i8,
    ) -> Result<()> {
        let user_activity = &mut ctx.accounts.user_activity;
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;

        // Check cooldown period (1 hour = 3600 seconds)
        if user_activity.last_submission_timestamp > 0 {
            let time_since_last = current_timestamp - user_activity.last_submission_timestamp;
            require!(time_since_last >= 3600, ErrorCode::CooldownNotMet);
        }

        // Check daily cap (24 submissions per day max)
        let current_day = current_timestamp / 86400; // 86400 seconds in a day
        let last_submission_day = user_activity.last_submission_timestamp / 86400;
        
        if current_day == last_submission_day {
            require!(user_activity.daily_submissions < 24, ErrorCode::DailyCapExceeded);
        } else {
            // Reset daily counter for new day
            user_activity.daily_submissions = 0;
        }

        // Validate GPS coordinates (basic range check)
        require!(
            gps_lat >= -90.0 && gps_lat <= 90.0 && gps_long >= -180.0 && gps_long <= 180.0,
            ErrorCode::InvalidGpsCoordinates
        );

        // Validate signal strength (typical WiFi range: -100 to 0 dBm)
        require!(
            signal_strength >= -100 && signal_strength <= 0,
            ErrorCode::InvalidSignalStrength
        );

        // Store the activity data for oracle verification
        user_activity.user = ctx.accounts.user.key();
        user_activity.gps_lat = gps_lat;
        user_activity.gps_long = gps_long;
        user_activity.signal_strength = signal_strength;
        user_activity.last_submission_timestamp = current_timestamp;
        user_activity.daily_submissions += 1;
        user_activity.total_submissions += 1;
        user_activity.pending_verification = true;
        user_activity.bump = ctx.bumps.user_activity;

        msg!(
            "Activity submitted - GPS: ({}, {}), Signal: {} dBm",
            gps_lat,
            gps_long,
            signal_strength
        );

        Ok(())
    }

    pub fn verify_and_reward(ctx: Context<VerifyAndReward>) -> Result<()> {
        let user_activity = &mut ctx.accounts.user_activity;

        // Verify the activity is pending verification
        require!(user_activity.pending_verification, ErrorCode::NoPendingVerification);

        // For now, we'll implement a simple verification system
        // In production, this would integrate with Switchboard oracles
        
        // Simple verification: check if the submission is older than 1 minute
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        let submission_age = current_timestamp - user_activity.last_submission_timestamp;
        
        // Require at least 1 minute for "verification" (simulating oracle processing time)
        require!(submission_age >= 60, ErrorCode::VerificationTooSoon);

        // Mint MAP tokens as reward (5 tokens with 6 decimals = 5_000_000)
        let reward_amount = 5_000_000u64;
        
        let program_state_bump = ctx.accounts.program_state.bump;
        let seeds = &[
            b"program_state".as_ref(),
            &[program_state_bump],
        ];
        let signer = &[&seeds[..]];

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.map_mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.program_state.to_account_info(),
                },
                signer,
            ),
            reward_amount,
        )?;

        // Update state
        user_activity.pending_verification = false;
        user_activity.total_rewards_earned += reward_amount;
        ctx.accounts.program_state.total_rewards_distributed += reward_amount;

        msg!("Activity verified and {} MAP tokens rewarded", reward_amount / 1_000_000);

        Ok(())
    }

    pub fn create_map_mint(ctx: Context<CreateMapMint>) -> Result<()> {
        msg!("MAP token mint created: {:?}", ctx.accounts.map_mint.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + ProgramState::INIT_SPACE,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub map_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitActivity<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserActivity::INIT_SPACE,
        seeds = [b"user_activity", user.key().as_ref()],
        bump
    )]
    pub user_activity: Account<'info, UserActivity>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyAndReward<'info> {
    #[account(
        mut,
        seeds = [b"user_activity", user.key().as_ref()],
        bump = user_activity.bump
    )]
    pub user_activity: Account<'info, UserActivity>,
    
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub map_mint: Account<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = map_mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMapMint<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 6,
        mint::authority = program_state,
    )]
    pub map_mint: Account<'info, Mint>,
    
    #[account(
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub authority: Pubkey,
    pub map_mint: Pubkey,
    pub total_rewards_distributed: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserActivity {
    pub user: Pubkey,
    pub gps_lat: f64,
    pub gps_long: f64,
    pub signal_strength: i8,
    pub last_submission_timestamp: i64,
    pub daily_submissions: u8,
    pub total_submissions: u64,
    pub total_rewards_earned: u64,
    pub pending_verification: bool,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Cooldown period not met. Wait 1 hour between submissions.")]
    CooldownNotMet,
    #[msg("Daily submission cap exceeded. Maximum 24 submissions per day.")]
    DailyCapExceeded,
    #[msg("Invalid GPS coordinates. Latitude must be -90 to 90, longitude -180 to 180.")]
    InvalidGpsCoordinates,
    #[msg("Invalid signal strength. Must be between -100 and 0 dBm.")]
    InvalidSignalStrength,
    #[msg("No pending verification for this user.")]
    NoPendingVerification,
    #[msg("Verification too soon. Wait at least 1 minute after submission.")]
    VerificationTooSoon,
}
