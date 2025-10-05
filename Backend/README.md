# Voronova Backend - AI-Powered Space Architecture Generator

**Status: Under Development**

This is the backend service for Voronova, an AI-powered platform for generating space architecture designs. The system uses custom-crafted datasets of internal and exterior schematics from NASA's space habitat designs to train image generation models.

## Dataset Sources

The training dataset includes schematics from:

- **Lunar Surface Habitat (LSH)** - Surface-based lunar living modules
- **Mars Transit Habitat (MTH)** - Interplanetary transit vehicle designs  
- **NASA Scenario 12.0 Pressurized Core Module (PCM)** - Core pressurized modules
- **TransHab: NASA's Large-Scale Inflatable Spacecraft** - Inflatable habitat technology

### Dataset Overview

| Habitat Type | Images | Description | Key Features |
|--------------|--------|-------------|--------------|
| **Lunar Surface Habitat (LSH)** | 7 schematics | Surface-based lunar living modules | Life support systems, crew quarters, surface operations |
| **Mars Transit Habitat (MTH)** | 3 schematics | Interplanetary transit vehicle designs | Long-duration space travel, crew comfort, mission critical systems |
| **NASA Scenario 12.0 PCM** | 6 schematics | Pressurized Core Module designs | Core habitat structure, modular architecture, safety systems |
| **TransHab Inflatable** | 6 schematics | Large-scale inflatable spacecraft | Expandable habitats, launch efficiency, crew space optimization |

**Total Dataset**: 22 NASA space habitat schematics

### Sample Dataset Images

