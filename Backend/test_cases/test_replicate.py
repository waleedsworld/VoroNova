#!/usr/bin/env python3
"""
Test script to verify Replicate API is working
"""

import replicate
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API token from environment
replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
if not replicate_api_token:
    raise ValueError("REPLICATE_API_TOKEN environment variable is required")

# Set API token
os.environ["REPLICATE_API_TOKEN"] = replicate_api_token

def test_replicate():
    """Test basic Replicate functionality"""
    print("🧪 Testing Replicate API...")
    
    try:
        input_data = {
            "prompt": "a photo of a store front called \"Seedream 4\", it sells books, a poster in the window says \"Seedream 4 now on Replicate\""
        }
        
        print("⏳ Generating test image...")
        output = replicate.run(
            "google/nano-banana",
            input=input_data
        )
        
        # Save the test image
        timestamp = "test"
        filename = f"test_output_{timestamp}.jpg"
        
        # Handle different output formats
        if hasattr(output, 'read'):
            # If output is a file-like object
            with open(filename, "wb") as file:
                file.write(output.read())
        elif hasattr(output, 'url'):
            # If output has a URL method
            import requests
            response = requests.get(output.url())
            with open(filename, "wb") as file:
                file.write(response.content)
        else:
            # If output is bytes or other format
            with open(filename, "wb") as file:
                file.write(output)
        
        print(f"✅ Test successful! Image saved as: {filename}")
        if hasattr(output, 'url'):
            print(f"📷 Image URL: {output.url()}")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_replicate()
