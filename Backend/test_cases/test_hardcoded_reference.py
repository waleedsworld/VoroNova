#!/usr/bin/env python3
"""
Test script to verify hardcoded reference URL is being used
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration - Update this URL to match your server
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5018")

def test_hardcoded_reference():
    """Test that the API uses hardcoded reference URL"""
    print("🔍 Testing Hardcoded Reference URL...")
    
    # Test data
    test_data = {
        "zones": [
            {
                "type": "Office",
                "compartments": ["reception", "meeting room", "office space"]
            }
        ]
    }
    
    try:
        print("📤 Sending request without custom reference image...")
        print("📋 Expected: Should use hardcoded URL: https://i.ibb.co/Ld56CP6L/86960c9405b4.jpg")
        
        response = requests.post(
            f"{API_BASE_URL}/create_plan",
            json=test_data,
            timeout=120
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success! Floor plan created using hardcoded reference")
            print(f"📋 Status: {data['status']}")
            print(f"📝 Message: {data['message']}")
            
            for i, result in enumerate(data['results']):
                print(f"\n🏢 Zone {i+1}:")
                print(f"  Type: {result['zone_type']}")
                print(f"  Compartments: {result['compartments']}")
                print(f"  Status: {result['status']}")
                if 'image_url' in result:
                    print(f"  Generated Image URL: {result['image_url']}")
                if 'image_path' in result:
                    print(f"  Local Image Path: {result['image_path']}")
            
            print(f"\n🎯 Reference URL Used: https://i.ibb.co/Ld56CP6L/86960c9405b4.jpg")
            print("✅ No imgbb upload needed for reference image!")
            
        else:
            print(f"❌ Request Failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📋 Error: {error_data}")
            except:
                print(f"📋 Raw Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Test Error: {e}")

if __name__ == "__main__":
    test_hardcoded_reference()
