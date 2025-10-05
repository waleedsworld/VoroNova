#!/usr/bin/env python3
"""
Test script to remove bathroom using the existing Screenshot image
"""

import requests
import json
import os
import glob

# API Configuration
API_BASE_URL = "http://192.168.100.203:5001"

def test_remove_bathroom():
    """Test removing bathroom using the existing screenshot image"""
    print("🚽 Testing Remove Bathroom Operation")
    print("="*60)
    
    # Use an existing floor plan image URL
    original_image_url = "https://i.ibb.co/39tcDCxK/6669ef9bee0e.jpg"  # From recent successful test
    print(f"📷 Using existing floor plan: {original_image_url}")
    
    try:
        # Use the existing screenshot image for editing
        print("\n📋 Using existing screenshot image for removal...")
        
        # Find the screenshot file using glob
        screenshot_files = glob.glob("changes/*Screenshot*.png")
        if not screenshot_files:
            print("❌ No screenshot file found in changes folder")
            return
        
        screenshot_path = screenshot_files[0]
        print(f"📷 Found screenshot: {screenshot_path}")
        
        print(f"📷 Using screenshot: {screenshot_path}")
        
        edit_data = {
            "image_url": original_image_url,
            "action_type": "REMOVE",
            "prompt": "Remove the marked bathroom from the given floor plan"
        }
        
        # Open the screenshot file
        with open(screenshot_path, 'rb') as f:
            files = {
                'edited_image': ('Screenshot 2025-10-04 at 8.02.38 PM.png', f, 'image/png')
            }
            
            print("📤 Sending edit request...")
            print(f"📋 Edit Data: {json.dumps(edit_data, indent=2)}")
            print("🎯 Action: REMOVE marked bathroom")
            
            edit_response = requests.post(
                f"{API_BASE_URL}/edit",
                data=edit_data,
                files=files,
                timeout=120
            )
        
        print(f"📊 Edit Response Status: {edit_response.status_code}")
        
        if edit_response.status_code == 200:
            edit_result = edit_response.json()
            print("✅ Bathroom removal successful!")
            print(f"📋 Status: {edit_result['status']}")
            print(f"🎯 Action Type: {edit_result['action_type']}")
            print(f"📝 Prompt: {edit_result['prompt']}")
            print(f"🖼️  Result URL: {edit_result['result_image_url']}")
            print(f"📁 Local Path: {edit_result['result_image_path']}")
            
            print("\n🎉 Bathroom Removal Test Results:")
            print("="*50)
            print("✅ Used existing floor plan image")
            print("✅ Used existing screenshot with red marker")
            print("✅ Bathroom removed from floor plan")
            print(f"📋 Original: {original_image_url}")
            print(f"📋 Result: {edit_result['result_image_url']}")
            print("="*50)
            
        else:
            print(f"❌ Edit failed: {edit_response.status_code}")
            try:
                error_data = edit_response.json()
                print(f"📋 Error: {error_data}")
            except:
                print(f"📋 Raw Response: {edit_response.text}")
                
    except Exception as e:
        print(f"❌ Test Error: {e}")

def main():
    """Run the bathroom removal test"""
    print("🧪 Bathroom Removal Test")
    print("="*60)
    print("This test will:")
    print("1. Use an existing floor plan image")
    print("2. Use the existing screenshot image with red marker")
    print("3. Remove the marked bathroom from the floor plan")
    print("="*60)
    
    test_remove_bathroom()

if __name__ == "__main__":
    main()
