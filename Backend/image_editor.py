#!/usr/bin/env python3
"""
Interactive Image Editor using Replicate
This script allows users to generate images, manually edit them, and process them with AI prompts.
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
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ImageEditor:
    def __init__(self):
        self.rendered_folder = "rendered"
        self.changes_folder = "changes"
        
        # Get API keys from environment variables
        self.replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
        
        # Validate required environment variables
        if not self.replicate_api_token:
            raise ValueError("REPLICATE_API_TOKEN environment variable is required")
        
        # Set up Replicate
        os.environ["REPLICATE_API_TOKEN"] = self.replicate_api_token
        
        self.ensure_folders_exist()
        
    def ensure_folders_exist(self):
        """Create folders if they don't exist"""
        os.makedirs(self.rendered_folder, exist_ok=True)
        os.makedirs(self.changes_folder, exist_ok=True)
        
    def generate_initial_image(self, prompt, aspect_ratio="4:3"):
        """Generate initial image using Replicate and save to rendered folder"""
        print(f"🎨 Generating image with prompt: '{prompt}'")
        print("⏳ This may take a few moments...")
        
        try:
            input_data = {
                "prompt": prompt,
                "aspect_ratio": aspect_ratio
            }
            
            output = replicate.run(
                "bytedance/seedream-4",
                input=input_data
            )
            
            # Generate timestamp for unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"rendered_{timestamp}.jpg"
            filepath = os.path.join(self.rendered_folder, filename)
            
            # Save the image
            for index, item in enumerate(output):
                with open(filepath, "wb") as file:
                    file.write(item.read())
                    
            print(f"✅ Image saved to: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ Error generating image: {e}")
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
            print(f"🖼️  Image opened: {image_path}")
        except Exception as e:
            print(f"⚠️  Could not open image automatically: {e}")
            print(f"Please manually open: {image_path}")
    
    def get_user_prompt(self):
        """Get prompt from user via terminal input"""
        print("\n" + "="*50)
        print("📝 Enter your editing prompt:")
        print("(Describe what changes you want to make to the image)")
        print("="*50)
        
        while True:
            prompt = input("Prompt: ").strip()
            if prompt:
                return prompt
            print("❌ Please enter a valid prompt.")
    
    def get_user_edited_image(self):
        """Get the path to user-edited image from changes folder"""
        print("\n" + "="*50)
        print("✏️  Manual Editing Instructions:")
        print("1. Edit the image using your preferred image editor")
        print("2. Save the edited image in the 'changes' folder")
        print("3. Enter the filename when prompted")
        print("="*50)
        
        # List existing files in changes folder
        changes_files = [f for f in os.listdir(self.changes_folder) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff'))]
        
        if changes_files:
            print(f"\n📁 Existing files in changes folder:")
            for i, file in enumerate(changes_files, 1):
                print(f"  {i}. {file}")
        
        while True:
            filename = input("\nEnter the filename of your edited image: ").strip()
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
    
    def process_with_replicate(self, original_image_path, edited_image_path, prompt):
        """Process the edited image with Replicate using the user's prompt"""
        print(f"\n🔄 Processing image with prompt: '{prompt}'")
        print("⏳ This may take a few moments...")
        
        try:
            # For this example, we'll use the same model but with different input
            # You might want to use a different model for image-to-image processing
            input_data = {
                "prompt": prompt,
                "image": open(edited_image_path, "rb"),
                "aspect_ratio": "4:3"
            }
            
            # Note: You may need to use a different model that supports image input
            # This is a placeholder - check Replicate docs for image-to-image models
            output = replicate.run(
                "bytedance/seedream-4",  # This might need to be changed to an image-to-image model
                input=input_data
            )
            
            # Generate timestamp for result filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            result_filename = f"processed_{timestamp}.jpg"
            result_filepath = os.path.join(self.rendered_folder, result_filename)
            
            # Save the processed image
            for index, item in enumerate(output):
                with open(result_filepath, "wb") as file:
                    file.write(item.read())
                    
            print(f"✅ Processed image saved to: {result_filepath}")
            return result_filepath
            
        except Exception as e:
            print(f"❌ Error processing image: {e}")
            print("💡 Note: You may need to use a different Replicate model that supports image input")
            return None
    
    def run(self):
        """Main interactive loop"""
        print("🎨 Interactive Image Editor")
        print("="*50)
        
        # Step 1: Generate initial image
        initial_prompt = input("Enter initial image prompt: ").strip()
        if not initial_prompt:
            print("❌ No prompt provided. Exiting.")
            return
            
        image_path = self.generate_initial_image(initial_prompt)
        if not image_path:
            print("❌ Failed to generate initial image. Exiting.")
            return
            
        # Step 2: Display the generated image
        self.display_image(image_path)
        
        # Step 3: Get user's editing prompt
        user_prompt = self.get_user_prompt()
        
        # Step 4: Get user-edited image
        edited_image_path = self.get_user_edited_image()
        
        # Step 5: Process with Replicate
        result_path = self.process_with_replicate(image_path, edited_image_path, user_prompt)
        
        if result_path:
            print(f"\n🎉 Final result saved to: {result_path}")
            self.display_image(result_path)
        
        print("\n✨ Image editing session complete!")

def main():
    """Main entry point"""
    try:
        editor = ImageEditor()
        editor.run()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
