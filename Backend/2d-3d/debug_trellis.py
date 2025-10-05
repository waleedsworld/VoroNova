#!/usr/bin/env python3
"""
Debug script to see the actual Trellis output structure
"""

import replicate
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API token from environment
replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
if not replicate_api_token:
    raise ValueError("REPLICATE_API_TOKEN environment variable is required")

# Set up Replicate
os.environ["REPLICATE_API_TOKEN"] = replicate_api_token

def debug_trellis_output():
    """Debug the Trellis output to see its structure"""
    print("🔍 Debugging Trellis Output Structure")
    print("="*50)
    
    # The 4 generated 3D angle images
    images = [
        "https://i.ibb.co/ynpVSLNW/3badfb000a8d.jpg",
        "https://i.ibb.co/39p2bKwQ/5a5e951aab32.jpg",
        "https://i.ibb.co/23vySjMd/1a4e3dfc0f1f.jpg",
        "https://i.ibb.co/chPK5QFV/31cfb9ab8bbb.jpg"
    ]
    
    print("⏳ Running Trellis with minimal parameters...")
    
    try:
        output = replicate.run(
            "firtoz/trellis:e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c",
            input={
                "seed": 0,
                "images": images,
                "texture_size": 512,
                "mesh_simplify": 0.9,
                "generate_color": True,
                "generate_model": True,
                "randomize_seed": False,
                "generate_normal": False,
                "save_gaussian_ply": False,
                "ss_sampling_steps": 10,
                "slat_sampling_steps": 5,
                "return_no_background": False,
                "ss_guidance_strength": 5.0,
                "slat_guidance_strength": 2.0
            }
        )
        
        print("\n🔍 Output Type:", type(output))
        print("🔍 Output Content:")
        print(output)
        
        # Try different ways to access the data
        if hasattr(output, '__dict__'):
            print("\n🔍 Output Attributes:")
            for attr in dir(output):
                if not attr.startswith('_'):
                    print(f"  {attr}: {getattr(output, attr)}")
        
        if hasattr(output, 'get'):
            print("\n🔍 Output as dict:")
            print(output.get('output', 'No output key'))
        
        # Save raw output
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        debug_file = f"2d-3d/debug_output_{timestamp}.json"
        
        try:
            with open(debug_file, 'w') as f:
                json.dump(str(output), f, indent=2)
            print(f"\n📁 Raw output saved to: {debug_file}")
        except:
            print("\n❌ Could not save raw output as JSON")
        
        return output
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    debug_trellis_output()
