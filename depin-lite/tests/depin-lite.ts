import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DepinLite } from "../target/types/depin_lite";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
} from "@solana/spl-token";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("depin-lite", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.depinLite as Program<DepinLite>;
  const provider = anchor.getProvider();
  
  let mapMint: PublicKey;
  let programState: PublicKey;
  let userActivity: PublicKey;
  let userTokenAccount: PublicKey;
  
  const user = Keypair.generate();
  const authority = provider.wallet.publicKey;

  before(async () => {
    // Airdrop SOL to user for testing
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Derive PDAs
    [programState] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      program.programId
    );

    [userActivity] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_activity"), user.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Creates MAP token mint", async () => {
    const mintKeypair = Keypair.generate();
    mapMint = mintKeypair.publicKey;

    const tx = await program.methods
      .createMapMint()
      .accounts({
        mapMint: mapMint,
        programState: programState,
        payer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();

    console.log("MAP mint created:", tx);
  });

  it("Initializes the program", async () => {
    const tx = await program.methods
      .initialize(authority)
      .accounts({
        programState: programState,
        mapMint: mapMint,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Program initialized:", tx);

    // Verify program state
    const programStateAccount = await program.account.programState.fetch(programState);
    expect(programStateAccount.authority.toString()).to.equal(authority.toString());
    expect(programStateAccount.mapMint.toString()).to.equal(mapMint.toString());
    expect(programStateAccount.totalRewardsDistributed.toNumber()).to.equal(0);
  });

  it("Submits activity data", async () => {
    const gpsLat = 37.7749; // San Francisco latitude
    const gpsLong = -122.4194; // San Francisco longitude
    const signalStrength = -45; // Good WiFi signal

    const tx = await program.methods
      .submitActivity(gpsLat, gpsLong, signalStrength)
      .accounts({
        userActivity: userActivity,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Activity submitted:", tx);

    // Verify user activity account
    const userActivityAccount = await program.account.userActivity.fetch(userActivity);
    expect(userActivityAccount.user.toString()).to.equal(user.publicKey.toString());
    expect(userActivityAccount.gpsLat).to.equal(gpsLat);
    expect(userActivityAccount.gpsLong).to.equal(gpsLong);
    expect(userActivityAccount.signalStrength).to.equal(signalStrength);
    expect(userActivityAccount.dailySubmissions).to.equal(1);
    expect(userActivityAccount.totalSubmissions.toNumber()).to.equal(1);
    expect(userActivityAccount.pendingVerification).to.be.true;
  });

  it("Fails to submit activity too soon (cooldown)", async () => {
    try {
      await program.methods
        .submitActivity(37.7749, -122.4194, -50)
        .accounts({
          userActivity: userActivity,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      
      expect.fail("Should have failed due to cooldown");
    } catch (error) {
      expect(error.message).to.include("CooldownNotMet");
    }
  });

  it("Fails with invalid GPS coordinates", async () => {
    const newUser = Keypair.generate();
    
    // Airdrop SOL to new user
    const signature = await provider.connection.requestAirdrop(
      newUser.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    const [newUserActivity] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_activity"), newUser.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .submitActivity(91.0, -122.4194, -50) // Invalid latitude > 90
        .accounts({
          userActivity: newUserActivity,
          user: newUser.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([newUser])
        .rpc();
      
      expect.fail("Should have failed due to invalid GPS coordinates");
    } catch (error) {
      expect(error.message).to.include("InvalidGpsCoordinates");
    }
  });

  it("Fails with invalid signal strength", async () => {
    const newUser = Keypair.generate();
    
    // Airdrop SOL to new user
    const signature = await provider.connection.requestAirdrop(
      newUser.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    const [newUserActivity] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_activity"), newUser.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .submitActivity(37.7749, -122.4194, 10) // Invalid signal strength > 0
        .accounts({
          userActivity: newUserActivity,
          user: newUser.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([newUser])
        .rpc();
      
      expect.fail("Should have failed due to invalid signal strength");
    } catch (error) {
      expect(error.message).to.include("InvalidSignalStrength");
    }
  });

  // Note: The verify_and_reward test would require setting up actual Switchboard accounts
  // which is complex for a unit test. In practice, you'd test this with integration tests
  // or by mocking the Switchboard accounts.
});
