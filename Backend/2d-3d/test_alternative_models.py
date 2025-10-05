#!/usr/bin/env python3
"""
Test alternative models for 2D to 3D conversion
"""

import replicate
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API token from environment
replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
if not replicate_api_token:
    raise ValueError("REPLICATE_API_TOKEN environment variable is required")

# Set up Replicate
os.environ["REPLICATE_API_TOKEN"] = replicate_api_token

def test_stable_diffusion():
    """Test Stable Diffusion for 2D to 3D conversion"""
    print("🧪 Testing Stable Diffusion...")
    
    input_data = {
        "prompt": "3D architectural visualization, isometric view, white walls, no roof, floor plan",
        "image": "https://i.ibb.co/23CKysm1/0b6d930ef9fd.jpg",
        "num_inference_steps": 20,
        "guidance_scale": 7.5
    }
    
    try:
        print(f"📝 Input: {input_data}")
        output = replicate.run(
            "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input=input_data
        )
        
        print("📥 Output received:")
        for i, item in enumerate(output):
            print(f"  Item {i}: {item}")
            if hasattr(item, 'url'):
                print(f"    URL: {item.url()}")
            elif isinstance(item, str):
                print(f"    String: {item}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_controlnet():
    """Test ControlNet for 2D to 3D conversion"""
    print("\n🧪 Testing ControlNet...")
    
    input_data = {
        "prompt": "3D architectural visualization, isometric view, white walls, no roof",
        "image": "https://i.ibb.co/23CKysm1/0b6d930ef9fd.jpg",
        "num_inference_steps": 20,
        "guidance_scale": 7.5
    }
    
    try:
        print(f"📝 Input: {input_data}")
        output = replicate.run(
            "jagilley/controlnet-canny:aff48af9c68f9e80a07a272a13adc4b4a0b5a396cf7f29558fdb0a6c10b841ef",
            input=input_data
        )
        
        print("📥 Output received:")
        for i, item in enumerate(output):
            print(f"  Item {i}: {item}")
            if hasattr(item, 'url'):
                print(f"    URL: {item.url()}")
            elif isinstance(item, str):
                print(f"    String: {item}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_img2img():
    """Test img2img for 2D to 3D conversion"""
    print("\n🧪 Testing img2img...")
    
    input_data = {
        "prompt": "3D architectural visualization, isometric view, white walls, no roof",
        "image": "https://i.ibb.co/23CKysm1/0b6d930ef9fd.jpg",
        "num_inference_steps": 20,
        "guidance_scale": 7.5,
        "strength": 0.8
    }
    
    try:
        print(f"📝 Input: {input_data}")
        output = replicate.run(
            "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input=input_data
        )
        
        print("📥 Output received:")
        for i, item in enumerate(output):
            print(f"  Item {i}: {item}")
            if hasattr(item, 'url'):
                print(f"    URL: {item.url()}")
            elif isinstance(item, str):
                print(f"    String: {item}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔬 Testing Alternative Models for 2D to 3D Conversion")
    print("=" * 60)
    
    # Test different models
    test_stable_diffusion()
    test_controlnet()
    test_img2img()
    
    print("\n🏁 Testing complete!")
