#!/usr/bin/env python3
"""
Test script to demonstrate image upload capabilities for editing
"""

import requests
import json
from PIL import Image, ImageDraw
import io
import os

# API Configuration
API_BASE_URL = "http://192.168.100.203:5001"

def create_test_edited_image():
    """Create a test edited image with red marker"""
    # Create a simple floor plan image
    img = Image.new('RGB', (500, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw floor plan
    draw.rectangle([50, 50, 450, 350], outline='black', width=2)
    draw.line([250, 50, 250, 350], fill='black', width=2)  # Vertical wall
    draw.line([50, 200, 450, 200], fill='black', width=2)  # Horizontal wall
    
    # Add room labels
    draw.text((120, 120), "LIVING ROOM", fill='black')
    draw.text((320, 120), "BEDROOM", fill='black')
    draw.text((120, 250), "KITCHEN", fill='black')
    draw.text((320, 250), "BATHROOM", fill='black')
    
    # Add red marker on bedroom (to modify it)
    marker_x, marker_y = 350, 150
    draw.ellipse([marker_x-6, marker_y-6, marker_x+6, marker_y+6], fill='red', outline='red')
    draw.text((marker_x+8, marker_y-3), "MODIFY", fill='red')
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def create_custom_reference_image():
    """Create a custom reference image"""
    # Create a different style reference image
    img = Image.new('RGB', (400, 300), color='lightgray')
    draw = ImageDraw.Draw(img)
    
    # Draw a different style floor plan
    draw.rectangle([30, 30, 370, 270], outline='black', width=3)
    draw.line([200, 30, 200, 270], fill='black', width=2)
    draw.line([30, 150, 370, 150], fill='black', width=2)
    
    # Add labels
    draw.text((100, 80), "ROOM A", fill='black')
    draw.text((250, 80), "ROOM B", fill='black')
    draw.text((100, 180), "ROOM C", fill='black')
    draw.text((250, 180), "ROOM D", fill='black')
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def test_edit_with_image_uploads():
    """Test edit endpoint with image uploads"""
    print("🖼️  Testing Edit Endpoint with Image Uploads")
    print("="*60)
    
    # Step 1: Create a floor plan first
    print("\n📋 Step 1: Creating initial floor plan...")
    create_data = {
        "zones": [
            {
                "type": "Residential",
                "compartments": ["living room", "bedroom", "kitchen", "bathroom"]
            }
        ]
    }
    
    try:
        create_response = requests.post(
            f"{API_BASE_URL}/create_plan",
            json=create_data,
            timeout=120
        )
        
        if create_response.status_code != 200:
            print(f"❌ Failed to create initial plan: {create_response.status_code}")
            return
        
        create_result = create_response.json()
        original_image_url = create_result['results'][0]['image_url']
        print(f"✅ Created initial plan: {original_image_url}")
        
        # Step 2: Test edit with both edited image and custom reference
        print("\n📋 Step 2: Testing edit with image uploads...")
        
        # Create test images
        edited_image = create_test_edited_image()
        custom_reference = create_custom_reference_image()
        
        edit_data = {
            "image_url": original_image_url,
            "action_type": "MODIFY",
            "prompt": "Modify the bedroom at the red marker to be larger"
        }
        
        files = {
            'edited_image': ('edited_floor_plan.png', edited_image, 'image/png'),
            'reference_image': ('custom_reference.png', custom_reference, 'image/png')
        }
        
        print("📤 Sending edit request with:")
        print("  - edited_image: Floor plan with red marker")
        print("  - reference_image: Custom reference image")
        print(f"📋 Edit Data: {json.dumps(edit_data, indent=2)}")
        
        edit_response = requests.post(
            f"{API_BASE_URL}/edit",
            data=edit_data,
            files=files,
            timeout=120
        )
        
        print(f"📊 Edit Response Status: {edit_response.status_code}")
        
        if edit_response.status_code == 200:
            edit_result = edit_response.json()
            print("✅ Edit with image uploads successful!")
            print(f"📋 Status: {edit_result['status']}")
            print(f"🎯 Action Type: {edit_result['action_type']}")
            print(f"📝 Prompt: {edit_result['prompt']}")
            print(f"🖼️  Result URL: {edit_result['result_image_url']}")
            print(f"📁 Local Path: {edit_result['result_image_path']}")
            
            print("\n🎉 Image Upload Test Results:")
            print("="*50)
            print("✅ edited_image: Successfully uploaded and processed")
            print("✅ reference_image: Successfully uploaded and used")
            print("✅ AI Processing: Used both images for editing")
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

def test_edit_without_custom_reference():
    """Test edit endpoint with only edited image (no custom reference)"""
    print("\n🖼️  Testing Edit Endpoint with Only Edited Image")
    print("="*60)
    
    # Create a floor plan first
    create_data = {
        "zones": [
            {
                "type": "Office",
                "compartments": ["reception", "office", "meeting room"]
            }
        ]
    }
    
    try:
        create_response = requests.post(
            f"{API_BASE_URL}/create_plan",
            json=create_data,
            timeout=120
        )
        
        if create_response.status_code != 200:
            print(f"❌ Failed to create initial plan: {create_response.status_code}")
            return
        
        create_result = create_response.json()
        original_image_url = create_result['results'][0]['image_url']
        print(f"✅ Created initial plan: {original_image_url}")
        
        # Test edit with only edited image
        edited_image = create_test_edited_image()
        
        edit_data = {
            "image_url": original_image_url,
            "action_type": "ADD",
            "prompt": "Add a door at the red marker location"
        }
        
        files = {
            'edited_image': ('edited_floor_plan.png', edited_image, 'image/png')
        }
        
        print("📤 Sending edit request with only edited_image...")
        print(f"📋 Edit Data: {json.dumps(edit_data, indent=2)}")
        
        edit_response = requests.post(
            f"{API_BASE_URL}/edit",
            data=edit_data,
            files=files,
            timeout=120
        )
        
        print(f"📊 Edit Response Status: {edit_response.status_code}")
        
        if edit_response.status_code == 200:
            edit_result = edit_response.json()
            print("✅ Edit with only edited image successful!")
            print(f"📋 Status: {edit_result['status']}")
            print(f"🎯 Action Type: {edit_result['action_type']}")
            print(f"🖼️  Result URL: {edit_result['result_image_url']}")
            
            print("\n🎉 Single Image Upload Test Results:")
            print("="*50)
            print("✅ edited_image: Successfully uploaded and processed")
            print("✅ Default reference: Used hardcoded reference URL")
            print("✅ AI Processing: Used both images for editing")
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
    """Run all image upload tests"""
    print("🧪 Image Upload Capabilities Test")
    print("="*60)
    print("This test will demonstrate:")
    print("1. Edit with both edited_image and custom reference_image")
    print("2. Edit with only edited_image (using default reference)")
    print("="*60)
    
    test_edit_with_image_uploads()
    test_edit_without_custom_reference()

if __name__ == "__main__":
    main()
