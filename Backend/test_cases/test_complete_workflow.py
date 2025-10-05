#!/usr/bin/env python3
"""
Complete workflow test: Create floor plan -> Edit to remove compartment
"""

import requests
import json
from PIL import Image, ImageDraw
import io
import time

# API Configuration
API_BASE_URL = "http://192.168.100.203:5001"

def create_test_image_with_red_marker():
    """Create a test image with a red marker for editing"""
    # Create a simple white image
    img = Image.new('RGB', (600, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple floor plan with multiple rooms
    # Outer walls
    draw.rectangle([50, 50, 550, 350], outline='black', width=3)
    
    # Internal walls
    draw.line([300, 50, 300, 350], fill='black', width=2)  # Vertical wall
    draw.line([50, 200, 550, 200], fill='black', width=2)  # Horizontal wall
    
    # Add room labels
    draw.text((150, 120), "LIVING ROOM", fill='black')
    draw.text((400, 120), "BEDROOM", fill='black')
    draw.text((150, 270), "KITCHEN", fill='black')
    draw.text((400, 270), "BATHROOM", fill='black')
    
    # Add a red marker on the bathroom (to remove it)
    marker_x, marker_y = 450, 300
    draw.ellipse([marker_x-8, marker_y-8, marker_x+8, marker_y+8], fill='red', outline='red')
    draw.text((marker_x+10, marker_y-5), "REMOVE", fill='red')
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def test_complete_workflow():
    """Test complete workflow: create -> edit"""
    print("🔄 Complete Workflow Test: Create -> Edit")
    print("="*60)
    
    # Step 1: Create a floor plan
    print("\n📋 Step 1: Creating Floor Plan...")
    create_data = {
        "zones": [
            {
                "type": "Residential",
                "compartments": ["living room", "bedroom", "kitchen", "bathroom"]
            }
        ]
    }
    
    try:
        print("📤 Sending create request...")
        print(f"📋 Data: {json.dumps(create_data, indent=2)}")
        
        create_response = requests.post(
            f"{API_BASE_URL}/create_plan",
            json=create_data,
            timeout=120
        )
        
        print(f"📊 Create Response Status: {create_response.status_code}")
        
        if create_response.status_code != 200:
            print(f"❌ Create failed: {create_response.status_code}")
            try:
                error_data = create_response.json()
                print(f"📋 Error: {error_data}")
            except:
                print(f"📋 Raw Response: {create_response.text}")
            return
        
        create_result = create_response.json()
        print("✅ Floor plan created successfully!")
        print(f"📋 Status: {create_result['status']}")
        print(f"📝 Message: {create_result['message']}")
        
        # Extract the generated image URL
        original_image_url = create_result['results'][0]['image_url']
        print(f"🖼️  Original Image URL: {original_image_url}")
        
        # Step 2: Edit the floor plan to remove a compartment
        print("\n📋 Step 2: Editing Floor Plan to Remove Compartment...")
        
        # Create test image with red marker
        print("🎨 Creating test image with red marker...")
        test_image = create_test_image_with_red_marker()
        
        edit_data = {
            "image_url": original_image_url,
            "action_type": "REMOVE",
            "prompt": "Remove the bathroom compartment at the red marker location"
        }
        
        files = {
            'edited_image': ('remove_bathroom.png', test_image, 'image/png')
        }
        
        print("📤 Sending edit request...")
        print(f"📋 Edit Data: {json.dumps(edit_data, indent=2)}")
        print("🎯 Action: REMOVE bathroom compartment")
        
        edit_response = requests.post(
            f"{API_BASE_URL}/edit",
            data=edit_data,
            files=files,
            timeout=120
        )
        
        print(f"📊 Edit Response Status: {edit_response.status_code}")
        
        if edit_response.status_code == 200:
            edit_result = edit_response.json()
            print("✅ Floor plan edited successfully!")
            print(f"📋 Status: {edit_result['status']}")
            print(f"🎯 Action Type: {edit_result['action_type']}")
            print(f"📝 Prompt: {edit_result['prompt']}")
            print(f"🖼️  Edited Image URL: {edit_result['result_image_url']}")
            print(f"📁 Local Path: {edit_result['result_image_path']}")
            
            print("\n🎉 Complete Workflow Test Results:")
            print("="*50)
            print("✅ Step 1: Floor plan created successfully")
            print("✅ Step 2: Floor plan edited to remove bathroom")
            print(f"📋 Original: {original_image_url}")
            print(f"📋 Edited: {edit_result['result_image_url']}")
            print("="*50)
            
        else:
            print(f"❌ Edit failed: {edit_response.status_code}")
            try:
                error_data = edit_response.json()
                print(f"📋 Error: {error_data}")
            except:
                print(f"📋 Raw Response: {edit_response.text}")
                
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - AI processing may take longer")
    except Exception as e:
        print(f"❌ Workflow Error: {e}")

def main():
    """Run the complete workflow test"""
    print("🧪 Complete Floor Plan Workflow Test")
    print("="*60)
    print("This test will:")
    print("1. Create a residential floor plan with 4 compartments")
    print("2. Edit it to remove the bathroom compartment")
    print("="*60)
    
    test_complete_workflow()

if __name__ == "__main__":
    main()
