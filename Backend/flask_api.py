#!/usr/bin/env python3
"""
Floor Plan Editor REST API
Provides endpoints for creating and editing floor plans using Replicate AI
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import time
import replicate
from PIL import Image, ImageDraw, ImageFont
import requests
from datetime import datetime
import subprocess
import platform
import base64
import uuid
from werkzeug.utils import secure_filename
import json
import glob
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
RENDERED_FOLDER = 'rendered'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# API Configuration from environment variables
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")
DEFAULT_REFERENCE_IMAGE = os.getenv("DEFAULT_REFERENCE_IMAGE", "test/Profile_Black-2D_Floor_Plan.jpg")
HARDCODED_REFERENCE_URL = os.getenv("HARDCODED_REFERENCE_URL", "https://i.ibb.co/Ld56CP6L/86960c9405b4.jpg")
DATASET_FOLDER = os.getenv("DATASET_FOLDER", "dataset")

# Validate required environment variables
if not REPLICATE_API_TOKEN:
    raise ValueError("REPLICATE_API_TOKEN environment variable is required")
if not IMGBB_API_KEY:
    raise ValueError("IMGBB_API_KEY environment variable is required")

class FloorPlanAPI:
    def __init__(self):
        self.ensure_folders_exist()
        self.setup_replicate()
    
    def ensure_folders_exist(self):
        """Create necessary folders if they don't exist"""
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(RENDERED_FOLDER, exist_ok=True)
        os.makedirs('test', exist_ok=True)
    
    def setup_replicate(self):
        """Set up Replicate API token"""
        os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
    
    def get_dataset_images(self):
        """Get all images from the dataset folder and upload them to imgbb"""
        dataset_images = []
        
        if not os.path.exists(DATASET_FOLDER):
            print(f"⚠️  Dataset folder '{DATASET_FOLDER}' not found")
            return dataset_images
        
        # Find all image files in the dataset folder
        image_patterns = ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.bmp', '**/*.tiff', '**/*.webp']
        
        for pattern in image_patterns:
            files = glob.glob(os.path.join(DATASET_FOLDER, pattern), recursive=True)
            dataset_images.extend(files)
        
        print(f"📁 Found {len(dataset_images)} images in dataset folder")
        
        # Upload all dataset images to imgbb
        uploaded_urls = []
        for image_path in dataset_images:
            print(f"📤 Uploading {os.path.basename(image_path)}...")
            url = self.upload_to_imgbb(image_path)
            if url:
                uploaded_urls.append(url)
                print(f"✅ Uploaded: {url}")
            else:
                print(f"❌ Failed to upload: {image_path}")
        
        print(f"🎯 Successfully uploaded {len(uploaded_urls)} dataset images")
        return uploaded_urls
    
    def allowed_file(self, filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    def upload_to_imgbb(self, image_path):
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
    
    def generate_floor_plan_prompt(self, zone, compartments):
        """Generate a detailed prompt for floor plan creation"""
        compartment_list = "\n".join([f"- {comp}" for comp in compartments])
        
        prompt = f"""Create a detailed architectural floor plan for a {zone} building with the following specifications:

Building Type: {zone}
Number of Compartments: {len(compartments)}

Compartment Details:
{compartment_list}

CRITICAL REQUIREMENTS:
- The floor plan MUST be ONE SINGLE, CONTINUOUS SHAPE
- NO gaps, spaces, or distances between compartments
- All rooms must be connected and integrated into one unified building structure
- Compartments should share walls and be directly adjacent to each other
- Create a cohesive, connected layout where all spaces flow together

Additional Requirements:
- Professional architectural floor plan style
- Clear room labels and dimensions
- Proper scale and proportions
- Include doors, windows, and circulation paths
- Show furniture layout where appropriate
- Use standard architectural symbols and conventions
- Clean, technical drawing appearance
- High contrast black and white or grayscale
- Include a north arrow and scale reference

Style: Technical architectural drawing, professional floor plan, clear line work, detailed room layouts, SINGLE CONTINUOUS BUILDING STRUCTURE"""
        
        return prompt
    
    def generate_floor_plan(self, prompt, use_custom_reference=False, custom_reference_path=None):
        """Generate floor plan using Replicate with dataset training images"""
        print(f"🎨 Generating floor plan...")
        
        # Get all dataset images for training
        print("📚 Loading dataset images for training...")
        dataset_urls = self.get_dataset_images()
        
        # Determine which reference image to use
        if use_custom_reference and custom_reference_path:
            print(f"📷 Using custom reference image: {os.path.basename(custom_reference_path)}")
            print("📤 Uploading custom reference image to imgbb...")
            image_url = self.upload_to_imgbb(custom_reference_path)
            if not image_url:
                print("❌ Failed to upload custom reference image. Using hardcoded reference.")
                image_url = HARDCODED_REFERENCE_URL
            else:
                print(f"✅ Custom reference image uploaded: {image_url}")
        else:
            print(f"📷 Using hardcoded reference image: {HARDCODED_REFERENCE_URL}")
            image_url = HARDCODED_REFERENCE_URL
        
        # Combine dataset images with reference image
        all_images = [image_url] + dataset_urls
        print(f"🎯 Using {len(all_images)} total images for training (1 reference + {len(dataset_urls)} dataset images)")
        
        print("⏳ This may take a few moments...")
        
        try:
            input_data = {
                "prompt": prompt,
                "image_input": all_images
            }
            
            output = replicate.run(
                "google/nano-banana",
                input=input_data
            )
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            filename = f"floor_plan_{timestamp}_{unique_id}.jpg"
            filepath = os.path.join(RENDERED_FOLDER, filename)
            
            # Save the image
            # Handle different output formats
            if hasattr(output, 'read'):
                # If output is a file-like object
                with open(filepath, "wb") as file:
                    file.write(output.read())
            elif hasattr(output, 'url'):
                # If output has a URL method
                response = requests.get(output.url())
                with open(filepath, "wb") as file:
                    file.write(response.content)
            else:
                # If output is bytes or other format
                with open(filepath, "wb") as file:
                    file.write(output)
                    
            print(f"✅ Floor plan saved to: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ Error generating floor plan: {e}")
            return None
    
    def process_edit(self, rendered_image_path, edited_image_path, action_type, user_prompt, custom_reference_path=None):
        """Process floor plan edit using Replicate"""
        print(f"🔄 Processing floor plan with {action_type} operation: '{user_prompt}'")
        
        # Generate CAD tool prompt
        if action_type == "ADD":
            operation_definition = """Definition of ADD Operation:
- Identify the target point using the marker in the CHANGES IMAGE
- If the target is on a solid line (like a wall), create a clean break in that line appropriately sized for the new element
- Draw and insert the new element's symbol precisely at the target point
- Ensure the new element is seamlessly integrated with existing lines"""
        else:  # MODIFY
            operation_definition = """Definition of MODIFY Operation:
- Identify the target point using the marker in the CHANGES IMAGE
- Identify the single, existing architectural element closest to the marker (e.g., a specific door, window, or piece of furniture)
- Alter this element based on the specific instructions, but do not delete it or change its core location
- The surrounding design must remain identical
- Modification involves changing an attribute of the element (e.g., door swing direction, window type, furniture shape)"""
        
        consistent_prompt = f"""You are an AI assistant functioning as a precision Computer-Aided Design (CAD) tool. Your primary goal is to modify the provided technical drawing with absolute accuracy.

Part 1: Universal Rules of Engagement (Always Active)
Style & Consistency:
- All changes must be rendered as simple, 2D black-and-white line drawings
- You must perfectly match the line weight, scale, and schematic style of the existing elements in the floor plan
- Forbidden Elements: Do not use any colors, gradients, textures, shadows, or photorealistic/3D effects
- The final output must be a clean, technical drawing

Marker Interpretation:
- The user has placed a visual marker (e.g., a red dot, an arrow) on the CHANGES IMAGE
- The geometric center of this marker is the precise point of action
- This is not a general area; it is a specific coordinate for the operation

Finalization Protocol:
- After the operation is complete, you must completely remove the visual marker and any artifacts from the editing process
- The final image must be clean

Part 2: Operational Definitions
{operation_definition}

Part 3: Task-Specific Instructions
1. Operation Type: {action_type}
2. Visual Marker Description: Red marker in CHANGES IMAGE
3. Execution Details: {user_prompt}

IMPORTANT: You are provided with TWO reference images:
1. RENDERED IMAGE: The AI-generated floor plan (base structure)
2. CHANGES IMAGE: Shows the marker and desired changes

CRITICAL REQUIREMENTS:
- The floor plan MUST remain ONE SINGLE, CONTINUOUS SHAPE
- NO gaps, spaces, or distances between compartments
- All rooms must stay connected and integrated into one unified building structure
- Compartments should share walls and be directly adjacent to each other

Style: Technical architectural drawing, professional floor plan, clear line work, detailed room layouts, SINGLE CONTINUOUS BUILDING STRUCTURE"""
        
        print("📤 Uploading images to imgbb...")
        
        # Upload rendered image (the AI-generated one)
        rendered_url = self.upload_to_imgbb(rendered_image_path)
        if not rendered_url:
            print("❌ Failed to upload rendered image. Proceeding without it.")
            return None
        print(f"✅ Rendered image uploaded: {rendered_url}")
        
        # Upload edited image (the manually edited one)
        edited_url = self.upload_to_imgbb(edited_image_path)
        if not edited_url:
            print("❌ Failed to upload edited image. Proceeding without it.")
            return None
        print(f"✅ Edited image uploaded: {edited_url}")
        
        # Get dataset images for training
        print("📚 Loading dataset images for training...")
        dataset_urls = self.get_dataset_images()
        
        print("⏳ Processing with images - this may take a few moments...")
        
        try:
            # Use google/nano-banana model with image_input array
            input_data = {
                "prompt": consistent_prompt
            }
            
            # For changes processing, use changes image, rendered image, and dataset images
            all_images = [rendered_url, edited_url] + dataset_urls
            input_data["image_input"] = all_images
            print("📷 Rendered image: Added as base structure")
            print("📷 Changes image: Added showing desired modifications")
            print(f"📚 Dataset images: Added {len(dataset_urls)} training images")
            
            output = replicate.run(
                "google/nano-banana",
                input=input_data
            )
            
            # Generate timestamp for result filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            result_filename = f"processed_floor_plan_{timestamp}_{unique_id}.jpg"
            result_filepath = os.path.join(RENDERED_FOLDER, result_filename)
            
            # Save the processed image
            # Handle different output formats
            if hasattr(output, 'read'):
                # If output is a file-like object
                with open(result_filepath, "wb") as file:
                    file.write(output.read())
            elif hasattr(output, 'url'):
                # If output has a URL method
                response = requests.get(output.url())
                with open(result_filepath, "wb") as file:
                    file.write(response.content)
            else:
                # If output is bytes or other format
                with open(result_filepath, "wb") as file:
                    file.write(output)
                    
            print(f"✅ Processed floor plan saved to: {result_filepath}")
            return result_filepath
            
        except Exception as e:
            print(f"❌ Error processing floor plan: {e}")
            return None

# Initialize the API
api = FloorPlanAPI()

@app.route('/create_plan', methods=['POST'])
def create_plan():
    """Create a new floor plan based on user specifications"""
    try:
        # Check if request has JSON data
        if not request.json:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        data = request.json
        
        # Validate required fields
        required_fields = ['zones']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        zones = data['zones']
        if not isinstance(zones, list) or len(zones) == 0:
            return jsonify({'error': 'zones must be a non-empty list'}), 400
        
        # Process each zone
        results = []
        for zone_data in zones:
            # Validate zone data
            if 'type' not in zone_data or 'compartments' not in zone_data:
                return jsonify({'error': 'Each zone must have type and compartments'}), 400
            
            zone_type = zone_data['type']
            compartments = zone_data['compartments']
            
            if not isinstance(compartments, list) or len(compartments) == 0:
                return jsonify({'error': 'compartments must be a non-empty list'}), 400
            
            # Generate prompt
            prompt = api.generate_floor_plan_prompt(zone_type, compartments)
            
            # Check if user uploaded a custom reference image
            use_custom_reference = False
            custom_reference_path = None
            if 'reference_image' in request.files:
                file = request.files['reference_image']
                if file and file.filename != '' and api.allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                    file.save(filepath)
                    use_custom_reference = True
                    custom_reference_path = filepath
            
            # Generate floor plan
            result_path = api.generate_floor_plan(prompt, use_custom_reference, custom_reference_path)
            
            if result_path:
                # Upload result to imgbb for URL access
                result_url = api.upload_to_imgbb(result_path)
                
                results.append({
                    'zone_type': zone_type,
                    'compartments': compartments,
                    'image_path': result_path,
                    'image_url': result_url,
                    'status': 'success'
                })
            else:
                results.append({
                    'zone_type': zone_type,
                    'compartments': compartments,
                    'status': 'failed',
                    'error': 'Failed to generate floor plan'
                })
        
        return jsonify({
            'status': 'success',
            'results': results,
            'message': f'Generated {len(results)} floor plan(s)'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/edit', methods=['POST'])
def edit_plan():
    """Edit an existing floor plan"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            # JSON data
            data = request.json
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
        else:
            # Form data
            data = request.form
            if not data:
                return jsonify({'error': 'No form data provided'}), 400
        
        # Validate required fields
        required_fields = ['image_url', 'action_type', 'prompt']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        image_url = data['image_url']
        action_type = data['action_type'].upper()
        user_prompt = data['prompt']
        
        # Validate action_type
        if action_type not in ['ADD', 'MODIFY', 'REMOVE']:
            return jsonify({'error': 'action_type must be ADD, MODIFY, or REMOVE'}), 400
        
        # Check if user uploaded an edited image
        if 'edited_image' not in request.files:
            return jsonify({'error': 'edited_image file is required'}), 400
        
        edited_file = request.files['edited_image']
        if not edited_file or edited_file.filename == '':
            return jsonify({'error': 'No edited image file provided'}), 400
        
        if not api.allowed_file(edited_file.filename):
            return jsonify({'error': 'Invalid file type for edited image'}), 400
        
        # Save edited image
        filename = secure_filename(edited_file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        edited_filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        edited_file.save(edited_filepath)
        
        # Check if user uploaded a custom reference image for editing
        custom_reference_path = None
        if 'reference_image' in request.files:
            ref_file = request.files['reference_image']
            if ref_file and ref_file.filename != '' and api.allowed_file(ref_file.filename):
                ref_filename = secure_filename(ref_file.filename)
                ref_unique_filename = f"{uuid.uuid4()}_{ref_filename}"
                ref_filepath = os.path.join(UPLOAD_FOLDER, ref_unique_filename)
                ref_file.save(ref_filepath)
                custom_reference_path = ref_filepath
                print(f"📷 Custom reference image uploaded: {ref_filename}")
        
        # Download the original image
        try:
            response = requests.get(image_url)
            response.raise_for_status()
            
            original_filename = f"original_{uuid.uuid4()}.jpg"
            original_filepath = os.path.join(UPLOAD_FOLDER, original_filename)
            
            with open(original_filepath, 'wb') as f:
                f.write(response.content)
                
        except Exception as e:
            return jsonify({'error': f'Failed to download original image: {str(e)}'}), 400
        
        # Process the edit
        result_path = api.process_edit(original_filepath, edited_filepath, action_type, user_prompt, custom_reference_path)
        
        if result_path:
            # Upload result to imgbb for URL access
            result_url = api.upload_to_imgbb(result_path)
            
            return jsonify({
                'status': 'success',
                'action_type': action_type,
                'prompt': user_prompt,
                'result_image_path': result_path,
                'result_image_url': result_url,
                'message': 'Floor plan edited successfully'
            })
        else:
            return jsonify({
                'status': 'failed',
                'error': 'Failed to process floor plan edit'
            }), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Floor Plan API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/download/<path:filename>')
def download_file(filename):
    """Download generated floor plan files"""
    try:
        file_path = os.path.join(RENDERED_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Floor Plan API Server...")
    print("📋 Available endpoints:")
    print("  POST /create_plan - Create new floor plans")
    print("  POST /edit - Edit existing floor plans")
    print("  GET /health - Health check")
    print("  GET /download/<filename> - Download files")
    print("="*50)
    
    app.run(debug=True, host='0.0.0.0', port=5018)
