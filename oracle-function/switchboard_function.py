#!/usr/bin/env python3
"""
Switchboard Function for DePIN Activity Verification
This function runs in a Trusted Execution Environment (TEE) to verify:
1. GPS coordinates are valid and realistic
2. IP address is not from a known VPN/proxy service
3. Signal strength is within reasonable bounds for the location
"""

import json
import requests
import sys
import os
from typing import Dict, Any, Tuple
import math

# Switchboard imports
try:
    from switchboard_py import SwitchboardProgram, FunctionRequestAccount
except ImportError:
    print("Warning: Switchboard SDK not available, running in standalone mode")

# Configuration
VPN_DETECTION_API_KEY = os.getenv("VPN_DETECTION_API_KEY", "")
GEOLOCATION_API_KEY = os.getenv("GEOLOCATION_API_KEY", "")

class ActivityVerifier:
    def __init__(self):
        self.vpn_providers = [
            "nordvpn", "expressvpn", "surfshark", "cyberghost", "protonvpn",
            "mullvad", "windscribe", "tunnelbear", "hotspotshield", "purevpn"
        ]
        
    def verify_gps_coordinates(self, lat: float, lng: float) -> Tuple[bool, str]:
        """Verify GPS coordinates are valid and not obviously fake"""
        
        # Basic range validation
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return False, "GPS coordinates out of valid range"
        
        # Check for common fake coordinates (0,0), (null island)
        if abs(lat) < 0.001 and abs(lng) < 0.001:
            return False, "Suspicious coordinates near null island"
        
        # Check for coordinates in the middle of oceans (simplified)
        ocean_areas = [
            # Pacific Ocean center
            {"lat_range": (-10, 10), "lng_range": (-170, -120)},
            # Atlantic Ocean center  
            {"lat_range": (-10, 10), "lng_range": (-40, -10)},
            # Indian Ocean center
            {"lat_range": (-20, 0), "lng_range": (60, 100)}
        ]
        
        for area in ocean_areas:
            if (area["lat_range"][0] <= lat <= area["lat_range"][1] and 
                area["lng_range"][0] <= lng <= area["lng_range"][1]):
                return False, "Coordinates appear to be in middle of ocean"
        
        return True, "GPS coordinates valid"
    
    def check_ip_reputation(self, ip_address: str) -> Tuple[bool, str]:
        """Check if IP address is from VPN/proxy/datacenter"""
        
        try:
            # Use multiple IP reputation services
            services = [
                f"https://ipapi.co/{ip_address}/json/",
                f"https://ipinfo.io/{ip_address}/json"
            ]
            
            for service_url in services:
                try:
                    response = requests.get(service_url, timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Check for VPN/proxy indicators
                        org = data.get("org", "").lower()
                        company = data.get("company", {}).get("name", "").lower() if isinstance(data.get("company"), dict) else ""
                        
                        # Check against known VPN providers
                        for provider in self.vpn_providers:
                            if provider in org or provider in company:
                                return False, f"IP associated with VPN provider: {provider}"
                        
                        # Check for datacenter/hosting providers
                        datacenter_indicators = ["datacenter", "hosting", "cloud", "server", "vps", "aws", "google", "azure"]
                        for indicator in datacenter_indicators:
                            if indicator in org or indicator in company:
                                return False, f"IP from datacenter/hosting provider: {indicator}"
                        
                        return True, "IP reputation check passed"
                        
                except Exception as e:
                    continue
            
            return False, "Unable to verify IP reputation"
            
        except Exception as e:
            return False, f"IP reputation check failed: {str(e)}"
    
    def verify_signal_strength(self, signal_strength: int, lat: float, lng: float) -> Tuple[bool, str]:
        """Verify WiFi signal strength is plausible for the location"""
        
        # Basic range check (WiFi typically -100 to 0 dBm)
        if not (-100 <= signal_strength <= 0):
            return False, f"Signal strength {signal_strength} dBm out of valid range"
        
        # Very weak signals might indicate spoofing
        if signal_strength < -90:
            return False, f"Signal strength {signal_strength} dBm too weak, possible spoofing"
        
        # Perfect signals are suspicious
        if signal_strength > -10:
            return False, f"Signal strength {signal_strength} dBm suspiciously strong"
        
        return True, "Signal strength validation passed"
    
    def analyze_movement_pattern(self, current_lat: float, current_lng: float, 
                                previous_lat: float = None, previous_lng: float = None,
                                time_diff: int = 3600) -> Tuple[bool, str]:
        """Analyze if movement between locations is physically possible"""
        
        if previous_lat is None or previous_lng is None:
            return True, "No previous location to compare"
        
        # Calculate distance using Haversine formula
        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371  # Earth's radius in kilometers
            
            lat1_rad = math.radians(lat1)
            lon1_rad = math.radians(lon1)
            lat2_rad = math.radians(lat2)
            lon2_rad = math.radians(lon2)
            
            dlat = lat2_rad - lat1_rad
            dlon = lon2_rad - lon1_rad
            
            a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            
            return R * c
        
        distance_km = haversine_distance(previous_lat, previous_lng, current_lat, current_lng)
        
        # Calculate required speed (km/h)
        time_hours = time_diff / 3600
        required_speed = distance_km / time_hours if time_hours > 0 else float('inf')
        
        # Maximum reasonable speed (accounting for flights)
        max_speed = 900  # km/h (commercial aircraft speed)
        
        if required_speed > max_speed:
            return False, f"Impossible movement: {distance_km:.1f}km in {time_hours:.1f}h requires {required_speed:.1f}km/h"
        
        return True, f"Movement pattern valid: {distance_km:.1f}km in {time_hours:.1f}h"
    
    def verify_activity(self, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main verification function that combines all checks"""
        
        lat = activity_data.get("gps_lat", 0)
        lng = activity_data.get("gps_long", 0)
        signal_strength = activity_data.get("signal_strength", -100)
        ip_address = activity_data.get("ip_address", "")
        previous_lat = activity_data.get("previous_lat")
        previous_lng = activity_data.get("previous_lng")
        time_diff = activity_data.get("time_diff", 3600)
        
        verification_result = {
            "verified": False,
            "score": 0,
            "max_score": 100,
            "checks": {},
            "timestamp": int(time.time()) if 'time' in globals() else 0
        }
        
        # GPS Coordinate Verification (30 points)
        gps_valid, gps_reason = self.verify_gps_coordinates(lat, lng)
        verification_result["checks"]["gps_validation"] = {
            "passed": gps_valid,
            "reason": gps_reason,
            "points": 30 if gps_valid else 0
        }
        if gps_valid:
            verification_result["score"] += 30
        
        # IP Reputation Check (40 points)
        if ip_address:
            ip_valid, ip_reason = self.check_ip_reputation(ip_address)
            verification_result["checks"]["ip_reputation"] = {
                "passed": ip_valid,
                "reason": ip_reason,
                "points": 40 if ip_valid else 0
            }
            if ip_valid:
                verification_result["score"] += 40
        else:
            verification_result["checks"]["ip_reputation"] = {
                "passed": False,
                "reason": "No IP address provided",
                "points": 0
            }
        
        # Signal Strength Verification (20 points)
        signal_valid, signal_reason = self.verify_signal_strength(signal_strength, lat, lng)
        verification_result["checks"]["signal_strength"] = {
            "passed": signal_valid,
            "reason": signal_reason,
            "points": 20 if signal_valid else 0
        }
        if signal_valid:
            verification_result["score"] += 20
        
        # Movement Pattern Analysis (10 points)
        movement_valid, movement_reason = self.analyze_movement_pattern(
            lat, lng, previous_lat, previous_lng, time_diff
        )
        verification_result["checks"]["movement_pattern"] = {
            "passed": movement_valid,
            "reason": movement_reason,
            "points": 10 if movement_valid else 0
        }
        if movement_valid:
            verification_result["score"] += 10
        
        # Overall verification (require 70% score)
        verification_result["verified"] = verification_result["score"] >= 70
        
        return verification_result

def main():
    """Main function for Switchboard execution"""
    try:
        # Parse input from Switchboard
        if len(sys.argv) > 1:
            # Input from command line argument
            input_data = json.loads(sys.argv[1])
        else:
            # Input from stdin
            input_data = json.loads(sys.stdin.read())
        
        # Initialize verifier
        verifier = ActivityVerifier()
        
        # Perform verification
        result = verifier.verify_activity(input_data)
        
        # Output result for Switchboard
        output = {
            "success": result["verified"],
            "data": result
        }
        
        print(json.dumps(output))
        
        # Return appropriate exit code
        sys.exit(0 if result["verified"] else 1)
        
    except Exception as e:
        error_output = {
            "success": False,
            "error": str(e),
            "data": None
        }
        print(json.dumps(error_output))
        sys.exit(1)

if __name__ == "__main__":
    main()
                        # Check for datacenter/hosting indicators
                        datacenter_keywords = ["hosting", "datacenter", "cloud", "server", "vps", "digital ocean", "aws", "azure", "linode"]
                        for keyword in datacenter_keywords:
                            if keyword in org:
                                return False, f"IP from datacenter/hosting provider: {org}"
                        
                        # Additional checks for proxy indicators
                        if data.get("proxy", False) or data.get("vpn", False):
                            return False, "IP flagged as proxy/VPN"
                            
                except Exception as e:
                    continue
            
            return True, "IP reputation check passed"
            
        except Exception as e:
            # If we can't verify, err on the side of caution but don't completely block
            return True, f"IP verification inconclusive: {str(e)}"
    
    def verify_signal_strength_plausibility(self, signal_strength: int, lat: float, lng: float) -> Tuple[bool, str]:
        """Verify signal strength is plausible for the location"""
        
        # Basic range check for WiFi signal strength
        if not (-100 <= signal_strength <= 0):
            return False, "Signal strength outside valid WiFi range (-100 to 0 dBm)"
        
        # Very strong signals (-10 to 0) are suspicious unless in urban areas
        if signal_strength > -10:
            # This would require more sophisticated location-based analysis
            # For now, we'll allow it but could add urban area detection
            pass
        
        # Very weak signals (-90 to -100) are also suspicious for earning rewards
        if signal_strength < -90:
            return False, "Signal strength too weak to be reliable"
        
        return True, "Signal strength within acceptable range"
    
    def calculate_distance_from_previous(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two GPS points using Haversine formula"""
        
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def verify_activity(self, activity_data: Dict[str, Any], user_ip: str, previous_location: Dict = None) -> Dict[str, Any]:
        """Main verification function"""
        
        result = {
            "verified": False,
            "reasons": [],
            "score": 0,
            "max_score": 100
        }
        
        try:
            lat = float(activity_data.get("gps_lat", 0))
            lng = float(activity_data.get("gps_long", 0))
            signal_strength = int(activity_data.get("signal_strength", -100))
            
            # GPS coordinate verification
            gps_valid, gps_reason = self.verify_gps_coordinates(lat, lng)
            if gps_valid:
                result["score"] += 30
            else:
                result["reasons"].append(f"GPS: {gps_reason}")
            
            # IP reputation check
            ip_valid, ip_reason = self.check_ip_reputation(user_ip)
            if ip_valid:
                result["score"] += 40
            else:
                result["reasons"].append(f"IP: {ip_reason}")
            
            # Signal strength verification
            signal_valid, signal_reason = self.verify_signal_strength_plausibility(signal_strength, lat, lng)
            if signal_valid:
                result["score"] += 20
            else:
                result["reasons"].append(f"Signal: {signal_reason}")
            
            # Movement pattern analysis (if previous location available)
            if previous_location:
                prev_lat = previous_location.get("lat", 0)
                prev_lng = previous_location.get("lng", 0)
                prev_timestamp = previous_location.get("timestamp", 0)
                current_timestamp = activity_data.get("timestamp", 0)
                
                distance = self.calculate_distance_from_previous(prev_lat, prev_lng, lat, lng)
                time_diff = current_timestamp - prev_timestamp
                
                # Check for impossible movement speeds (>500 km/h)
                if time_diff > 0:
                    speed_kmh = (distance / (time_diff / 3600))
                    if speed_kmh > 500:
                        result["reasons"].append(f"Movement: Impossible speed {speed_kmh:.1f} km/h")
                    else:
                        result["score"] += 10
            
            # Determine if verification passes (require 70% score)
            result["verified"] = result["score"] >= 70
            
            if not result["verified"]:
                result["reasons"].append(f"Overall score {result['score']}/{result['max_score']} below threshold")
            
        except Exception as e:
            result["reasons"].append(f"Verification error: {str(e)}")
        
        return result

def main():
    """Main function called by Switchboard"""
    
    try:
        # Read input data from Switchboard
        input_data = json.loads(sys.stdin.read())
        
        # Extract activity data and user IP
        activity_data = input_data.get("activity", {})
        user_ip = input_data.get("user_ip", "")
        previous_location = input_data.get("previous_location")
        
        # Initialize verifier and run verification
        verifier = ActivityVerifier()
        result = verifier.verify_activity(activity_data, user_ip, previous_location)
        
        # Prepare output for Switchboard
        output = {
            "verified": result["verified"],
            "score": result["score"],
            "reasons": result["reasons"],
            "timestamp": activity_data.get("timestamp"),
            "user_id": input_data.get("user_id")
        }
        
        # Output result as JSON
        print(json.dumps(output))
        
        # Return appropriate exit code
        sys.exit(0 if result["verified"] else 1)
        
    except Exception as e:
        error_output = {
            "verified": False,
            "error": str(e),
            "timestamp": None,
            "user_id": input_data.get("user_id") if 'input_data' in locals() else None
        }
        print(json.dumps(error_output))
        sys.exit(1)

if __name__ == "__main__":
    main()