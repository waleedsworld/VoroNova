#!/usr/bin/env python3
"""
2D to 3D Floor Plan Converter
Generates 4 different 3D angles and creates a 3D model using Trellis
"""

import replicate
import requests
import base64
import os
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration from environment variables
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")

# Validate required environment variables
if not REPLICATE_API_TOKEN:
    raise ValueError("REPLICATE_API_TOKEN environment variable is required")
if not IMGBB_API_KEY:
    raise ValueError("IMGBB_API_KEY environment variable is required")

# Set up Replicate
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

def upload_to_imgbb(image_path):
    """Upload image to imgbb and return URL"""
    try:
        with open(image_path, "rb") as file:
            image_data = base64.b64encode(file.read()).decode()
        
        url = "https://api.imgbb.com/1/upload"
        payload = {
            "key": IMGBB_API_KEY,
            "image": image_data
        }
        
        response = requests.post(url, data=payload)
        response.raise_for_status()
        
        result = response.json()
        if result["success"]:
            return result["data"]["url"]
        else:
            print(f"❌ Failed to upload to imgbb: {result}")
            return None
            
    except Exception as e:
        print(f"❌ Error uploading to imgbb: {e}")
        return None

def generate_3d_angle(prompt, image_url, angle_name):
    """Generate a 3D angle using google/nano-banana"""
    print(f"\n🎨 Generating {angle_name}...")
    print(f"📷 Using image: {image_url}")
    print("⏳ This may take a few moments...")
    
    try:
        # Simplify prompt for nano-banana - it works better with simple, clear instructions
        simple_prompt = f"Transform this floor plan into a 3D architectural visualization. {prompt[:50]}..."
        
        input_data = {
            "prompt": simple_prompt,
            "image_input": [image_url]
        }
        
        print(f"🔧 Using prompt: {simple_prompt}")
        
        # Run nano-banana - it returns an iterator
        output = replicate.run(
            "google/nano-banana",
            input=input_data
        )
        
        # Handle the iterator output from nano-banana
        result_url = None
        for item in output:
            if hasattr(item, 'url'):
                result_url = item.url()
                break
            elif isinstance(item, str) and item.startswith('http'):
                result_url = item
                break
        
        if not result_url:
            print(f"❌ No valid output URL received from nano-banana")
            return None
        
        print(f"📥 Generated image URL: {result_url}")
        
        # Download the generated image
        response = requests.get(result_url)
        response.raise_for_status()
        image_data = response.content
        
        # Save the generated image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"3d_{angle_name.lower().replace(' ', '_')}_{timestamp}.jpg"
        filepath = f"2d-3d/{filename}"
        
        # Ensure directory exists
        os.makedirs("2d-3d", exist_ok=True)
        
        with open(filepath, "wb") as file:
            file.write(image_data)
        
        print(f"✅ {angle_name} saved to: {filepath}")
        
        # Upload to imgbb
        print(f"📤 Uploading {angle_name} to imgbb...")
        imgbb_url = upload_to_imgbb(filepath)
        
        if imgbb_url:
            print(f"✅ {angle_name} uploaded: {imgbb_url}")
            return imgbb_url
        else:
            print(f"❌ Failed to upload {angle_name}")
            return None
            
    except Exception as e:
        print(f"❌ Error generating {angle_name}: {e}")
        print(f"🔍 Full error details: {type(e).__name__}: {str(e)}")
        return None

