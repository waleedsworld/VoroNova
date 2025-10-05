# Voronova Backend REST API

A Flask-based REST API for creating and editing space architecture designs using AI with NASA space habitat dataset training capabilities.

## Dataset Training Approach

The API uses a unique training approach where all NASA space habitat schematics from the `dataset/` folder are automatically loaded and used as reference images for the `google/nano-banana` model. This approach:

1. **Automatic Dataset Loading**: All NASA space habitat schematics in the `dataset/` folder (including subfolders) are automatically discovered and uploaded to imgbb
2. **Multi-Image Training**: The model receives multiple reference images simultaneously, allowing it to learn from diverse NASA space habitat designs
3. **No Manual Training Required**: Simply place NASA schematics in the dataset folder and they become part of the training set
4. **Real-time Training**: Each API call includes the full NASA dataset, ensuring consistent space architecture training across all requests

### Dataset Structure
```
dataset/
├── Lunar Surface Habitat (LSH)/
│   ├── Screenshot 2025-10-04 at 11.51.34 PM.png
│   └── ...
├── Mars Transit Habitat (MTH)/
│   ├── Screenshot 2025-10-04 at 11.48.36 PM.png
│   └── ...
└── NASA Scenario 12.0 Pressurized Core Module (PCM)/
    ├── Screenshot 2025-10-04 at 11.45.10 PM.png
    └── ...
```

The system supports all common image formats: PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP.

## Environment Configuration

The API uses environment variables for configuration. Create a `.env` file in the project root:

```env
# API Keys
REPLICATE_API_TOKEN=your_replicate_api_token_here
IMGBB_API_KEY=your_imgbb_api_key_here

# Flask Configuration
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
FLASK_DEBUG=True

# Dataset Configuration
DATASET_FOLDER=dataset
DEFAULT_REFERENCE_IMAGE=test/Profile_Black-2D_Floor_Plan.jpg
HARDCODED_REFERENCE_URL=https://i.ibb.co/Ld56CP6L/86960c9405b4.jpg
```

## Base URL
```
http://localhost:5000
```

## Endpoints

### 1. Create Space Habitat Design
**POST** `/create_plan`

Creates a new space habitat design based on user specifications using NASA space habitat training data.

#### Request Body (JSON)
```json
{
  "zones": [
    {
      "type": "Lunar Surface Habitat",
      "compartments": ["life support", "sleeping quarters", "galley", "hygiene module", "exercise area"]
    },
    {
      "type": "Mars Transit Habitat", 
      "compartments": ["command center", "crew quarters", "medical bay", "storage"]
    }
  ]
}
```

#### Optional File Upload
- `reference_image`: Custom reference image file (optional)
- If not provided, uses hardcoded reference URL: `https://i.ibb.co/Ld56CP6L/86960c9405b4.jpg`

#### Response
```json
{
  "status": "success",
  "results": [
    {
      "zone_type": "Lunar Surface Habitat",
      "compartments": ["life support", "sleeping quarters", "galley", "hygiene module", "exercise area"],
      "image_path": "rendered/space_habitat_20251004_200207_abc123.jpg",
      "image_url": "https://i.ibb.co/xyz/space_habitat.jpg",
      "status": "success"
    }
  ],
  "message": "Generated 1 space habitat design(s)"
}
```

### 2. Edit Space Habitat Design
**POST** `/edit`

Edits an existing space habitat design with specific modifications using CAD-like precision operations.

#### Required Parameters
- `image_url`: URL of the original floor plan to edit
- `action_type`: Type of operation (ADD, MODIFY, REMOVE)
- `prompt`: Description of the changes to make

#### Required File Upload
- `edited_image`: Image file with red marker showing desired changes

#### Optional File Upload
- `reference_image`: Custom reference image file (optional)
- If not provided, uses hardcoded reference URL: `https://i.ibb.co/Ld56CP6L/86960c9405b4.jpg`

#### Request Body (Form Data)
```
image_url: https://i.ibb.co/xyz/original_floor_plan.jpg
action_type: ADD
prompt: Add a standard single interior door at the red marker
edited_image: [file upload with red marker]
reference_image: [optional file upload]
```

**Note**: The `/edit` endpoint requires BOTH an `image_url` (to download the original floor plan) AND an `edited_image` file upload (containing the red marker showing what changes to make). The `image_url` is used to get the original floor plan, while the `edited_image` file shows where and what changes are needed.

#### Action Types
- `ADD`: Add new elements (doors, windows, rooms, etc.)
- `MODIFY`: Change existing elements (door swing, window type, etc.)
- `REMOVE`: Remove existing elements

