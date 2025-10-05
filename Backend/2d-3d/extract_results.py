#!/usr/bin/env python3
"""
Extract URLs from Trellis FileOutput objects
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

def extract_trellis_results():
    """Extract URLs from Trellis FileOutput objects"""
    print("🎯 Extracting Trellis Results")
    print("="*50)
    
    # The 4 generated 3D angle images
    images = [
        "https://i.ibb.co/ynpVSLNW/3badfb000a8d.jpg",
        "https://i.ibb.co/39p2bKwQ/5a5e951aab32.jpg",
        "https://i.ibb.co/23vySjMd/1a4e3dfc0f1f.jpg",
        "https://i.ibb.co/chPK5QFV/31cfb9ab8bbb.jpg"
    ]
    
    print("⏳ Running Trellis to get FileOutput objects...")
    
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
        
        print("\n✅ Trellis Processing Complete!")
        print("="*50)
        
        # Extract URLs from FileOutput objects
        results = {}
        
        if 'model_file' in output and output['model_file']:
            model_url = output['model_file'].url()
            results['glb_model'] = model_url
            print(f"🎯 GLB Model: {model_url}")
        
        if 'color_video' in output and output['color_video']:
            video_url = output['color_video'].url()
            results['color_video'] = video_url
            print(f"🎬 Color Video: {video_url}")
        
        if 'gaussian_ply' in output and output['gaussian_ply']:
            ply_url = output['gaussian_ply'].url()
            results['gaussian_ply'] = ply_url
            print(f"☁️  Gaussian PLY: {ply_url}")
        
        if 'normal_video' in output and output['normal_video']:
            normal_video_url = output['normal_video'].url()
            results['normal_video'] = normal_video_url
            print(f"📹 Normal Video: {normal_video_url}")
        
        if 'combined_video' in output and output['combined_video']:
            combined_video_url = output['combined_video'].url()
            results['combined_video'] = combined_video_url
            print(f"🎞️  Combined Video: {combined_video_url}")
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"2d-3d/final_results_{timestamp}.json"
        
        final_data = {
            "timestamp": datetime.now().isoformat(),
            "input_images": images,
            "results": results
        }
        
        with open(results_file, 'w') as f:
            json.dump(final_data, f, indent=2)
        
        print(f"\n📁 Final results saved to: {results_file}")
        
        # Create a summary
        print(f"\n🎉 2D to 3D Conversion Complete!")
        print("="*60)
        print("📋 Generated 3D Angles:")
        for i, url in enumerate(images, 1):
            print(f"  {i}. {url}")
        
        print(f"\n🎯 3D Model Results:")
        for key, url in results.items():
            print(f"  {key}: {url}")
        
        return results
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    extract_trellis_results()
