# DePIN Lite - Proof of Activity Program

A complete Solana DePIN (Decentralized Physical Infrastructure Network) application that rewards users for submitting verified WiFi signal strength and GPS location data. Built with Anchor, integrated with Switchboard V3 for oracle-based verification, and includes a full-featured mobile app.

## 🌟 Features

### Smart Contract (Anchor Program)
- **Activity Submission**: Submit GPS coordinates and WiFi signal strength data
- **Oracle Verification**: Switchboard Functions verify data authenticity (anti-VPN/emulator checks)
- **Anti-Spam Protection**: 1-hour cooldown and 24 submissions/day limit
- **Token Rewards**: Earn 5 MAP tokens per verified submission
- **State Management**: Track user activity and reward history

### Oracle Functions (Switchboard)
- **GPS Validation**: Verify coordinates are realistic (not fake/ocean locations)
- **IP Reputation**: Check for VPN/proxy/datacenter usage
- **Signal Strength**: Validate WiFi signal plausibility
- **Movement Analysis**: Detect impossible travel speeds
- **Scoring System**: 70% threshold for verification approval

### Mobile App (Next.js)
- **Activity Submission**: Intuitive UI for GPS and WiFi data collection
- **Real-time Dashboard**: Live stats, rewards, and verification status
- **User Statistics**: Track submissions, earnings, and progress
- **Reward System**: Tier-based multipliers and earning optimization
- **Wallet Integration**: Seamless Solana wallet connection

### Client SDK (TypeScript)
- **Easy Integration**: Simple API for activity submission and data retrieval
- **Validation**: Client-side data validation and error handling
- **Statistics**: Comprehensive user analytics and balance tracking
- **Cooldown Management**: Smart submission timing and eligibility checks

## 🚀 Quick Start

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
// Check if user can submit
const canSubmit = await client.canSubmitActivity(userPublicKey);
if (!canSubmit.canSubmit) {
  console.log("Cannot submit:", canSubmit.reason);
  return;
}

// Submit activity data
const activityData = {
  gpsLat: 37.7749,    // San Francisco
  gpsLong: -122.4194,
  signalStrength: -65 // WiFi signal in dBm
};

const txSignature = await client.submitActivity(activityData, userKeypair);
console.log("Activity submitted:", txSignature);
```

#### Get User Statistics

```typescript
const stats = await client.getUserStats(userPublicKey);
console.log("Total Submissions:", stats.totalSubmissions);
console.log("MAP Balance:", stats.mapBalance);
console.log("Pending Verification:", stats.pendingVerification);
```

## 🏗️ Architecture

### Smart Contract Flow
```
User Submission → Validation → Storage → Oracle Verification → Reward Distribution
```

### Oracle Verification Process
```
Activity Data → GPS Check → IP Reputation → Signal Validation → Movement Analysis → Score → Approve/Reject
```

### Mobile App Integration
```
GPS/WiFi Collection → Client Validation → Smart Contract → Real-time Updates → User Dashboard
```

## 📱 Mobile App

The mobile app provides a complete DePIN experience:

### Dashboard Features
- **Activity Submission Form**: Auto-detect or manual GPS/WiFi input
- **User Statistics**: Submissions, rewards, tier progress
- **Recent Activities**: Transaction history with verification status
- **Rewards Tracking**: Balance, earnings, tier multipliers
- **Daily Progress**: Submission limits and earning potential

### Getting Started
```bash
cd mobile-app
npm install
npm run dev
```

Visit `http://localhost:3000/depin` to access the DePIN features.

## 🔧 Oracle Functions

### Python Function
```bash
cd oracle-function
python3 switchboard_function.py '{"gps_lat": 37.7749, "gps_long": -122.4194, "signal_strength": -65, "ip_address": "192.168.1.1"}'
```

### Node.js Function
```bash
cd oracle-function
node switchboard_function.js '{"gps_lat": 37.7749, "gps_long": -122.4194, "signal_strength": -65, "ip_address": "192.168.1.1"}'
```

### Verification Criteria
- **GPS Coordinates** (30 points): Valid range, not in oceans, not null island
- **IP Reputation** (40 points): Not VPN/proxy/datacenter
- **Signal Strength** (20 points): Valid WiFi range (-100 to 0 dBm)
- **Movement Pattern** (10 points): Physically possible travel speed

