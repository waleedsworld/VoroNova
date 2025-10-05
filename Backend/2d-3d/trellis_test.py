#!/usr/bin/env python3
"""
Test script to create 3D model using Trellis with the generated 3D angles
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

def create_trellis_model():
    """Create 3D model using Trellis with the generated images"""
    print("🏗️  Creating 3D Model with Trellis")
    print("="*50)
    
    # The 4 generated 3D angle images
    images = [
        "https://i.ibb.co/ynpVSLNW/3badfb000a8d.jpg",  # High-Angle Master View
        "https://i.ibb.co/39p2bKwQ/5a5e951aab32.jpg",  # Low-Angle Interior A
        "https://i.ibb.co/23vySjMd/1a4e3dfc0f1f.jpg",  # Low-Angle Interior B
        "https://i.ibb.co/chPK5QFV/31cfb9ab8bbb.jpg"   # Orthographic Side View
    ]
    
    print("📷 Using 4 generated 3D angles:")
    for i, url in enumerate(images, 1):
        print(f"  {i}. {url}")
    
    print("\n⏳ Starting Trellis 3D model creation...")
    print("This may take 5-10 minutes...")
    
    try:
        output = replicate.run(
            "firtoz/trellis:e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c",
            input={
                "seed": 0,
                "images": images,
                "texture_size": 1024,
                "mesh_simplify": 0.9,
                "generate_color": True,
                "generate_model": True,
                "randomize_seed": True,
                "generate_normal": False,
                "save_gaussian_ply": True,
                "ss_sampling_steps": 20,
                "slat_sampling_steps": 8,
                "return_no_background": False,
                "ss_guidance_strength": 7.5,
                "slat_guidance_strength": 3
            }
        )
        
        print("\n✅ 3D Model Creation Complete!")
        print("="*50)
        
        # Extract results (output is a dict with URI strings)
        print("📋 Results:")
        if 'model_file' in output and output['model_file']:
            print(f"🎯 GLB Model: {output['model_file']}")
        if 'color_video' in output and output['color_video']:
            print(f"🎬 Color Video: {output['color_video']}")
        if 'gaussian_ply' in output and output['gaussian_ply']:
            print(f"☁️  Gaussian PLY: {output['gaussian_ply']}")
        if 'normal_video' in output and output['normal_video']:
            print(f"📹 Normal Video: {output['normal_video']}")
        if 'combined_video' in output and output['combined_video']:
            print(f"🎞️  Combined Video: {output['combined_video']}")
        if 'no_background_images' in output and output['no_background_images']:
            print(f"🖼️  No Background Images: {len(output['no_background_images'])} images")
        
        # Save results to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"2d-3d/trellis_results_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "input_images": images,
                "results": output
            }, f, indent=2)
        
        print(f"\n📁 Results saved to: {results_file}")
        
        return output
        
    except Exception as e:
        print(f"❌ Error creating 3D model: {e}")
        return None

if __name__ == "__main__":
    create_trellis_model()