#### Lunar Surface Habitat (LSH)
![Lunar Surface Habitat - Interior Layout](https://i.ibb.co/zWnxCBVj/fc1d7b3db083.png)
*Interior layout showing crew quarters and life support systems*

![Lunar Surface Habitat - Module Design](https://i.ibb.co/x8GD2JSG/7a9901792ba8.png)
*Modular design with surface operations capabilities*

#### Mars Transit Habitat (MTH)
![Mars Transit Habitat - Crew Quarters](https://i.ibb.co/bjdvNmnm/40235f892177.png)
*Crew quarters designed for long-duration Mars transit*

#### NASA Scenario 12.0 Pressurized Core Module
![NASA PCM - Core Module Layout](https://i.ibb.co/CpxpWbdG/ac616550ddc8.png)
*Core pressurized module with integrated life support*

#### TransHab Inflatable Spacecraft
![TransHab - Inflatable Design](https://i.ibb.co/4Rhc4pvX/0de919b1124e.png)
*Large-scale inflatable habitat design for crew expansion*

## Features

- 🏗️ **Space Architecture Generation**: Create detailed space habitat floor plans using AI
- ✏️ **Interactive Editing**: Edit designs with CAD-like precision (ADD/MODIFY/REMOVE operations)
- 📚 **Custom Dataset Training**: Automatic training using NASA space habitat schematics
- 🌐 **REST API**: Flask-based API for frontend integration
- 🎯 **Multi-Image Training**: Uses multiple reference images simultaneously for better results
- 🔄 **2D-3D Conversion**: Convert 2D floor plans to 3D models using Trellis (demonstration scripts only)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Set up your API keys in `.env`:
```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
IMGBB_API_KEY=your_imgbb_api_key_here
```

## Usage

### REST API Server
```bash
python flask_api.py
```

### Interactive Editor
```bash
python floor_plan_editor.py
```

### 2D to 3D Conversion
```bash
python 2d-3d/main.py
```

## How the AI Models Work

### Image Generation Model (google/nano-banana)

The system uses a unique training approach for space architecture generation:

1. **Dataset Loading**: All NASA space habitat schematics are automatically discovered and uploaded
2. **Multi-Image Training**: Each generation request includes the full dataset as reference images
3. **Real-time Training**: The model learns from NASA's actual space habitat designs during each generation
4. **Style Consistency**: Maintains architectural accuracy by referencing authentic space habitat layouts

**Training Process:**
- NASA schematics are uploaded to imgbb for processing
- The model receives multiple reference images simultaneously
- Each generation learns from the complete dataset of space habitat designs
- Results maintain the technical accuracy and style of NASA's original schematics

#### Training Workflow Example
```
Input: "Create a Mars habitat with crew quarters and life support"
↓
Dataset Loading: 22 NASA schematics uploaded
↓
Multi-Image Training: All schematics sent to google/nano-banana
↓
AI Generation: Model learns from NASA designs
↓
Output: Space habitat design following NASA standards
```

#### Generated vs Training Data Comparison
*The AI model learns from NASA's authentic space habitat designs to generate new layouts that maintain technical accuracy and architectural standards.*

### 3D Model Generation (Trellis)

The 2D to 3D conversion uses the Trellis model:

1. **Multi-Angle Generation**: Creates 4 different 3D perspectives from a 2D floor plan
2. **3D Reconstruction**: Uses the 4 generated angles to create a complete 3D model
3. **Output Formats**: Generates GLB models, color videos, and Gaussian point clouds

**Current Status:** Demonstration scripts only - API integration pending

#### 3D Conversion Workflow
```
2D Space Habitat Floor Plan
↓
Generate 4 Different 3D Angles:
├── High-Angle Master View (Isometric)
├── Low-Angle Interior Perspective (Corner A)
├── Low-Angle Interior Perspective (Corner B)
└── Orthographic Side Section View
↓
Trellis 3D Reconstruction
↓
Output: GLB Model + Color Video + Point Cloud
```

#### 3D Generation Examples
*The Trellis model creates comprehensive 3D models from 2D space habitat designs, enabling visualization of interior spaces and structural elements.*

## Folder Structure

```
voronova-backend/
├── dataset/                    # NASA space habitat schematics
│   ├── Lunar Surface Habitat (LSH)/
│   ├── Mars Transit Habitat (MTH)/
│   ├── NASA Scenario 12.0 Pressurized Core Module (PCM)/
│   └── TransHab: NASAs Large-Scale Inflatable Spacecraft/
├── test_cases/                 # Test scripts
├── 2d-3d/                     # 3D conversion demonstration scripts
│   ├── main.py                # Trellis 3D model generation demo
│   ├── trellis_test.py        # Trellis model testing
│   └── summary.py             # Results summary
├── rendered/                   # Generated space habitat designs
├── changes/                    # User-edited images
├── flask_api.py               # REST API server
├── floor_plan_editor.py       # Interactive editor
├── .env                       # Environment variables
└── requirements.txt           # Dependencies
```

## API Endpoints

- `POST /create_plan` - Create new space habitat designs
- `POST /edit` - Edit existing space habitat designs  
- `GET /health` - Health check

See `API_DOCUMENTATION.md` for detailed API documentation.

## Development Status

### ✅ Completed
- NASA space habitat dataset integration
- Multi-image training system
- REST API for space architecture generation
- CAD-like editing operations (ADD/MODIFY/REMOVE)
- Environment variable configuration
- Test case organization

### 🚧 In Development
- 2D-3D API integration (currently demonstration scripts only)
- Trellis model API endpoints
- Enhanced space habitat design prompts
- Performance optimization for large datasets

### 📋 Missing Features
- **2D-3D API Integration**: The Trellis 3D model generation is currently only available as demonstration scripts
- Real-time 3D model generation endpoints
- Batch processing for multiple designs
- Advanced space habitat validation

## Example Outputs

### Generated Space Habitat Designs
*The AI model generates space habitat layouts that follow NASA's architectural standards and design principles.*

#### Sample Generated Layout
![Generated Space Habitat](https://i.ibb.co/23CKysm1/0b6d930ef9fd.jpg)
*Example of AI-generated space habitat design based on NASA training data*

### 3D Model Outputs
*The Trellis model converts 2D designs into comprehensive 3D models for visualization and analysis.*

#### 3D Angle Generation
- **High-Angle Master View**: Top-down isometric perspective
- **Interior Perspectives**: Human-scale views from different corners
- **Section Views**: Technical cutaway views for structural analysis

#### Output Formats
- **GLB Models**: 3D models for web and VR applications
- **Color Videos**: Animated flythroughs of the habitat
- **Point Clouds**: Detailed spatial data for analysis

## Technical Notes

- Uses `google/nano-banana` model with automatic fallback to `bytedance/seedream-4`
- All NASA schematics are automatically uploaded to imgbb for processing
- Environment variables are used for all configuration
- Test cases are organized in the `test_cases/` folder
- Dataset training happens in real-time with each API call

## Troubleshooting

- Ensure your API keys are correctly set in `.env`
- Check that the `dataset/` folder contains valid NASA schematic images
- Verify write permissions in the project directory
- Check the API documentation for endpoint details
- For 3D generation, use the demonstration scripts in `2d-3d/` folder
