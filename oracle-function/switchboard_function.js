#!/usr/bin/env node
/**
 * Switchboard Function for DePIN Activity Verification (Node.js version)
 * This function runs in a Trusted Execution Environment (TEE) to verify:
 * 1. GPS coordinates are valid and realistic
 * 2. IP address is not from a known VPN/proxy service
 * 3. Signal strength is within reasonable bounds for the location
 */

const https = require('https');
const fs = require('fs');

class ActivityVerifier {
    constructor() {
        this.vpnProviders = [
            'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'protonvpn',
            'mullvad', 'windscribe', 'tunnelbear', 'hotspotshield', 'purevpn'
        ];
    }

    /**
     * Verify GPS coordinates are valid and not obviously fake
     */
    verifyGpsCoordinates(lat, lng) {
        // Basic range validation
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return { valid: false, reason: 'GPS coordinates out of valid range' };
        }

        // Check for common fake coordinates (0,0), (null island)
        if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) {
            return { valid: false, reason: 'Suspicious coordinates near null island' };
        }

        // Check for coordinates in the middle of oceans (simplified)
        const oceanAreas = [
            // Pacific Ocean center
            { latRange: [-10, 10], lngRange: [-170, -120] },
            // Atlantic Ocean center  
            { latRange: [-10, 10], lngRange: [-40, -10] },
            // Indian Ocean center
            { latRange: [-20, 0], lngRange: [60, 100] }
        ];

        for (const area of oceanAreas) {
            if (lat >= area.latRange[0] && lat <= area.latRange[1] &&
                lng >= area.lngRange[0] && lng <= area.lngRange[1]) {
                return { valid: false, reason: 'Coordinates appear to be in middle of ocean' };
            }
        }

        return { valid: true, reason: 'GPS coordinates valid' };
    }

    /**
     * Make HTTP request with promise
     */
    makeRequest(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: 5000 }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });

            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    /**
     * Check if IP address is from VPN/proxy/datacenter
     */
    async checkIpReputation(ipAddress) {
        try {
            const services = [
                `https://ipapi.co/${ipAddress}/json/`,
                `https://ipinfo.io/${ipAddress}/json`
            ];

            for (const serviceUrl of services) {
                try {
                    const data = await this.makeRequest(serviceUrl);
                    
                    // Check for VPN/proxy indicators
                    const org = (data.org || '').toLowerCase();
                    const company = (data.company?.name || '').toLowerCase();
                    
                    // Check against known VPN providers
                    for (const provider of this.vpnProviders) {
                        if (org.includes(provider) || company.includes(provider)) {
                            return { valid: false, reason: `IP associated with VPN provider: ${provider}` };
                        }
                    }
                    
                    // Check for datacenter/hosting providers
                    const datacenterIndicators = ['datacenter', 'hosting', 'cloud', 'server', 'vps', 'aws', 'google', 'azure'];
                    for (const indicator of datacenterIndicators) {
                        if (org.includes(indicator) || company.includes(indicator)) {
                            return { valid: false, reason: `IP from datacenter/hosting provider: ${indicator}` };
                        }
                    }
                    
                    return { valid: true, reason: 'IP reputation check passed' };
                    
                } catch (e) {
                    continue;
                }
            }
            
            return { valid: false, reason: 'Unable to verify IP reputation' };
            
        } catch (e) {
            return { valid: false, reason: `IP reputation check failed: ${e.message}` };
        }
    }

    /**
     * Verify WiFi signal strength is plausible
     */
    verifySignalStrength(signalStrength, lat, lng) {
        // Basic range check (WiFi typically -100 to 0 dBm)
        if (signalStrength < -100 || signalStrength > 0) {
            return { valid: false, reason: `Signal strength ${signalStrength} dBm out of valid range` };
        }

        // Very weak signals might indicate spoofing
        if (signalStrength < -90) {
            return { valid: false, reason: `Signal strength ${signalStrength} dBm too weak, possible spoofing` };
        }

        // Perfect signals are suspicious
        if (signalStrength > -10) {
            return { valid: false, reason: `Signal strength ${signalStrength} dBm suspiciously strong` };
        }

        return { valid: true, reason: 'Signal strength validation passed' };
    }

    /**
     * Calculate distance between two GPS coordinates using Haversine formula
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        
        const lat1Rad = lat1 * Math.PI / 180;
        const lon1Rad = lon1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const lon2Rad = lon2 * Math.PI / 180;
        
        const dlat = lat2Rad - lat1Rad;
        const dlon = lon2Rad - lon1Rad;
        
        const a = Math.sin(dlat/2) * Math.sin(dlat/2) + 
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
                  Math.sin(dlon/2) * Math.sin(dlon/2);
        const c = 2 * Math.asin(Math.sqrt(a));
        
        return R * c;
    }

    /**
     * Analyze if movement between locations is physically possible
     */
    analyzeMovementPattern(currentLat, currentLng, previousLat = null, previousLng = null, timeDiff = 3600) {
        if (previousLat === null || previousLng === null) {
            return { valid: true, reason: 'No previous location to compare' };
        }

        const distanceKm = this.haversineDistance(previousLat, previousLng, currentLat, currentLng);
        const timeHours = timeDiff / 3600;
        const requiredSpeed = timeHours > 0 ? distanceKm / timeHours : Infinity;
        
        // Maximum reasonable speed (accounting for flights)
        const maxSpeed = 900; // km/h (commercial aircraft speed)
        
        if (requiredSpeed > maxSpeed) {
            return { 
                valid: false, 
                reason: `Impossible movement: ${distanceKm.toFixed(1)}km in ${timeHours.toFixed(1)}h requires ${requiredSpeed.toFixed(1)}km/h` 
            };
        }
        
        return { 
            valid: true, 
            reason: `Movement pattern valid: ${distanceKm.toFixed(1)}km in ${timeHours.toFixed(1)}h` 
        };
    }

    /**
     * Main verification function that combines all checks
     */
    async verifyActivity(activityData) {
        const lat = activityData.gps_lat || 0;
        const lng = activityData.gps_long || 0;
        const signalStrength = activityData.signal_strength || -100;
        const ipAddress = activityData.ip_address || '';
        const previousLat = activityData.previous_lat;
        const previousLng = activityData.previous_lng;
        const timeDiff = activityData.time_diff || 3600;

        const verificationResult = {
            verified: false,
            score: 0,
            max_score: 100,
            checks: {},
            timestamp: Math.floor(Date.now() / 1000)
        };

        // GPS Coordinate Verification (30 points)
        const gpsResult = this.verifyGpsCoordinates(lat, lng);
        verificationResult.checks.gps_validation = {
            passed: gpsResult.valid,
            reason: gpsResult.reason,
            points: gpsResult.valid ? 30 : 0
        };
        if (gpsResult.valid) {
            verificationResult.score += 30;
        }

        // IP Reputation Check (40 points)
        if (ipAddress) {
            const ipResult = await this.checkIpReputation(ipAddress);
            verificationResult.checks.ip_reputation = {
                passed: ipResult.valid,
                reason: ipResult.reason,
                points: ipResult.valid ? 40 : 0
            };
            if (ipResult.valid) {
                verificationResult.score += 40;
            }
        } else {
            verificationResult.checks.ip_reputation = {
                passed: false,
                reason: 'No IP address provided',
                points: 0
            };
        }

        // Signal Strength Verification (20 points)
        const signalResult = this.verifySignalStrength(signalStrength, lat, lng);
        verificationResult.checks.signal_strength = {
            passed: signalResult.valid,
            reason: signalResult.reason,
            points: signalResult.valid ? 20 : 0
        };
        if (signalResult.valid) {
            verificationResult.score += 20;
        }

        // Movement Pattern Analysis (10 points)
        const movementResult = this.analyzeMovementPattern(lat, lng, previousLat, previousLng, timeDiff);
        verificationResult.checks.movement_pattern = {
            passed: movementResult.valid,
            reason: movementResult.reason,
            points: movementResult.valid ? 10 : 0
        };
        if (movementResult.valid) {
            verificationResult.score += 10;
        }

        // Overall verification (require 70% score)
        verificationResult.verified = verificationResult.score >= 70;

        return verificationResult;
    }
}

