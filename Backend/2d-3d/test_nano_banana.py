#!/usr/bin/env python3
"""
Test script for nano-banana to debug the E6716 error
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

def test_nano_banana_simple():
    """Test nano-banana with the simplest possible input"""
    print("🧪 Testing nano-banana with simple input...")
    
    # Use the exact example from the documentation
    input_data = {
        "prompt": "Make the sheets in the style of the logo. Make the scene natural.",
        "image_input": [
            "https://replicate.delivery/pbxt/NbYIclp4A5HWLsJ8lF5KgiYSNaLBBT1jUcYcHYQmN1uy5OnN/tmpcqc07f_q.png",
            "https://replicate.delivery/pbxt/NbYId45yH8s04sptdtPcGqFIhV7zS5GTcdS3TtNliyTAoYPO/Screenshot%202025-08-26%20at%205.30.12%E2%80%AFPM.png"
        ]
    }
    
    try:
        print(f"📝 Input: {input_data}")
        output = replicate.run("google/nano-banana", input=input_data)
        
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
        print(f"🔍 Error type: {type(e).__name__}")
        return False

def test_nano_banana_single_image():
    """Test nano-banana with single image"""
    print("\n🧪 Testing nano-banana with single image...")
    
    input_data = {
        "prompt": "Transform this into a 3D view",
        "image_input": ["https://i.ibb.co/23CKysm1/0b6d930ef9fd.jpg"]
    }
    
    try:
        print(f"📝 Input: {input_data}")
        output = replicate.run("google/nano-banana", input=input_data)
        
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
        print(f"🔍 Error type: {type(e).__name__}")
        return False

def test_nano_banana_minimal():
    """Test nano-banana with minimal input"""
    print("\n🧪 Testing nano-banana with minimal input...")
    
    input_data = {
        "prompt": "3D view",
        "image_input": ["https://i.ibb.co/23CKysm1/0b6d930ef9fd.jpg"]
    }
    
    try:
        print(f"📝 Input: {input_data}")
        output = replicate.run("google/nano-banana", input=input_data)
        
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
        print(f"🔍 Error type: {type(e).__name__}")
        return False

def test_model_info():
    """Test if we can get model information"""
    print("\n🧪 Testing model information...")
    
    try:
        # Try to get model info
        model = replicate.models.get("google/nano-banana")
        print(f"📋 Model: {model}")
        print(f"📋 Model owner: {model.owner}")
        print(f"📋 Model name: {model.name}")
        
        # Try to get predictions
        predictions = list(replicate.predictions.list())
        print(f"📋 Recent predictions: {len(predictions)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error getting model info: {e}")
        return False

if __name__ == "__main__":
    print("🔬 Nano-Banana Debug Test")
    print("=" * 50)
    
    # Test model info first
    test_model_info()
    
    # Test with documentation example
    test_nano_banana_simple()
    
    # Test with single image
    test_nano_banana_single_image()
    
    # Test with minimal input
    test_nano_banana_minimal()
    
    print("\n🏁 Testing complete!")