#### Response
```json
{
  "status": "success",
  "action_type": "ADD",
  "prompt": "Add a standard single interior door at the red marker",
  "result_image_path": "rendered/processed_floor_plan_20251004_200313_def456.jpg",
  "result_image_url": "https://i.ibb.co/xyz/edited_floor_plan.jpg",
  "message": "Floor plan edited successfully"
}
```

### 3. Health Check
**GET** `/health`

Check API status.

#### Response
```json
{
  "status": "healthy",
  "message": "Floor Plan API is running",
  "timestamp": "2025-01-04T20:02:07.123456"
}
```

### 4. Download File
**GET** `/download/<filename>`

Download generated floor plan files.

#### Response
- File download (binary)

## Usage Examples

### Python Example - Create Floor Plan
```python
import requests

# Create floor plan
url = "http://localhost:5000/create_plan"
data = {
    "zones": [
        {
            "type": "Residential",
            "compartments": ["gym", "sleeping room", "kitchen", "bathroom"]
        }
    ]
}

response = requests.post(url, json=data)
result = response.json()
print(f"Floor plan URL: {result['results'][0]['image_url']}")
```

### Python Example - Edit Floor Plan
```python
import requests

# Edit floor plan
url = "http://localhost:5000/edit"
data = {
    "image_url": "https://i.ibb.co/xyz/original_floor_plan.jpg",
    "action_type": "ADD",
    "prompt": "Add a door at the red marker"
}

files = {
    'edited_image': open('edited_floor_plan.png', 'rb')  # File with red marker
}

response = requests.post(url, data=data, files=files)  # Use data, not json
result = response.json()
print(f"Edited floor plan URL: {result['result_image_url']}")
```

### cURL Example - Create Floor Plan
```bash
curl -X POST http://localhost:5000/create_plan \
  -H "Content-Type: application/json" \
  -d '{
    "zones": [
      {
        "type": "Residential",
        "compartments": ["gym", "sleeping room", "kitchen", "bathroom"]
      }
    ]
  }'
```

### cURL Example - Edit Floor Plan (Basic)
```bash
curl -X POST http://localhost:5000/edit \
  -F 'image_url=https://i.ibb.co/xyz/original_floor_plan.jpg' \
  -F 'action_type=ADD' \
  -F 'prompt=Add a door at the red marker' \
  -F 'edited_image=@edited_floor_plan.png'
```

### cURL Example - Edit Floor Plan (With Custom Reference)
```bash
curl -X POST http://localhost:5000/edit \
  -F 'image_url=https://i.ibb.co/xyz/original_floor_plan.jpg' \
  -F 'action_type=ADD' \
  -F 'prompt=Add a door at the red marker' \
  -F 'edited_image=@edited_floor_plan.png' \
  -F 'reference_image=@custom_reference.jpg'
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required field: zones"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate floor plan"
}
```

## File Requirements

### Supported Image Formats
- PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP

### File Size Limit
- Maximum 16MB per file

### Reference Image
- Default: Hardcoded URL `https://i.ibb.co/Ld56CP6L/86960c9405b4.jpg`
- Custom: Upload via `reference_image` field (will be uploaded to imgbb)

## CAD Operation Guidelines

### ADD Operations
- Place red marker at exact location where element should be added
- AI will create clean breaks in walls if needed
- Elements are seamlessly integrated

### MODIFY Operations
- Place red marker on existing element to modify
- AI preserves location and surrounding design
- Only changes specific attributes

### REMOVE Operations
- Place red marker on element to remove
- AI removes element and cleans up connections

## Installation & Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the API server:
```bash
python flask_api.py
```

3. API will be available at `http://localhost:5000`

## Notes

- All generated images are automatically uploaded to imgbb for URL access
- Files are stored locally in `rendered/` and `uploads/` folders
- Each request generates unique filenames to prevent conflicts
- The API uses `google/nano-banana` model for AI processing
- CORS is enabled for cross-origin requests

## Important: Edit Endpoint Requirements

The `/edit` endpoint requires **both**:
1. **`image_url`** - URL of the original floor plan to edit (this gets downloaded)
2. **`edited_image`** - File upload containing the red marker showing what changes to make

This is because the AI needs:
- The original floor plan (from `image_url`) to understand the current layout
- The edited image (from `edited_image` file upload) to see where the red marker is placed and what changes are requested

You cannot use the `/edit` endpoint with just image uploads - you must provide the original floor plan URL.
