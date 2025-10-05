#!/usr/bin/env python3
"""
Test script for Edit endpoint
Creates a simple test image with a red marker
"""

import requests
from PIL import Image, ImageDraw
import io
import os

# API Configuration
API_BASE_URL = "http://192.168.100.203:5001"

def create_test_image_with_marker():
    """Create a simple test image with a red marker"""
    # Create a simple white image
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple floor plan
    # Draw walls
    draw.rectangle([50, 50, 350, 250], outline='black', width=2)
    draw.line([200, 50, 200, 250], fill='black', width=2)  # Vertical wall
    draw.line([50, 150, 350, 150], fill='black', width=2)  # Horizontal wall
    
    # Add room labels
    draw.text((100, 100), "Room 1", fill='black')
    draw.text((250, 100), "Room 2", fill='black')
    draw.text((100, 200), "Room 3", fill='black')
    draw.text((250, 200), "Room 4", fill='black')
    
    # Add a red marker (circle)
    marker_x, marker_y = 300, 200
    draw.ellipse([marker_x-5, marker_y-5, marker_x+5, marker_y+5], fill='red', outline='red')
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def test_edit_endpoint():
    """Test the edit endpoint with a real image"""
    print("✏️  Testing Edit Endpoint with Test Image...")
    
    # First, create a floor plan to edit
    print("📤 Creating initial floor plan...")
    create_data = {
        "zones": [
            {
                "type": "Residential",
                "compartments": ["living room", "bedroom", "kitchen"]
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
        
        # Now test the edit endpoint
        print("\n📤 Testing edit endpoint...")
        
        # Create test image with marker
        test_image = create_test_image_with_marker()
        
        edit_data = {
            "image_url": original_image_url,
            "action_type": "ADD",
            "prompt": "Add a door at the red marker location"
        }
        
        files = {
            'edited_image': ('test_marker.png', test_image, 'image/png')
        }
        
        edit_response = requests.post(
            f"{API_BASE_URL}/edit",
            data=edit_data,
            files=files,
            timeout=120
        )
        
        print(f"📊 Edit Response Status: {edit_response.status_code}")
        
        if edit_response.status_code == 200:
            edit_result = edit_response.json()
            print("✅ Edit Success!")
            print(f"📋 Status: {edit_result['status']}")
            print(f"🎯 Action: {edit_result['action_type']}")
            print(f"📝 Prompt: {edit_result['prompt']}")
            print(f"🖼️  Result URL: {edit_result['result_image_url']}")
        else:
            print(f"❌ Edit Failed: {edit_response.status_code}")
            try:
                error_data = edit_response.json()
                print(f"📋 Error: {error_data}")
            except:
                print(f"📋 Raw Response: {edit_response.text}")
                
    except Exception as e:
        print(f"❌ Test Error: {e}")

if __name__ == "__main__":
    test_edit_endpoint()
