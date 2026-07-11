import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createFloorPlan,
  editFloorPlan,
  healthCheck,
  downloadFile,
  type CreatePlanRequest,
  type EditPlanRequest,
} from '@/lib/api'

const API_BASE_URL = 'https://plangen.waleeds.world'

// These tests exercise the API client that powers VoroNova's core flow:
// generating a floor plan from a questionnaire, editing it, and health checks.
// The network layer (fetch) is mocked so the suite runs offline and
// deterministically while still asserting the exact request contract.
function mockFetchOnce(body: unknown, init?: { ok?: boolean; status?: number; statusText?: string }) {
  const ok = init?.ok ?? true
  return vi.fn().mockResolvedValue({
    ok,
    status: init?.status ?? (ok ? 200 : 500),
    statusText: init?.statusText ?? (ok ? 'OK' : 'Internal Server Error'),
    json: async () => body,
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createFloorPlan', () => {
  const request: CreatePlanRequest = {
    zones: [{ type: 'living', compartments: ['sleep', 'hygiene'] }],
  }

  it('POSTs JSON to /create_plan and returns the parsed response', async () => {
    const responseBody = { status: 'success', results: [], message: 'ok' }
    const fetchMock = mockFetchOnce(responseBody)
    vi.stubGlobal('fetch', fetchMock)

    const result = await createFloorPlan(request)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${API_BASE_URL}/create_plan`)
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(options.body)).toEqual(request)
    expect(result).toEqual(responseBody)
  })

  it('throws with status details when the response is not ok', async () => {
    const fetchMock = mockFetchOnce({}, { ok: false, status: 422, statusText: 'Unprocessable Entity' })
    vi.stubGlobal('fetch', fetchMock)

    await expect(createFloorPlan(request)).rejects.toThrow(
      'Failed to create floor plan: 422 Unprocessable Entity',
    )
  })
})

describe('editFloorPlan', () => {
  const request: EditPlanRequest = {
    image_url: 'https://example.com/plan.png',
    action_type: 'MODIFY',
    prompt: 'make the galley bigger',
  }

  function makeFile(name: string) {
    return new File(['data'], name, { type: 'image/png' })
  }

  it('sends multipart form data to /edit with the required fields', async () => {
    const responseBody = {
      status: 'success',
      action_type: 'MODIFY',
      prompt: request.prompt,
      result_image_path: '/x.png',
      result_image_url: 'https://example.com/x.png',
      message: 'done',
    }
    const fetchMock = mockFetchOnce(responseBody)
    vi.stubGlobal('fetch', fetchMock)

    const edited = makeFile('edited.png')
    const result = await editFloorPlan(request, edited)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${API_BASE_URL}/edit`)
    expect(options.method).toBe('POST')

    const form = options.body as FormData
    expect(form).toBeInstanceOf(FormData)
    expect(form.get('image_url')).toBe(request.image_url)
    expect(form.get('action_type')).toBe('MODIFY')
    expect(form.get('prompt')).toBe(request.prompt)
    expect(form.get('edited_image')).toBeInstanceOf(File)
    // No reference image supplied -> field absent.
    expect(form.get('reference_image')).toBeNull()
    expect(result).toEqual(responseBody)
  })

  it('includes the reference image when provided', async () => {
    const fetchMock = mockFetchOnce({ status: 'success' })
    vi.stubGlobal('fetch', fetchMock)

    await editFloorPlan(request, makeFile('edited.png'), makeFile('reference.png'))

    const form = fetchMock.mock.calls[0][1].body as FormData
    expect(form.get('reference_image')).toBeInstanceOf(File)
  })

  it('throws when the edit request fails', async () => {
    const fetchMock = mockFetchOnce({}, { ok: false, status: 500, statusText: 'Server Error' })
    vi.stubGlobal('fetch', fetchMock)

    await expect(editFloorPlan(request, makeFile('e.png'))).rejects.toThrow(
      'Failed to edit floor plan: 500 Server Error',
    )
  })
})

describe('healthCheck', () => {
  it('GETs /health and returns the payload', async () => {
    const body = { status: 'ok', message: 'healthy', timestamp: '2026-01-01T00:00:00Z' }
    const fetchMock = mockFetchOnce(body)
    vi.stubGlobal('fetch', fetchMock)

    const result = await healthCheck()

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/health`)
    expect(result).toEqual(body)
  })

  it('throws when the service is unhealthy', async () => {
    const fetchMock = mockFetchOnce({}, { ok: false, status: 503, statusText: 'Service Unavailable' })
    vi.stubGlobal('fetch', fetchMock)

    await expect(healthCheck()).rejects.toThrow('Health check failed: 503 Service Unavailable')
  })
})

describe('downloadFile', () => {
  it('creates an anchor pointing at the download endpoint and clicks it', () => {
    const clickSpy = vi.fn()
    const anchor = document.createElement('a')
    anchor.click = clickSpy
    const createSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor)

    downloadFile('plan-123.png')

    expect(createSpy).toHaveBeenCalledWith('a')
    expect(anchor.href).toBe(`${API_BASE_URL}/download/plan-123.png`)
    expect(anchor.download).toBe('plan-123.png')
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })
})
