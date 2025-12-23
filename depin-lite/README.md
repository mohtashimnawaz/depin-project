# DePIN Lite - Proof of Activity Program

A Solana DePIN (Decentralized Physical Infrastructure Network) program that rewards users for submitting verified Wi-Fi signal strength and GPS location data. Built with Anchor and integrated with Switchboard V3 for oracle-based verification.

## Overview

This program implements a "Proof of Activity" system where:
- Users submit GPS coordinates and Wi-Fi signal strength data
- Switchboard Functions verify the data authenticity (anti-VPN/emulator checks)
- Verified submissions earn MAP tokens as rewards
- Built-in cooldown and daily caps prevent spam

## Features

- **Activity Submission**: Submit GPS coordinates and Wi-Fi signal strength
- **Oracle Verification**: Switchboard Functions verify data authenticity
- **Anti-Spam Protection**: 1-hour cooldown and 24 submissions/day limit
- **Token Rewards**: Earn 5 MAP tokens per verified submission
- **State Management**: Track user activity and reward history

## Architecture

### Smart Contract (Anchor Program)
- `submit_activity`: Accept and validate activity data
- `verify_and_reward`: Process oracle verification and mint rewards
- `initialize`: Set up program state and token mint
- Built-in validation for GPS coordinates and signal strength

### Oracle Function (Switchboard)
- Verifies GPS coordinates are realistic (not fake/ocean locations)
- Checks IP reputation to detect VPN/proxy usage
- Validates signal strength plausibility
- Analyzes movement patterns for impossible speeds

### Client SDK
- TypeScript SDK for easy integration
- Activity validation and submission
- User statistics and balance tracking
- Cooldown and daily cap checking

## Quick Start

### Prerequisites

- Rust 1.70+
- Solana CLI 1.16+
- Anchor CLI 0.32+
- Node.js 18+
- Python 3.8+ (for oracle function)

### Installation

1. **Clone and setup**:
```bash
git clone <repository>
cd depin-lite
yarn install
```

2. **Build the program**:
```bash
anchor build
```

3. **Deploy to localnet**:
```bash
# Start local validator
solana-test-validator

# Deploy program
anchor deploy
```

4. **Run tests**:
```bash
anchor test
```

### Program Usage

#### Initialize Program

```typescript
import { DepinClient, createDepinClient } from './client/depin-client';
import { Keypair } from '@solana/web3.js';

const client = createDepinClient(
  "http://localhost:8899", // RPC URL
  wallet,
  "7nMrAY8nNgHcyAimQJgrzM5LisT2jVaNRX2s6hvnNsxU" // Program ID
);

// Create MAP token mint
const mintKeypair = Keypair.generate();
await client.createMapMint(mintKeypair);

// Initialize program
await client.initialize(authority.publicKey, mintKeypair.publicKey);
```

#### Submit Activity

```typescript
const activityData = {
  gpsLat: 37.7749,    // San Francisco latitude
  gpsLong: -122.4194, // San Francisco longitude
  signalStrength: -45  // WiFi signal in dBm
};

// Validate data first
const validation = validateActivityData(activityData);
if (!validation.valid) {
  console.error("Invalid data:", validation.errors);
  return;
}

// Check if user can submit (cooldown/daily cap)
const canSubmit = await client.canSubmitActivity(user.publicKey);
if (!canSubmit.canSubmit) {
  console.error("Cannot submit:", canSubmit.reason);
  return;
}

// Submit activity
const txSignature = await client.submitActivity(activityData, user);
console.log("Activity submitted:", txSignature);
```

#### Get User Statistics

```typescript
const stats = await client.getUserStats(user.publicKey);
console.log("User Stats:", {
  totalSubmissions: stats.totalSubmissions,
  dailySubmissions: stats.dailySubmissions,
  totalRewards: stats.totalRewardsEarned,
  mapBalance: stats.mapBalance,
  lastSubmission: stats.lastSubmissionTime,
  pendingVerification: stats.pendingVerification
});
```

## Oracle Function Setup

### Python Function

The Python oracle function (`oracle-function/switchboard_function.py`) provides comprehensive verification:

