// API utility functions for the Floor Plan Editor

const API_BASE_URL = 'https://plangen.waleeds.world'

export interface Zone {
  type: string
  compartments: string[]
}

export interface CreatePlanRequest {
  zones: Zone[]
}

export interface CreatePlanResponse {
  status: string
  results: Array<{
    zone_type: string
    compartments: string[]
    image_path: string
    image_url: string
    status: string
  }>
  message: string
}

export interface EditPlanRequest {
  image_url: string
  action_type: 'ADD' | 'MODIFY' | 'REMOVE'
  prompt: string
}

export interface EditPlanResponse {
  status: string
  action_type: string
  prompt: string
  result_image_path: string
  result_image_url: string
  message: string
}

export interface HealthCheckResponse {
  status: string
  message: string
  timestamp: string
}

// Create floor plan
export async function createFloorPlan(request: CreatePlanRequest): Promise<CreatePlanResponse> {
  const response = await fetch(`${API_BASE_URL}/create_plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error(`Failed to create floor plan: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Edit floor plan
export async function editFloorPlan(
  request: EditPlanRequest, 
  editedImage: File, 
  referenceImage?: File
): Promise<EditPlanResponse> {
  const formData = new FormData()
  formData.append('image_url', request.image_url)
  formData.append('action_type', request.action_type)
  formData.append('prompt', request.prompt)
  formData.append('edited_image', editedImage)
  
  if (referenceImage) {
    formData.append('reference_image', referenceImage)
  }

  const response = await fetch(`${API_BASE_URL}/edit`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Failed to edit floor plan: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Health check
export async function healthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Download file
export function downloadFile(filename: string): void {
  const link = document.createElement('a')
  link.href = `${API_BASE_URL}/download/${filename}`
  link.download = filename
  link.click()
}