**Passing Score**: 70/100 points required for verification

## 🧪 Testing

### Run Unit Tests
```bash
anchor test
```

### Test Coverage
- Program initialization and state management
- Activity submission validation
- Cooldown and daily cap enforcement
- GPS coordinate and signal strength validation
- Multiple user scenarios
- Error handling and edge cases

### Example Test Output
```
✓ Creates MAP token mint
✓ Initializes the program
✓ Submits activity data
✓ Fails to submit activity too soon (cooldown)
✓ Fails with invalid GPS coordinates
✓ Fails with invalid signal strength
```

## 📊 Token Economics

### MAP Token Details
- **Symbol**: MAP
- **Decimals**: 6
- **Reward per Submission**: 5 MAP tokens
- **Daily Maximum**: 120 MAP tokens (24 submissions)
- **Verification Required**: Yes, via Switchboard oracles

### Reward Tiers
- **Starter** (0-99 submissions): 1.0x multiplier
- **Bronze** (100-499): 1.1x multiplier
- **Silver** (500-1999): 1.2x multiplier
- **Gold** (2000-4999): 1.3x multiplier
- **Platinum** (5000+): 1.5x multiplier

## 🔐 Security Features

### Smart Contract Security
- **PDA-based accounts**: Secure account derivation
- **Input validation**: GPS coordinates and signal strength checks
- **Rate limiting**: Cooldown periods and daily caps
- **Authority controls**: Program upgrade protection

### Oracle Security
- **Multi-factor verification**: GPS, IP, signal, movement analysis
- **VPN/Proxy detection**: Comprehensive IP reputation checking
- **Movement validation**: Impossible speed detection
- **Scoring system**: Weighted verification criteria

### Client Security
- **Data validation**: Client-side input sanitization
- **Error handling**: Graceful failure management
- **Wallet integration**: Secure transaction signing

## 🚀 Deployment

### Localnet Deployment
```bash
# Start validator
solana-test-validator

# Deploy
anchor deploy

# Run migration
anchor run deploy
```

### Devnet Deployment
```bash
# Configure for devnet
solana config set --url devnet

# Deploy
anchor deploy --provider.cluster devnet

# Update program ID in code
```

### Production Checklist
- [ ] Update program ID in all configurations
- [ ] Set up Switchboard Functions on target network
- [ ] Configure oracle API keys
- [ ] Test end-to-end flow
- [ ] Monitor program usage and token distribution

## 📚 API Reference

### DepinClient Methods

#### `submitActivity(activityData, user)`
Submit GPS and WiFi signal data for verification.

#### `canSubmitActivity(userPublicKey)`
Check if user can submit activity (cooldown/daily cap).

#### `getUserStats(userPublicKey)`
Get comprehensive user statistics and balances.

#### `getUserMapBalance(userPublicKey)`
Get current MAP token balance.

#### `getProgramState()`
Get program configuration and total statistics.

### Program Instructions

#### `initialize(authority)`
Initialize the DePIN program with authority.

#### `create_map_mint()`
Create the MAP token mint.

#### `submit_activity(gps_lat, gps_long, signal_strength)`
Submit activity data for verification.

#### `verify_and_reward()`
Process oracle verification and distribute rewards.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Development Setup
```bash
# Install dependencies
yarn install

# Build program
anchor build

# Run tests
anchor test

# Start mobile app
cd mobile-app && npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/examples` directory for usage examples
- **Issues**: Report bugs and feature requests on GitHub
- **Discord**: Join our community for support and discussions

## 🗺️ Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Smart contract development
- [x] Oracle function implementation
- [x] Client SDK
- [x] Basic mobile app

### Phase 2: Enhanced Features 🚧
- [ ] Advanced fraud detection
- [ ] Geofencing capabilities
- [ ] Batch submission optimization
- [ ] Enhanced mobile UX

### Phase 3: Network Growth 📋
- [ ] Mainnet deployment
- [ ] Token distribution events
- [ ] Partnership integrations
- [ ] Analytics dashboard

---

**Built with ❤️ for the DePIN ecosystem**

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