```bash
# Install dependencies
pip install requests

# Set environment variables (optional)
export VPN_DETECTION_API_KEY="your_api_key"
export GEOLOCATION_API_KEY="your_api_key"

# Test function locally
echo '{"activity": {"gps_lat": 37.7749, "gps_long": -122.4194, "signal_strength": -45, "timestamp": 1640995200}, "user_ip": "8.8.8.8", "user_id": "user123"}' | python3 switchboard_function.py
```

### Node.js Function

Alternative Node.js implementation (`oracle-function/switchboard_function.js`):

```bash
# Test function locally
echo '{"activity": {"gps_lat": 37.7749, "gps_long": -122.4194, "signal_strength": -45, "timestamp": 1640995200}, "user_ip": "8.8.8.8", "user_id": "user123"}' | node switchboard_function.js
```

### Verification Logic

The oracle function performs these checks:
1. **GPS Validation**: Coordinates within valid ranges, not in ocean centers
2. **IP Reputation**: Detects VPN/proxy/datacenter IPs
3. **Signal Strength**: Validates WiFi signal strength ranges
4. **Movement Analysis**: Checks for impossible travel speeds
5. **Scoring System**: Requires 70% score to pass verification

## Mobile App Integration

For mobile app integration, you'll need to:

1. **Collect Data**:
   - Use device GPS for location
   - Scan WiFi networks for signal strength
   - Get device IP address

2. **Submit to Program**:
   - Use the client SDK to submit activity
   - Handle cooldown periods gracefully
   - Show pending verification status

3. **Handle Verification**:
   - Monitor for oracle verification completion
   - Display earned rewards
   - Track user statistics

### Example Mobile Integration

```typescript
// Mobile app pseudocode
class MobileDepinClient {
  async collectAndSubmitActivity() {
    // Get device location
    const location = await getCurrentPosition();
    
    // Scan WiFi networks
    const wifiNetworks = await scanWifiNetworks();
    const strongestSignal = Math.max(...wifiNetworks.map(n => n.signalStrength));
    
    // Prepare activity data
    const activityData = {
      gpsLat: location.latitude,
      gpsLong: location.longitude,
      signalStrength: strongestSignal
    };
    
    // Submit to program
    try {
      const tx = await this.depinClient.submitActivity(activityData, this.userKeypair);
      this.showSuccess(`Activity submitted: ${tx}`);
    } catch (error) {
      this.showError(`Submission failed: ${error.message}`);
    }
  }
}
```

## Security Considerations

1. **Oracle Security**: Switchboard Functions run in TEE for tamper-proof execution
2. **Anti-Spam**: Cooldown periods and daily caps prevent abuse
3. **Data Validation**: Multiple layers of GPS and signal strength validation
4. **VPN Detection**: IP reputation checks to prevent location spoofing
5. **Movement Analysis**: Speed calculations detect impossible travel

## Testing

Run the test suite:

```bash
# Unit tests
anchor test

# Integration tests with oracle
anchor test --provider.cluster localnet
```

## Deployment

### Mainnet Deployment

1. **Update Program ID**:
   - Generate new keypair: `solana-keygen new -o deploy-keypair.json`
   - Update `Anchor.toml` and `lib.rs` with new program ID

2. **Deploy**:
```bash
# Build for mainnet
anchor build

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

3. **Initialize Program**:
```bash
# Create and initialize MAP token mint
# Set up Switchboard Function accounts
# Initialize program state
```

## API Reference

### Program Instructions

- `initialize(authority: Pubkey)`: Initialize program state
- `submit_activity(gps_lat: f64, gps_long: f64, signal_strength: i8)`: Submit activity data
- `verify_and_reward()`: Process oracle verification and mint rewards
- `create_map_mint()`: Create MAP token mint

### Account Structures

- `ProgramState`: Global program configuration
- `UserActivity`: Per-user activity tracking and rewards

### Error Codes

- `CooldownNotMet`: 1-hour cooldown not elapsed
- `DailyCapExceeded`: 24 submissions/day limit reached
- `InvalidGpsCoordinates`: GPS coordinates out of range
- `InvalidSignalStrength`: Signal strength outside WiFi range
- `AttestationFailed`: Oracle verification failed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions and support:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki