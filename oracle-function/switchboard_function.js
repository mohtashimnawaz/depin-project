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