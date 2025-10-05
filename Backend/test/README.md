# Interactive Image Editor with Replicate

An interactive image editor that uses Replicate's AI models to generate and process images based on user prompts and manual edits.

## Features

- 🎨 Generate initial images using Replicate's Seedream 4 model
- ✏️ Manual image editing workflow
- 🤖 AI-powered image processing with custom prompts
- 📁 Organized folder structure for rendered and edited images
- 🖼️ Automatic image viewing on your system

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up your Replicate API token:
```bash
export REPLICATE_API_TOKEN="your_token_here"
```

## Usage

Run the interactive image editor:
```bash
python image_editor.py
```

### Workflow

1. **Initial Generation**: Enter a prompt to generate an initial image
2. **Manual Editing**: The generated image will open automatically. Edit it using your preferred image editor and save it in the `changes/` folder
3. **AI Processing**: Enter a prompt describing the changes you want, and the system will process your edited image with AI
4. **View Results**: The final processed image will be saved and displayed

## Folder Structure

- `rendered/` - Contains AI-generated images
- `changes/` - Contains manually edited images
- `image_editor.py` - Main application script
- `requirements.txt` - Python dependencies

## Notes

- The current implementation uses Seedream 4 for both initial generation and processing
- For image-to-image processing, you may want to use a different Replicate model that supports image input
- Images are automatically opened using your system's default image viewer
- All images are saved with timestamps for easy organization

## Troubleshooting

- Make sure your Replicate API token is set correctly
- Ensure you have write permissions in the project directory
- If images don't open automatically, check the file path and open manually
