import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { DepinLite } from "../target/types/depin_lite";
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

export interface ActivityData {
  gpsLat: number;
  gpsLong: number;
  signalStrength: number;
}

export interface UserActivityAccount {
  user: PublicKey;
  gpsLat: number;
  gpsLong: number;
  signalStrength: number;
  lastSubmissionTimestamp: anchor.BN;
  dailySubmissions: number;
  totalSubmissions: anchor.BN;
  totalRewardsEarned: anchor.BN;
  pendingVerification: boolean;
  bump: number;
}

export interface ProgramStateAccount {
  authority: PublicKey;
  mapMint: PublicKey;
  totalRewardsDistributed: anchor.BN;
  bump: number;
}

export class DepinClient {
  private program: Program<DepinLite>;
  private provider: AnchorProvider;
  private connection: Connection;

  constructor(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey
  ) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(
      require("../target/idl/depin_lite.json"),
      programId,
      this.provider
    );
  }

  /**
   * Get the program state PDA
   */
  getProgramStatePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      this.program.programId
    );
  }

  /**
   * Get the user activity PDA for a specific user
   */
  getUserActivityPDA(userPublicKey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_activity"), userPublicKey.toBuffer()],
      this.program.programId
    );
  }

  /**
   * Initialize the DePIN program
   */
  async initialize(
    authority: PublicKey,
    mapMint: PublicKey,
    payer?: Keypair
  ): Promise<string> {
    const [programState] = this.getProgramStatePDA();
    const payerKey = payer || this.provider.wallet.payer;

    const tx = await this.program.methods
      .initialize(authority)
      .accounts({
        programState: programState,
        mapMint: mapMint,
        payer: payerKey.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers(payer ? [payer] : [])
      .rpc();

    return tx;
  }

  /**
   * Create MAP token mint
   */
  async createMapMint(mintKeypair: Keypair, payer?: Keypair): Promise<string> {
    const [programState] = this.getProgramStatePDA();
    const payerKey = payer || this.provider.wallet.payer;

    const tx = await this.program.methods
      .createMapMint()
      .accounts({
        mapMint: mintKeypair.publicKey,
        programState: programState,
        payer: payerKey.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair, ...(payer ? [payer] : [])])
      .rpc();

    return tx;
  }

  /**
   * Submit activity data
   */
  async submitActivity(
    activityData: ActivityData,
    user: Keypair
  ): Promise<string> {
    const [userActivity] = this.getUserActivityPDA(user.publicKey);

    const tx = await this.program.methods
      .submitActivity(
        activityData.gpsLat,
        activityData.gpsLong,
        activityData.signalStrength
      )
      .accounts({
        userActivity: userActivity,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    return tx;
  }

  /**
   * Verify and reward user (requires Switchboard function accounts)
   */
  async verifyAndReward(
    user: PublicKey,
    functionAccount: PublicKey,
    functionRequestAccount: PublicKey,
    signer?: Keypair
  ): Promise<string> {
    const [userActivity] = this.getUserActivityPDA(user);
    const [programState] = this.getProgramStatePDA();
    
    // Get program state to find MAP mint
    const programStateAccount = await this.getProgramState();
    const mapMint = programStateAccount.mapMint;

    // Get user's associated token account
    const userTokenAccount = await getAssociatedTokenAddress(
      mapMint,
      user
    );

    const signerKey = signer || this.provider.wallet.payer;

    const tx = await this.program.methods
      .verifyAndReward()
      .accounts({
        userActivity: userActivity,
        programState: programState,
        mapMint: mapMint,
        userTokenAccount: userTokenAccount,
        user: signerKey.publicKey,
        function: functionAccount,
        functionRequest: functionRequestAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers(signer ? [signer] : [])
      .rpc();

    return tx;
  }

  /**
   * Get program state account
   */
  async getProgramState(): Promise<ProgramStateAccount> {
    const [programState] = this.getProgramStatePDA();
    return await this.program.account.programState.fetch(programState);
  }

  /**
   * Get user activity account
   */
  async getUserActivity(userPublicKey: PublicKey): Promise<UserActivityAccount | null> {
    try {
      const [userActivity] = this.getUserActivityPDA(userPublicKey);
      return await this.program.account.userActivity.fetch(userActivity);
    } catch (error) {
      // Account doesn't exist yet
      return null;
    }
  }

  /**
   * Get user's MAP token balance
   */
  async getUserMapBalance(userPublicKey: PublicKey): Promise<number> {
    try {
      const programState = await this.getProgramState();
      const userTokenAccount = await getAssociatedTokenAddress(
        programState.mapMint,
        userPublicKey
      );
      
      const tokenAccountInfo = await this.connection.getTokenAccountBalance(userTokenAccount);
      return tokenAccountInfo.value.uiAmount || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if user can submit activity (cooldown check)
   */
  async canSubmitActivity(userPublicKey: PublicKey): Promise<{
    canSubmit: boolean;
    reason?: string;
    nextSubmissionTime?: Date;
  }> {
    const userActivity = await this.getUserActivity(userPublicKey);
    
    if (!userActivity) {
      return { canSubmit: true };
    }

    const now = Math.floor(Date.now() / 1000);
    const lastSubmission = userActivity.lastSubmissionTimestamp.toNumber();
    const timeSinceLastSubmission = now - lastSubmission;
    const cooldownPeriod = 3600; // 1 hour

    if (timeSinceLastSubmission < cooldownPeriod) {
      const nextSubmissionTime = new Date((lastSubmission + cooldownPeriod) * 1000);
      return {
        canSubmit: false,
        reason: "Cooldown period not met",
        nextSubmissionTime
      };
    }

    // Check daily cap
    const currentDay = Math.floor(now / 86400);
    const lastSubmissionDay = Math.floor(lastSubmission / 86400);
    
    if (currentDay === lastSubmissionDay && userActivity.dailySubmissions >= 24) {
      return {
        canSubmit: false,
        reason: "Daily submission cap exceeded (24 max per day)"
      };
    }

    return { canSubmit: true };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userPublicKey: PublicKey): Promise<{
    totalSubmissions: number;
    dailySubmissions: number;
    totalRewardsEarned: number;
    mapBalance: number;
    lastSubmissionTime?: Date;
    pendingVerification: boolean;
  }> {
    const userActivity = await this.getUserActivity(userPublicKey);
    const mapBalance = await getUserMapBalance(userPublicKey);

    if (!userActivity) {
      return {
        totalSubmissions: 0,
        dailySubmissions: 0,
        totalRewardsEarned: 0,
        mapBalance,
        pendingVerification: false
      };
    }

    return {
      totalSubmissions: userActivity.totalSubmissions.toNumber(),
      dailySubmissions: userActivity.dailySubmissions,
      totalRewardsEarned: userActivity.totalRewardsEarned.toNumber() / 1_000_000, // Convert from lamports
      mapBalance,
      lastSubmissionTime: userActivity.lastSubmissionTimestamp.toNumber() > 0 
        ? new Date(userActivity.lastSubmissionTimestamp.toNumber() * 1000)
        : undefined,
      pendingVerification: userActivity.pendingVerification
    };
  }
}

/**
 * Utility function to create a DePIN client instance
 */
export function createDepinClient(
  rpcUrl: string,
  wallet: Wallet,
  programId: string
): DepinClient {
  const connection = new Connection(rpcUrl);
  const programPublicKey = new PublicKey(programId);
  
  return new DepinClient(connection, wallet, programPublicKey);
}

/**
 * Validate activity data before submission
 */
export function validateActivityData(data: ActivityData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate GPS coordinates
  if (data.gpsLat < -90 || data.gpsLat > 90) {
    errors.push("Latitude must be between -90 and 90 degrees");
  }
  
  if (data.gpsLong < -180 || data.gpsLong > 180) {
    errors.push("Longitude must be between -180 and 180 degrees");
  }

  // Validate signal strength
  if (data.signalStrength < -100 || data.signalStrength > 0) {
    errors.push("Signal strength must be between -100 and 0 dBm");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}