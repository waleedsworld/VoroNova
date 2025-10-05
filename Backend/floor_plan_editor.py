#!/usr/bin/env python3
"""
Interactive Floor Plan Editor using Replicate
This script allows users to generate floor plans, manually edit them, and process them with AI prompts.
"""

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
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FloorPlanEditor:
    def __init__(self):
        self.rendered_folder = "rendered"
        self.changes_folder = "changes"
        self.test_folder = "test"
        
        # Get API keys from environment variables
        self.replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
        self.imgbb_api_key = os.getenv("IMGBB_API_KEY")
        
        # Validate required environment variables
        if not self.replicate_api_token:
            raise ValueError("REPLICATE_API_TOKEN environment variable is required")
        if not self.imgbb_api_key:
            raise ValueError("IMGBB_API_KEY environment variable is required")
        
        self.original_reference_image = None  # Store original reference image
        self.original_reference_url = None    # Store uploaded reference URL
        self.original_zone = None             # Store original zone type
        self.original_compartments = None     # Store original compartments
        self.ensure_folders_exist()
        self.setup_replicate()
        
    def ensure_folders_exist(self):
        """Create folders if they don't exist"""
        os.makedirs(self.rendered_folder, exist_ok=True)
        os.makedirs(self.changes_folder, exist_ok=True)
        os.makedirs(self.test_folder, exist_ok=True)
    
    def setup_replicate(self):
        """Set up Replicate API token"""
        os.environ["REPLICATE_API_TOKEN"] = self.replicate_api_token
    
    def upload_to_imgbb(self, image_path):
        """Upload image to imgbb and return URL"""
        try:
            with open(image_path, "rb") as file:
                image_data = base64.b64encode(file.read()).decode()
            
            url = "https://api.imgbb.com/1/upload"
            payload = {
                "key": self.imgbb_api_key,
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
        
    def get_zone_information(self):
        """Get zone type from user"""
        print("\n" + "="*60)
        print("🏢 FLOOR PLAN GENERATOR")
        print("="*60)
        print("What type of zone/building is this?")
        print("Examples: Residential, Commercial, Office, Retail, Industrial, Educational, Healthcare, etc.")
        
        while True:
            zone = input("\nZone type: ").strip()
            if zone:
                return zone
            print("❌ Please enter a valid zone type.")
    
    def get_compartment_details(self):
        """Get number of compartments and their details from user"""
        print(f"\n📐 COMPARTMENT DETAILS")
        print("-" * 40)
        
        # Get number of compartments
        while True:
            try:
                num_compartments = int(input("How many compartments/rooms do you want? "))
                if num_compartments > 0:
                    break
                print("❌ Please enter a positive number.")
            except ValueError:
                print("❌ Please enter a valid number.")
        
        compartments = []
        
        print(f"\n📝 Now describe each of the {num_compartments} compartments:")
        print("Include: room type, size, special features, etc.")
        print("-" * 50)
        
        for i in range(num_compartments):
            while True:
                compartment_desc = input(f"Compartment {i+1}: ").strip()
                if compartment_desc:
                    compartments.append(compartment_desc)
                    break
                print("❌ Please enter a description for this compartment.")
        
        return compartments
    
    def get_reference_image(self):
        """Get reference image from test folder"""
        print(f"\n🖼️  REFERENCE IMAGE SELECTION")
        print("-" * 40)
        
        # List available reference images
        reference_files = []
        if os.path.exists(self.test_folder):
            reference_files = [f for f in os.listdir(self.test_folder) 
                             if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'))]
        
        if not reference_files:
            print("❌ No reference images found in test folder.")
            return None
            
        print("Available reference images:")
        for i, file in enumerate(reference_files, 1):
            print(f"  {i}. {file}")
        
        print(f"  {len(reference_files) + 1}. Skip reference image")
        
        while True:
            try:
                choice = int(input(f"\nSelect reference image (1-{len(reference_files) + 1}): "))
                if 1 <= choice <= len(reference_files):
                    selected_file = reference_files[choice - 1]
                    filepath = os.path.join(self.test_folder, selected_file)
                    print(f"✅ Selected: {selected_file}")
                    return filepath
                elif choice == len(reference_files) + 1:
                    print("✅ Skipping reference image")
                    return None
                else:
                    print(f"❌ Please enter a number between 1 and {len(reference_files) + 1}")
            except ValueError:
                print("❌ Please enter a valid number.")
    
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
    
    def generate_consistent_processing_prompt(self, action_type, user_prompt):
        """Generate a CAD tool prompt that maintains consistency with original design"""
        if not self.original_zone or not self.original_compartments:
            return user_prompt
        
        compartment_list = "\n".join([f"- {comp}" for comp in self.original_compartments])
        
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

Original Building Type: {self.original_zone}
Original Compartments:
{compartment_list}

CRITICAL REQUIREMENTS:
- The floor plan MUST remain ONE SINGLE, CONTINUOUS SHAPE
- NO gaps, spaces, or distances between compartments
- All rooms must stay connected and integrated into one unified building structure
- Compartments should share walls and be directly adjacent to each other

Style: Technical architectural drawing, professional floor plan, clear line work, detailed room layouts, SINGLE CONTINUOUS BUILDING STRUCTURE"""
        
        return consistent_prompt
    
    def generate_initial_floor_plan(self, prompt, reference_image_path=None, aspect_ratio="16:9"):
        """Generate initial floor plan using Replicate and save to rendered folder"""
        print(f"\n🎨 Generating floor plan...")
        if reference_image_path:
            print(f"📷 Using reference image: {os.path.basename(reference_image_path)}")
            print("📤 Uploading reference image to imgbb...")
            image_url = self.upload_to_imgbb(reference_image_path)
            if not image_url:
                print("❌ Failed to upload reference image. Proceeding without it.")
                reference_image_path = None
            else:
                print(f"✅ Reference image uploaded: {image_url}")
                # Store reference information for later use
                self.original_reference_image = reference_image_path
                self.original_reference_url = image_url
        print("⏳ This may take a few moments...")
        
        try:
            input_data = {
                "prompt": prompt
            }
            
            # Add reference image if provided using image_input array
            if reference_image_path:
                # Use URL if available, otherwise use file path
                if 'image_url' in locals() and image_url:
                    input_data["image_input"] = [image_url]
                else:
                    # Use file path directly
                    input_data["image_input"] = [reference_image_path]
            
            output = replicate.run(
                "google/nano-banana",
                input=input_data
            )
            
            # Generate timestamp for unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"floor_plan_{timestamp}.jpg"
            filepath = os.path.join(self.rendered_folder, filename)
            
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
    
    def display_image(self, image_path):
        """Display image to user using system default image viewer"""
        try:
            if platform.system() == "Darwin":  # macOS
                subprocess.run(["open", image_path])
            elif platform.system() == "Windows":
                os.startfile(image_path)
            else:  # Linux
                subprocess.run(["xdg-open", image_path])
            print(f"🖼️  Floor plan opened: {image_path}")
        except Exception as e:
            print(f"⚠️  Could not open image automatically: {e}")
            print(f"Please manually open: {image_path}")
    
    def get_user_action_type(self):
        """Get action type from user"""
        print("\n" + "="*60)
        print("🔧 CAD OPERATION TYPE")
        print("="*60)
        print("What type of operation do you want to perform?")
        print("1. ADD - Add a new element (door, window, room, etc.)")
        print("2. MODIFY - Change an existing element (door swing, window type, etc.)")
        print("="*60)
        
        while True:
            choice = input("Enter operation type (ADD/MODIFY): ").strip().upper()
            if choice in ["ADD", "MODIFY"]:
                return choice
            print("❌ Please enter either 'ADD' or 'MODIFY'.")
    
    def get_user_prompt(self):
        """Get detailed prompt from user via terminal input"""
        print("\n" + "="*60)
        print("📝 CAD OPERATION DETAILS")
        print("="*60)
        print("Enter your specific operation details:")
        print("Examples for ADD:")
        print("- 'Add a standard single interior door at the red marker'")
        print("- 'Add a window at the red marker'")
        print("- 'Add a conference room at the red marker'")
        print("Examples for MODIFY:")
        print("- 'Change door swing direction to swing into opposite room'")
        print("- 'Change single window to double window at same location'")
        print("- 'Change square table to round table'")
        print("="*60)
        
        while True:
            prompt = input("Operation details: ").strip()
            if prompt:
                return prompt
            print("❌ Please enter valid operation details.")
    
    def get_user_edited_image(self):
        """Get the path to user-edited image from changes folder"""
        print("\n" + "="*60)
        print("✏️  MANUAL FLOOR PLAN EDITING")
        print("="*60)
        print("Instructions:")
        print("1. Edit the floor plan using your preferred image editor")
        print("2. IMPORTANT: Add a RED MARKER (dot, arrow, or circle) at the exact location")
        print("   where you want the CAD operation to be performed")
        print("3. You can add/modify:")
        print("   - Room layouts and furniture")
        print("   - Walls, doors, and windows")
        print("   - Dimensions and labels")
        print("   - Architectural elements")
        print("4. Save the edited floor plan in the 'changes' folder")
        print("5. Enter the filename when prompted")
        print("="*60)
        
        # List existing files in changes folder
        changes_files = [f for f in os.listdir(self.changes_folder) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff'))]
        
        if changes_files:
            print(f"\n📁 Existing files in changes folder:")
            for i, file in enumerate(changes_files, 1):
                print(f"  {i}. {file}")
        
        while True:
            filename = input("\nEnter the filename of your edited floor plan: ").strip()
            if not filename:
                print("❌ Please enter a filename.")
                continue
                
            # Add .jpg extension if no extension provided
            if '.' not in filename:
                filename += '.jpg'
                
            filepath = os.path.join(self.changes_folder, filename)
            
            if os.path.exists(filepath):
                return filepath
            else:
                print(f"❌ File not found: {filepath}")
                print("Please make sure the file exists in the changes folder.")
    
    def process_with_replicate(self, rendered_image_path, edited_image_path, action_type, user_prompt):
        """Process the edited floor plan with Replicate using the user's prompt"""
        print(f"\n🔄 Processing floor plan with {action_type} operation: '{user_prompt}'")
        
        # Generate consistent prompt that maintains original design
        consistent_prompt = self.generate_consistent_processing_prompt(action_type, user_prompt)
        
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
        
        # Use original reference image if available
        if self.original_reference_url:
            print(f"🔄 Using original reference image for consistency: {os.path.basename(self.original_reference_image)}")
        
        print("⏳ Processing with both images - this may take a few moments...")
        
        try:
            # Use google/nano-banana model with image_input array
            input_data = {
                "prompt": consistent_prompt
            }
            
            # For changes processing, only use changes image and rendered image
            input_data["image_input"] = [rendered_url, edited_url]
            print("📷 Rendered image: Added as base structure")
            print("📷 Changes image: Added showing desired modifications")
            
            output = replicate.run(
                "google/nano-banana",
                input=input_data
            )
            
            # Generate timestamp for result filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            result_filename = f"processed_floor_plan_{timestamp}.jpg"
            result_filepath = os.path.join(self.rendered_folder, result_filename)
            
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
            print("💡 Note: You may need to use a different Replicate model that supports image input")
            return None
    
    def run(self):
        """Main interactive loop"""
        print("🏗️  Interactive Floor Plan Editor")
        print("="*60)
        
        # Step 1: Get zone information
        zone = self.get_zone_information()
        self.original_zone = zone  # Store for consistency
        
        # Step 2: Get compartment details
        compartments = self.get_compartment_details()
        self.original_compartments = compartments  # Store for consistency
        
        # Step 3: Select reference image
        reference_image_path = self.get_reference_image()
        
        # Step 4: Generate floor plan prompt
        prompt = self.generate_floor_plan_prompt(zone, compartments)
        
        print(f"\n📋 Generated prompt preview:")
        print("-" * 40)
        print(prompt[:200] + "..." if len(prompt) > 200 else prompt)
        print("-" * 40)
        
        # Step 5: Generate initial floor plan
        image_path = self.generate_initial_floor_plan(prompt, reference_image_path)
        if not image_path:
            print("❌ Failed to generate initial floor plan. Exiting.")
            return
            
        # Step 6: Display the generated floor plan
        self.display_image(image_path)
        
        # Step 7: Get user's action type
        action_type = self.get_user_action_type()
        
        # Step 8: Get user's editing prompt
        user_prompt = self.get_user_prompt()
        
        # Show the consistent prompt that will be used
        consistent_prompt = self.generate_consistent_processing_prompt(action_type, user_prompt)
        print(f"\n📋 CAD Operation: {action_type}")
        print(f"📋 Processing will use TWO images:")
        print("1. 🎨 Rendered Image: The AI-generated floor plan (base structure)")
        print("2. ✏️  Changes Image: Your manually edited version with marker")
        print(f"\n📋 CAD processing prompt preview:")
        print("-" * 50)
        print(consistent_prompt[:300] + "..." if len(consistent_prompt) > 300 else consistent_prompt)
        print("-" * 50)
        
        # Step 9: Get user-edited image
        edited_image_path = self.get_user_edited_image()
        
        # Step 10: Process with Replicate (pass rendered image, not original)
        result_path = self.process_with_replicate(image_path, edited_image_path, action_type, user_prompt)
        
        if result_path:
            print(f"\n🎉 Final floor plan saved to: {result_path}")
            self.display_image(result_path)
        
        print("\n✨ Floor plan editing session complete!")

def main():
    """Main entry point"""
    try:
        editor = FloorPlanEditor()
        editor.run()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