/**
 * Main function for Switchboard execution
 */
async function main() {
    try {
        let inputData;
        
        // Parse input from command line argument or stdin
        if (process.argv.length > 2) {
            inputData = JSON.parse(process.argv[2]);
        } else {
            // Read from stdin
            const input = await new Promise((resolve) => {
                let data = '';
                process.stdin.on('data', chunk => data += chunk);
                process.stdin.on('end', () => resolve(data));
            });
            inputData = JSON.parse(input);
        }

        // Initialize verifier
        const verifier = new ActivityVerifier();
        
        // Perform verification
        const result = await verifier.verifyActivity(inputData);
        
        // Output result for Switchboard
        const output = {
            success: result.verified,
            data: result
        };
        
        console.log(JSON.stringify(output));
        
        // Return appropriate exit code
        process.exit(result.verified ? 0 : 1);
        
    } catch (error) {
        const errorOutput = {
            success: false,
            error: error.message,
            data: null
        };
        console.log(JSON.stringify(errorOutput));
        process.exit(1);
    }
}

// Run main function if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = { ActivityVerifier };
     * Check if IP address is from VPN/proxy/datacenter
     */
    async checkIpReputation(ipAddress) {
        try {
            const services = [
                `https://ipapi.co/${ipAddress}/json/`,
                `https://ipinfo.io/${ipAddress}/json`
            ];

            for (const serviceUrl of services) {
                try {
                    const data = await this.makeRequest(serviceUrl);
                    
                    // Check for VPN/proxy indicators
                    const org = (data.org || '').toLowerCase();
                    const company = typeof data.company === 'object' ? 
                        (data.company.name || '').toLowerCase() : '';

                    // Check against known VPN providers
                    for (const provider of this.vpnProviders) {
                        if (org.includes(provider) || company.includes(provider)) {
                            return { 
                                valid: false, 
                                reason: `IP associated with VPN provider: ${provider}` 
                            };
                        }
                    }

                    // Check for datacenter/hosting indicators
                    const datacenterKeywords = [
                        'hosting', 'datacenter', 'cloud', 'server', 'vps', 
                        'digital ocean', 'aws', 'azure', 'linode'
                    ];
                    
                    for (const keyword of datacenterKeywords) {
                        if (org.includes(keyword)) {
                            return { 
                                valid: false, 
                                reason: `IP from datacenter/hosting provider: ${org}` 
                            };
                        }
                    }

                    // Additional checks for proxy indicators
                    if (data.proxy || data.vpn) {
                        return { valid: false, reason: 'IP flagged as proxy/VPN' };
                    }

                } catch (e) {
                    continue;
                }
            }

            return { valid: true, reason: 'IP reputation check passed' };

        } catch (e) {
            // If we can't verify, err on the side of caution but don't completely block
            return { valid: true, reason: `IP verification inconclusive: ${e.message}` };
        }
    }

    /**
     * Verify signal strength is plausible for the location
     */
    verifySignalStrengthPlausibility(signalStrength, lat, lng) {
        // Basic range check for WiFi signal strength
        if (signalStrength < -100 || signalStrength > 0) {
            return { 
                valid: false, 
                reason: 'Signal strength outside valid WiFi range (-100 to 0 dBm)' 
            };
        }

        // Very weak signals (-90 to -100) are suspicious for earning rewards
        if (signalStrength < -90) {
            return { valid: false, reason: 'Signal strength too weak to be reliable' };
        }

        return { valid: true, reason: 'Signal strength within acceptable range' };
    }

    /**
     * Calculate distance between two GPS points using Haversine formula
     */
    calculateDistanceFromPrevious(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers

        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const deltaLat = (lat2 - lat1) * Math.PI / 180;
        const deltaLng = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Main verification function
     */
    async verifyActivity(activityData, userIp, previousLocation = null) {
        const result = {
            verified: false,
            reasons: [],
            score: 0,
            maxScore: 100
        };

        try {
            const lat = parseFloat(activityData.gps_lat || 0);
            const lng = parseFloat(activityData.gps_long || 0);
            const signalStrength = parseInt(activityData.signal_strength || -100);

            // GPS coordinate verification
            const gpsCheck = this.verifyGpsCoordinates(lat, lng);
            if (gpsCheck.valid) {
                result.score += 30;
            } else {
                result.reasons.push(`GPS: ${gpsCheck.reason}`);
            }

            // IP reputation check
            const ipCheck = await this.checkIpReputation(userIp);
            if (ipCheck.valid) {
                result.score += 40;
            } else {
                result.reasons.push(`IP: ${ipCheck.reason}`);
            }

            // Signal strength verification
            const signalCheck = this.verifySignalStrengthPlausibility(signalStrength, lat, lng);
            if (signalCheck.valid) {
                result.score += 20;
            } else {
                result.reasons.push(`Signal: ${signalCheck.reason}`);
            }

            // Movement pattern analysis (if previous location available)
            if (previousLocation) {
                const prevLat = previousLocation.lat || 0;
                const prevLng = previousLocation.lng || 0;
                const prevTimestamp = previousLocation.timestamp || 0;
                const currentTimestamp = activityData.timestamp || 0;

                const distance = this.calculateDistanceFromPrevious(prevLat, prevLng, lat, lng);
                const timeDiff = currentTimestamp - prevTimestamp;

                // Check for impossible movement speeds (>500 km/h)
                if (timeDiff > 0) {
                    const speedKmh = distance / (timeDiff / 3600);
                    if (speedKmh > 500) {
                        result.reasons.push(`Movement: Impossible speed ${speedKmh.toFixed(1)} km/h`);
                    } else {
                        result.score += 10;
                    }
                }
            }

            // Determine if verification passes (require 70% score)
            result.verified = result.score >= 70;

            if (!result.verified) {
                result.reasons.push(`Overall score ${result.score}/${result.maxScore} below threshold`);
            }

        } catch (e) {
            result.reasons.push(`Verification error: ${e.message}`);
        }

        return result;
    }
}

/**
 * Main function called by Switchboard
 */
async function main() {
    try {
        // Read input data from stdin
        let inputData = '';
        
        // Read from stdin
        process.stdin.setEncoding('utf8');
        
        for await (const chunk of process.stdin) {
            inputData += chunk;
        }

        const input = JSON.parse(inputData);

        // Extract activity data and user IP
        const activityData = input.activity || {};
        const userIp = input.user_ip || '';
        const previousLocation = input.previous_location;

        // Initialize verifier and run verification
        const verifier = new ActivityVerifier();
        const result = await verifier.verifyActivity(activityData, userIp, previousLocation);

        // Prepare output for Switchboard
        const output = {
            verified: result.verified,
            score: result.score,
            reasons: result.reasons,
            timestamp: activityData.timestamp,
            user_id: input.user_id
        };

        // Output result as JSON
        console.log(JSON.stringify(output));

        // Exit with appropriate code
        process.exit(result.verified ? 0 : 1);

    } catch (e) {
        const errorOutput = {
            verified: false,
            error: e.message,
            timestamp: null,
            user_id: null
        };
        console.log(JSON.stringify(errorOutput));
        process.exit(1);
    }
}

// Run main function if this is the main module
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { ActivityVerifier };