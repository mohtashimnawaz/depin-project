#!/usr/bin/env ts-node
/**
 * Basic usage example for DePIN Lite program
 * This script demonstrates how to:
 * 1. Initialize the program
 * 2. Submit activity data
 * 3. Check user statistics
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { DepinClient, validateActivityData } from '../client/depin-client';
import * as fs from 'fs';

// Configuration
const RPC_URL = "http://localhost:8899"; // Use devnet or mainnet for production
const PROGRAM_ID = "7nMrAY8nNgHcyAimQJgrzM5LisT2jVaNRX2s6hvnNsxU";

async function main() {
  console.log("🚀 DePIN Lite Basic Usage Example\n");

  // 1. Setup connection and wallet
  const connection = new Connection(RPC_URL);
  
  // Load or create keypairs (in production, use secure key management)
  const authority = Keypair.generate();
  const user = Keypair.generate();
  const mapMintKeypair = Keypair.generate();

  console.log("📋 Setup:");
  console.log(`Authority: ${authority.publicKey.toString()}`);
  console.log(`User: ${user.publicKey.toString()}`);
  console.log(`MAP Mint: ${mapMintKeypair.publicKey.toString()}\n`);

  // Airdrop SOL for testing (localnet only)
  if (RPC_URL.includes("localhost")) {
    console.log("💰 Airdropping SOL for testing...");
    await connection.requestAirdrop(authority.publicKey, 2e9); // 2 SOL
    await connection.requestAirdrop(user.publicKey, 1e9); // 1 SOL
    
    // Wait for confirmations
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("✅ Airdrop completed\n");
  }

  // 2. Create DePIN client
  const wallet = new Wallet(authority);
  const client = new DepinClient(
    connection,
    wallet,
    new PublicKey(PROGRAM_ID)
  );

  try {
    // 3. Initialize program (only needed once)
    console.log("🔧 Initializing program...");
    
    // Create MAP token mint
    const createMintTx = await client.createMapMint(mapMintKeypair, authority);
    console.log(`MAP mint created: ${createMintTx}`);
    
    // Initialize program state
    const initTx = await client.initialize(
      authority.publicKey,
      mapMintKeypair.publicKey,
      authority
    );
    console.log(`Program initialized: ${initTx}\n`);

    // 4. Submit activity data
    console.log("📍 Submitting activity data...");
    
    const activityData = {
      gpsLat: 37.7749,    // San Francisco
      gpsLong: -122.4194,
      signalStrength: -45  // Good WiFi signal
    };

    // Validate data before submission
    const validation = validateActivityData(activityData);
    if (!validation.valid) {
      console.error("❌ Invalid activity data:", validation.errors);
      return;
    }

    // Check if user can submit
    const canSubmit = await client.canSubmitActivity(user.publicKey);
    if (!canSubmit.canSubmit) {
      console.error(`❌ Cannot submit: ${canSubmit.reason}`);
      if (canSubmit.nextSubmissionTime) {
        console.log(`Next submission allowed at: ${canSubmit.nextSubmissionTime}`);
      }
      return;
    }

    // Submit activity
    const submitTx = await client.submitActivity(activityData, user);
    console.log(`✅ Activity submitted: ${submitTx}`);
    console.log(`GPS: (${activityData.gpsLat}, ${activityData.gpsLong})`);
    console.log(`Signal: ${activityData.signalStrength} dBm\n`);

    // 5. Check user statistics
    console.log("📊 User Statistics:");
    const stats = await client.getUserStats(user.publicKey);
    console.log(`Total Submissions: ${stats.totalSubmissions}`);
    console.log(`Daily Submissions: ${stats.dailySubmissions}`);
    console.log(`Total Rewards Earned: ${stats.totalRewardsEarned} MAP`);
    console.log(`Current MAP Balance: ${stats.mapBalance} MAP`);
    console.log(`Last Submission: ${stats.lastSubmissionTime || 'Never'}`);
    console.log(`Pending Verification: ${stats.pendingVerification ? 'Yes' : 'No'}\n`);

    // 6. Check program state
    console.log("🏛️ Program State:");
    const programState = await client.getProgramState();
    console.log(`Authority: ${programState.authority.toString()}`);
    console.log(`MAP Mint: ${programState.mapMint.toString()}`);
    console.log(`Total Rewards Distributed: ${programState.totalRewardsDistributed.toNumber() / 1_000_000} MAP\n`);

    // 7. Demonstrate cooldown
    console.log("⏰ Testing cooldown period...");
    const canSubmitAgain = await client.canSubmitActivity(user.publicKey);
    if (!canSubmitAgain.canSubmit) {
      console.log(`✅ Cooldown working: ${canSubmitAgain.reason}`);
      if (canSubmitAgain.nextSubmissionTime) {
        console.log(`Next submission allowed at: ${canSubmitAgain.nextSubmissionTime}`);
      }
    } else {
      console.log("⚠️ No cooldown detected (unexpected)");
    }

    console.log("\n🎉 Example completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Set up Switchboard Function for oracle verification");
    console.log("2. Call verify_and_reward to process pending submissions");
    console.log("3. Integrate with mobile app for real GPS/WiFi data");

  } catch (error) {
    console.error("❌ Error:", error);
    
    // Common error handling
    if (error.message.includes("CooldownNotMet")) {
      console.log("💡 Tip: Wait 1 hour between submissions");
    } else if (error.message.includes("DailyCapExceeded")) {
      console.log("💡 Tip: Maximum 24 submissions per day");
    } else if (error.message.includes("InvalidGpsCoordinates")) {
      console.log("💡 Tip: Check GPS coordinates are within valid ranges");
    } else if (error.message.includes("InvalidSignalStrength")) {
      console.log("💡 Tip: WiFi signal strength must be between -100 and 0 dBm");
    }
  }
}

// Helper function to simulate multiple users
async function simulateMultipleUsers() {
  console.log("\n🔄 Simulating multiple users...");
  
  const connection = new Connection(RPC_URL);
  const authority = Keypair.generate();
  const wallet = new Wallet(authority);
  const client = new DepinClient(
    connection,
    wallet,
    new PublicKey(PROGRAM_ID)
  );

  // Create multiple users with different locations
  const users = [
    { keypair: Keypair.generate(), location: { lat: 37.7749, lng: -122.4194, name: "San Francisco" } },
    { keypair: Keypair.generate(), location: { lat: 40.7128, lng: -74.0060, name: "New York" } },
    { keypair: Keypair.generate(), location: { lat: 34.0522, lng: -118.2437, name: "Los Angeles" } },
  ];

  for (const user of users) {
    try {
      // Airdrop SOL if on localnet
      if (RPC_URL.includes("localhost")) {
        await connection.requestAirdrop(user.keypair.publicKey, 1e9);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const activityData = {
        gpsLat: user.location.lat,
        gpsLong: user.location.lng,
        signalStrength: Math.floor(Math.random() * 50) - 80 // Random signal between -80 and -30
      };

      const tx = await client.submitActivity(activityData, user.keypair);
      console.log(`✅ ${user.location.name}: ${tx.slice(0, 8)}...`);

    } catch (error) {
      console.log(`❌ ${user.location.name}: ${error.message}`);
    }
  }
}

// Run the example
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}