def create_3d_model(image_urls):
    """Create 3D model using Trellis"""
    print(f"\n🏗️  Creating 3D model with Trellis...")
    print(f"📷 Using {len(image_urls)} images")
    print("⏳ This may take several minutes...")
    
    try:
        # Use correct parameters based on schema
        output = replicate.run(
            "firtoz/trellis:e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c",
            input={
                "seed": 0,
                "images": image_urls,
                "texture_size": 1024,
                "mesh_simplify": 0.9,  # Minimum allowed value
                "generate_color": True,
                "generate_model": True,  # Enable GLB generation
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
        
        print("✅ 3D model creation completed!")
        return output
        
    except Exception as e:
        print(f"❌ Error creating 3D model: {e}")
        print("🔄 Trying with minimal parameters...")
        
        try:
            # Try with minimal parameters
            output = replicate.run(
                "firtoz/trellis:e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c",
                input={
                    "seed": 0,
                    "images": image_urls,
                    "texture_size": 512,
                    "mesh_simplify": 0.7,
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
            
            print("✅ 3D model creation completed with minimal parameters!")
            return output
            
        except Exception as e2:
            print(f"❌ Error with minimal parameters: {e2}")
            return None

def main():
    """Main function to generate 3D angles and create model"""
    print("🏗️  2D to 3D Floor Plan Converter")
    print("="*60)
    
    # Image URLs
    reference_image_url = "https://i.ibb.co/Qj7193Fp/modern-apartment-8151572-jpg-2.webp"
    local_image_path = "/Users/terminator/Scripts/punasa/rendered/processed_floor_plan_20251004_205818_38bf7b42.jpg"
    
    print(f"📷 Reference image: {reference_image_url}")
    print(f"📷 Local image: {local_image_path}")
    
    # Upload local image to imgbb first
    print(f"\n📤 Uploading local image to imgbb...")
    local_image_url = upload_to_imgbb(local_image_path)
    
    if not local_image_url:
        print("❌ Failed to upload local image. Exiting.")
        return
    
    print(f"✅ Local image uploaded: {local_image_url}")
    
    # Define the 4 prompts for different angles (simplified for nano-banana)
    prompts = {
        "High-Angle Master View (Isometric)": "3D isometric view, white walls, no roof",
        
        "Low-Angle Interior Perspective (From Corner A)": "3D interior view from corner, white walls, empty space",
        
        "Low-Angle Interior Perspective (From Corner B)": "3D interior view from opposite corner, white walls, empty space",
        
        "Orthographic Side Section View": "3D side view, white walls, technical style"
    }
    
    # Generate all 4 angles
    generated_urls = []
    
    for angle_name, prompt in prompts.items():
        # Use local image for generation
        url = generate_3d_angle(prompt, local_image_url, angle_name)
        if url:
            generated_urls.append(url)
        else:
            print(f"❌ Failed to generate {angle_name} with local image, trying reference image...")
            # Try with reference image as fallback
            url = generate_3d_angle(prompt, reference_image_url, f"{angle_name} (Reference)")
            if url:
                generated_urls.append(url)
            else:
                print(f"❌ Failed to generate {angle_name} with both images")
    
    if len(generated_urls) < 2:
        print(f"❌ Only generated {len(generated_urls)}/4 angles. Need at least 2 images for 3D model creation.")
        return
    
    if len(generated_urls) < 4:
        print(f"⚠️  Only generated {len(generated_urls)}/4 angles. Proceeding with available images...")
    
    print(f"\n✅ Successfully generated {len(generated_urls)} angles!")
    print("📋 Generated URLs:")
    for i, url in enumerate(generated_urls, 1):
        print(f"  {i}. {url}")
    
    # Create 3D model using Trellis
    print(f"\n🏗️  Creating 3D model with Trellis...")
    model_result = create_3d_model(generated_urls)
    
    if model_result:
        print("\n🎉 3D Model Creation Complete!")
        print("="*60)
        
        # Extract URLs from result (model_result is a dict with URI strings)
        print("📋 Results:")
        if 'model_file' in model_result and model_result['model_file']:
            print(f"🎯 GLB Model: {model_result['model_file']}")
        if 'color_video' in model_result and model_result['color_video']:
            print(f"🎬 Color Video: {model_result['color_video']}")
        if 'gaussian_ply' in model_result and model_result['gaussian_ply']:
            print(f"☁️  Gaussian PLY: {model_result['gaussian_ply']}")
        if 'normal_video' in model_result and model_result['normal_video']:
            print(f"📹 Normal Video: {model_result['normal_video']}")
        if 'combined_video' in model_result and model_result['combined_video']:
            print(f"🎞️  Combined Video: {model_result['combined_video']}")
        
        print("="*60)
        
        # Save results to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"2d-3d/3d_model_results_{timestamp}.txt"
        
        with open(results_file, 'w') as f:
            f.write("3D Model Generation Results\n")
            f.write("="*50 + "\n")
            f.write(f"Generated at: {datetime.now().isoformat()}\n\n")
            f.write("Generated 3D Angles:\n")
            for i, url in enumerate(generated_urls, 1):
                f.write(f"{i}. {url}\n")
            f.write("\n3D Model Results:\n")
            if 'model_file' in model_result and model_result['model_file']:
                f.write(f"GLB Model: {model_result['model_file']}\n")
            if 'color_video' in model_result and model_result['color_video']:
                f.write(f"Color Video: {model_result['color_video']}\n")
            if 'gaussian_ply' in model_result and model_result['gaussian_ply']:
                f.write(f"Gaussian PLY: {model_result['gaussian_ply']}\n")
            if 'normal_video' in model_result and model_result['normal_video']:
                f.write(f"Normal Video: {model_result['normal_video']}\n")
            if 'combined_video' in model_result and model_result['combined_video']:
                f.write(f"Combined Video: {model_result['combined_video']}\n")
        
        print(f"📁 Results saved to: {results_file}")
        
    else:
        print("❌ Failed to create 3D model")

if __name__ == "__main__":
    main()
