#!/usr/bin/env python3
"""
Test script for Floor Plan API
Tests both /create_plan and /edit endpoints
"""

import requests
import json
import time

# API Configuration
API_BASE_URL = "http://192.168.100.203:5001"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing Health Check...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data['status']}")
            print(f"📅 Timestamp: {data['timestamp']}")
            return True
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health Check Error: {e}")
        return False

def test_create_plan():
    """Test the create_plan endpoint"""
    print("\n🏗️  Testing Create Plan...")
    
    # Test data
    test_data = {
        "zones": [
            {
                "type": "Residential",
                "compartments": ["gym", "sleeping room", "kitchen", "bathroom"]
            }
        ]
    }
    
    try:
        print("📤 Sending request...")
        print(f"📋 Data: {json.dumps(test_data, indent=2)}")
        
        response = requests.post(
            f"{API_BASE_URL}/create_plan",
            json=test_data,
            timeout=120  # 2 minutes timeout for AI processing
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Create Plan Success!")
            print(f"📋 Status: {data['status']}")
            print(f"📝 Message: {data['message']}")
            
            for i, result in enumerate(data['results']):
                print(f"\n🏠 Zone {i+1}:")
                print(f"  Type: {result['zone_type']}")
                print(f"  Compartments: {result['compartments']}")
                print(f"  Status: {result['status']}")
                if 'image_url' in result:
                    print(f"  Image URL: {result['image_url']}")
                if 'image_path' in result:
                    print(f"  Image Path: {result['image_path']}")
            
            return data['results'][0] if data['results'] else None
        else:
            print(f"❌ Create Plan Failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📋 Error: {error_data}")
            except:
                print(f"📋 Raw Response: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - AI processing may take longer")
        return None
    except Exception as e:
        print(f"❌ Create Plan Error: {e}")
        return None

def test_edit_plan(original_image_url):
    """Test the edit endpoint (mock test without actual edited image)"""
    print("\n✏️  Testing Edit Plan...")
    
    # Test data
    test_data = {
        "image_url": original_image_url,
        "action_type": "ADD",
        "prompt": "Add a standard single interior door at the red marker"
    }
    
    try:
        print("📤 Sending request...")
        print(f"📋 Data: {json.dumps(test_data, indent=2)}")
        print("⚠️  Note: This test will fail without an actual edited image file")
        
        # Create a dummy file for testing
        dummy_file = {'edited_image': ('test.png', b'dummy content', 'image/png')}
        
        response = requests.post(
            f"{API_BASE_URL}/edit",
            data=test_data,
            files=dummy_file,
            timeout=120
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Edit Plan Success!")
            print(f"📋 Status: {data['status']}")
            print(f"📝 Message: {data['message']}")
            print(f"🎯 Action Type: {data['action_type']}")
            print(f"📝 Prompt: {data['prompt']}")
            if 'result_image_url' in data:
                print(f"🖼️  Result URL: {data['result_image_url']}")
            return data
        else:
            print(f"❌ Edit Plan Failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📋 Error: {error_data}")
            except:
                print(f"📋 Raw Response: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - AI processing may take longer")
        return None
    except Exception as e:
        print(f"❌ Edit Plan Error: {e}")
        return None

def main():
    """Run all tests"""
    print("🧪 Floor Plan API Test Suite")
    print("="*50)
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ Health check failed. API may not be running.")
        return
    
    # Test 2: Create Plan
    print("\n" + "="*50)
    create_result = test_create_plan()
    
    if create_result and 'image_url' in create_result:
        # Test 3: Edit Plan (if create was successful)
        print("\n" + "="*50)
        edit_result = test_edit_plan(create_result['image_url'])
    else:
        print("\n⚠️  Skipping edit test - create plan failed or no image URL")
    
    print("\n" + "="*50)
    print("🏁 Test Suite Complete!")
    print("="*50)

if __name__ == "__main__":
    main()
