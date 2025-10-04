"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Send, Sparkles, Layers, Box, Maximize2, Settings, Save, Download, Share, Play, Pause, RotateCcw, Menu, X, ArrowRight, ArrowLeft, Check, Plus, Trash2, Loader2, BarChart3, MessageSquare, ArrowDown } from "lucide-react"
import { createFloorPlan, editFloorPlan, type CreatePlanRequest, type EditPlanRequest } from "@/lib/api"

// Types for the questionnaire system
interface QuestionnaireData {
  destination: string
  crewSize: string
  missionDuration: string
  structureType: string
  fairingSize: string
  priority: string
  selectedZones: string[]
  zoneConfigurations: Array<{
    zoneName: string
    interfaceCount: number
    separationNames: string[]
  }>
}

interface Message {
  role: "user" | "assistant"
  content: string
  type?: "text" | "options" | "input" | "zones" | "separations" | "separation_names" | "api_request"
  options?: Array<{
    label: string
    value: string
    description?: string
  }>
  inputType?: "text" | "number"
  zoneName?: string
  count?: number
  placeholder?: string
  apiRequest?: any
}

interface ZoneType {
  id: string
  name: string
  description: string
  icon: string
}

export default function AppPage() {
  // Chat and questionnaire state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Voronova Space Habitat Designer! I'm your AI assistant. Let's design your space habitat step by step. First, what is your mission destination?",
      type: "options",
      options: [
        { label: "Mars Transit", value: "Mars Transit", description: "Journey to Mars" },
        { label: "Lunar Surface", value: "Lunar Surface", description: "Moon base operations" },
        { label: "Deep Space", value: "Deep Space", description: "Long-term space exploration" },
        { label: "Asteroid Mining", value: "Asteroid Mining", description: "Resource extraction missions" }
      ]
    }
  ])
  const [input, setInput] = useState("")
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    destination: "",
    crewSize: "",
    missionDuration: "",
    structureType: "",
    fairingSize: "",
    priority: "",
    selectedZones: [],
    zoneConfigurations: []
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlans, setGeneratedPlans] = useState<any[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingMode, setDrawingMode] = useState<'pen' | 'circle' | 'none'>('none')
  const [drawings, setDrawings] = useState<Array<{type: 'pen' | 'circle', points: number[], color: string}>>([])
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editActionType, setEditActionType] = useState<'ADD' | 'MODIFY' | 'REMOVE'>('REMOVE')
  const [editPrompt, setEditPrompt] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isProcessingSelection, setIsProcessingSelection] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isTabsExpanded, setIsTabsExpanded] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      // Use scrollHeight directly to go to the very bottom
      container.scrollTop = container.scrollHeight
    }
  }

  // Force scroll to bottom with multiple attempts
  const forceScrollToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      console.log('Force scrolling to bottom, isMobile:', isMobile, 'scrollHeight:', container.scrollHeight, 'clientHeight:', container.clientHeight)
      
      // Try multiple scroll methods
      const scrollToBottom = () => {
        // Method 1: Direct scrollTop assignment
        container.scrollTop = container.scrollHeight
        console.log('Method 1 - scrollTop set to:', container.scrollTop)
        
        // Method 2: scrollTo with instant behavior
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'instant'
        })
        console.log('Method 2 - scrollTo instant, scrollTop:', container.scrollTop)
        
        // Method 3: scrollTo with smooth behavior
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
        console.log('Method 3 - scrollTo smooth, scrollTop:', container.scrollTop)
      }
      
      // Execute immediately
      scrollToBottom()
      
      // Try again after a short delay
      setTimeout(scrollToBottom, 100)
      
      // Final attempt
      setTimeout(scrollToBottom, 300)
    } else {
      console.log('Chat container ref is null, cannot scroll')
    }
  }

  // Auto-scroll when messages change
  useEffect(() => {
    if (!isClient) return
    
    // Use fewer scroll attempts to avoid over-scrolling
    setTimeout(forceScrollToBottom, 100)
    setTimeout(forceScrollToBottom, 300)
  }, [messages, isClient])

  // Initial scroll to bottom when component mounts
  useEffect(() => {
    if (!isClient) return
    
    // Wait for initial render and then scroll to bottom
    setTimeout(forceScrollToBottom, 100)
    setTimeout(forceScrollToBottom, 500)
  }, [isClient])

  // Additional scroll when messages are first loaded
  useEffect(() => {
    if (!isClient || messages.length === 0) return
    
    // Scroll to bottom when messages are first available
    setTimeout(forceScrollToBottom, 200)
  }, [isClient, messages.length])

  // Auto-scroll when chat container ref becomes available
  useEffect(() => {
    if (!isClient || !chatContainerRef.current) return
    
    // When chat container is available, scroll to bottom
    setTimeout(forceScrollToBottom, 100)
  }, [chatContainerRef.current, isClient])

  // Auto-scroll when mobile chat is opened
  useEffect(() => {
    if (showMobileChat && isMobile) {
      setTimeout(forceScrollToBottom, 200)
    }
  }, [showMobileChat, isMobile])

  // Auto-scroll when current question changes (new content appears)
  useEffect(() => {
    if (!isClient) return
    
    // Gentle scrolling to avoid over-scrolling
    setTimeout(() => {
      forceScrollToBottom()
    }, 200)
  }, [currentQuestion, isClient])

  // Check if user is scrolled to bottom
  useEffect(() => {
    if (!isClient) return
    
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
        // Show scroll button if not at bottom, regardless of device type
        setShowScrollButton(!isAtBottom)
        console.log('Scroll check:', { scrollTop, scrollHeight, clientHeight, isAtBottom, showScrollButton: !isAtBottom })
      }
    }

    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll)
      // Initial check
      handleScroll()
      // Also scroll to bottom when container becomes available
      setTimeout(forceScrollToBottom, 100)
      return () => chatContainer.removeEventListener('scroll', handleScroll)
    }
  }, [isClient])

  // Auto-scroll when chat becomes visible (mobile view switching)
  useEffect(() => {
    if (!isClient) return
    
    // When chat becomes visible, scroll to bottom
    if (!isMobile || showMobileChat) {
      setTimeout(forceScrollToBottom, 100)
    }
  }, [isMobile, showMobileChat, isClient])

  const [currentZoneIndex, setCurrentZoneIndex] = useState(0)
  const [currentSeparationIndex, setCurrentSeparationIndex] = useState(0)
  const [isInZoneConfiguration, setIsInZoneConfiguration] = useState(false)

  // Available zone types
  const zoneTypes: ZoneType[] = [
    { id: "residential", name: "Residential", description: "Living quarters, bedrooms, common areas", icon: "🏠" },
    { id: "commercial", name: "Commercial", description: "Office spaces, conference rooms, reception", icon: "🏢" },
    { id: "industrial", name: "Industrial", description: "Workshops, storage, maintenance areas", icon: "🏭" },
    { id: "research", name: "Research", description: "Laboratories, testing facilities, data centers", icon: "🔬" },
    { id: "medical", name: "Medical", description: "Infirmary, emergency care, quarantine", icon: "🏥" },
    { id: "agricultural", name: "Agricultural", description: "Greenhouses, food production, hydroponics", icon: "🌱" }
  ]

  // Client-side detection to prevent hydration errors
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mobile detection and window resize handling
  useEffect(() => {
    if (!isClient) return
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      console.log('Mobile detection:', mobile, 'window.innerWidth:', window.innerWidth)
      setIsMobile(mobile)
      
      // On mobile, show chat by default if no plans are generated yet
      if (mobile && generatedPlans.length === 0) {
        setShowMobileChat(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [generatedPlans.length, isClient])

  // Set up canvas for drawing
  useEffect(() => {
    if (canvasRef) {
      const canvas = canvasRef
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Redraw all drawings
      drawings.forEach(drawing => {
        ctx.strokeStyle = drawing.color
        ctx.lineWidth = 3
        ctx.beginPath()
        
        if (drawing.type === 'pen') {
          for (let i = 0; i < drawing.points.length; i += 2) {
            const x = drawing.points[i]
            const y = drawing.points[i + 1]
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
        } else if (drawing.type === 'circle') {
          ctx.arc(drawing.points[0], drawing.points[1], 20, 0, 2 * Math.PI)
        }
        
        ctx.stroke()
      })

      // Draw current path
      if (currentPath.length > 0) {
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 3
        ctx.beginPath()
        
        if (drawingMode === 'pen') {
          for (let i = 0; i < currentPath.length; i += 2) {
            const x = currentPath[i]
            const y = currentPath[i + 1]
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
        } else if (drawingMode === 'circle') {
          ctx.arc(currentPath[0], currentPath[1], 20, 0, 2 * Math.PI)
        }
        
        ctx.stroke()
      }
    }
  }, [canvasRef, drawings, currentPath, drawingMode])

  // Question flow configuration
  const questions = [
    {
      id: "destination",
      question: "What is your mission destination?",
      type: "options" as const,
      options: [
        { label: "Mars Transit", value: "Mars Transit", description: "Journey to Mars" },
        { label: "Lunar Surface", value: "Lunar Surface", description: "Moon base operations" },
        { label: "Deep Space", value: "Deep Space", description: "Long-term space exploration" },
        { label: "Asteroid Mining", value: "Asteroid Mining", description: "Resource extraction missions" }
      ]
    },
    {
      id: "crewSize",
      question: "What is your crew size?",
      type: "options" as const,
      options: [
        { label: "Two", value: "Two", description: "Minimal crew" },
        { label: "Four", value: "Four", description: "Small team" },
        { label: "Six", value: "Six", description: "Medium crew" },
        { label: "Eight+", value: "Eight+", description: "Large crew" }
      ]
    },
    {
      id: "missionDuration",
      question: "What is your mission duration?",
      type: "options" as const,
      options: [
        { label: "30 Days", value: "30 Days", description: "Short mission" },
        { label: "90 Days", value: "90 Days", description: "Medium mission" },
        { label: "180 Days", value: "180 Days", description: "Long mission" },
        { label: "Long-Term", value: "Long-Term", description: "Permanent settlement" }
      ]
    },
    {
      id: "structureType",
      question: "What is the habitat structure type?",
      type: "options" as const,
      options: [
        { label: "Inflatable", value: "Inflatable", description: "Expandable structure" },
        { label: "Metallic", value: "Metallic", description: "Rigid metal construction" },
        { label: "Hybrid", value: "Hybrid", description: "Combination approach" }
      ]
    },
    {
      id: "fairingSize",
      question: "What is the launch fairing size?",
      type: "options" as const,
      options: [
        { label: "4.5m", value: "4.5m", description: "Standard fairing" },
        { label: "8.4m", value: "8.4m", description: "Large fairing" },
        { label: "10m+", value: "10m+", description: "Extra large fairing" },
        { label: "Custom", value: "Custom", description: "Custom specifications" }
      ]
    },
    {
      id: "priority",
      question: "Which criterion must be prioritized in the design tradeoff process?",
      type: "options" as const,
      options: [
        { label: "Mass", value: "Mass", description: "Minimize total mass for launch efficiency" },
        { label: "Volume", value: "Volume", description: "Maximize usable volume within constraints" },
        { label: "Task Performance", value: "Task Performance", description: "Optimize for operational efficiency" },
        { label: "Crew Health/Safety", value: "Crew Health/Safety", description: "Prioritize crew well-being and safety" }
      ]
    },
    {
      id: "zones",
      question: "We have divided each zone with its own purpose in the habitat to ease everything. Select the zones you need:",
      type: "zones" as const,
      options: zoneTypes.map(zone => ({
        label: zone.name,
        value: zone.id,
        description: zone.description
      }))
    }
  ]

  const handleOptionSelect = (value: string) => {
    console.log('Option selected:', value, 'currentQuestion:', currentQuestion, 'questions.length:', questions.length, 'isMobile:', isMobile)
    
    // Set processing state to show immediate feedback
    setIsProcessingSelection(true)
    
    // Handle special actions
    if (value === "generate" || value === "finalize") {
      generateFloorPlans()
      setIsProcessingSelection(false)
      return
    }
    
    if (value === "modify") {
      setCurrentQuestion(0)
      setCurrentZoneIndex(0)
      setCurrentSeparationIndex(0)
      setIsInZoneConfiguration(false)
      setMessages([{
        role: "assistant",
        content: "Let's start over! What is your mission destination?",
        type: "options",
        options: questions[0].options
      }])
      setQuestionnaireData({
        destination: "",
        crewSize: "",
        missionDuration: "",
        structureType: "",
        fairingSize: "",
        priority: "",
        selectedZones: [],
        zoneConfigurations: []
      })
      return
    }
    
    const currentQ = questions[currentQuestion]
    
    // Add error handling for undefined currentQ
    if (!currentQ) {
      console.error('Current question is undefined. currentQuestion:', currentQuestion, 'questions.length:', questions.length)
      return
    }
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: `Selected: ${value}`,
      type: "text"
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Check if we're in zone configuration mode
    if (isInZoneConfiguration) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.type === "options" && lastMessage.content.includes("physical interfaces and separation in the")) {
        // This is a zone interface count question
        handleZoneInterfaceCount(value)
        return
      }
    }
    
    // Check if we're in separation names input mode
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.type === "separation_names") {
      // This should be handled by the separation names UI, not here
      return
    }
    
    // Update questionnaire data
    if (currentQ.id === "zones") {
      const selectedZone = zoneTypes.find(z => z.id === value)
      if (selectedZone && !questionnaireData.selectedZones.includes(selectedZone.name)) {
        setQuestionnaireData(prev => ({
        ...prev,
          selectedZones: [...prev.selectedZones, selectedZone.name]
        }))
      }
    } else {
      setQuestionnaireData(prev => ({ ...prev, [currentQ.id]: value }))
    }
    
    // Move to next question (except for zones which are handled separately)
    if (currentQ.id !== "zones") {
    setTimeout(() => {
        setCurrentQuestion(prev => {
          const nextIndex = prev + 1
          if (nextIndex >= questions.length) {
            console.warn('Reached end of questions array')
            return prev
          }
          return nextIndex
        })
        
        // Force scroll after question change
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          forceScrollToBottom()
          setTimeout(forceScrollToBottom, 200)
        })
        
        // Reset processing state
        setTimeout(() => setIsProcessingSelection(false), 500)
        
        if (currentQuestion + 1 < questions.length) {
          const nextQ = questions[currentQuestion + 1]
          
          // Special handling for separations - show the separations UI directly
          if (nextQ.id === "separations") {
            const assistantMessage: Message = {
              role: "assistant",
              content: "Now let's define what will exist in each separation. Please specify the compartments for each separation:",
              type: "separations"
            }
            setMessages(prev => [...prev, assistantMessage])
          } else {
            const assistantMessage: Message = {
              role: "assistant",
              content: nextQ.question,
              type: nextQ.type,
              options: nextQ.options
            }
            setMessages(prev => [...prev, assistantMessage])
          }
          
          // Reset processing state when next question is shown
          setIsProcessingSelection(false)
        } else {
          // All basic questions answered, start zone configuration
          startZoneConfiguration()
        }
      }, 1000)
    }
  }

  const startZoneConfiguration = () => {
    if (questionnaireData.selectedZones.length === 0) {
      // No zones selected, show summary
      showSummary()
      return
    }
    
    // Start with first zone
    setCurrentZoneIndex(0)
    setIsInZoneConfiguration(true)
    askZoneInterfaceCount(0)
  }

  const askZoneInterfaceCount = (zoneIndex: number) => {
    const zoneName = questionnaireData.selectedZones[zoneIndex]
    const assistantMessage: Message = {
      role: "assistant",
      content: `What are the number of physical interfaces and separation in the ${zoneName} zone?`,
      type: "options",
      options: [
        { label: "1", value: "1", description: "Minimal separation requirements" },
        { label: "2", value: "2", description: "Moderate separation needs" },
        { label: "3", value: "3", description: "Complex separation requirements" }
      ]
    }
    setMessages(prev => [...prev, assistantMessage])
    
    // Ensure processing state is reset when asking for zone interface count
    setIsProcessingSelection(false)
  }

  const handleZoneInterfaceCount = (value: string) => {
    const count = parseInt(value)
    const zoneName = questionnaireData.selectedZones[currentZoneIndex]
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: value,
      type: "text"
    }
    setMessages(prev => [...prev, userMessage])
    
    // Update zone configuration
    setQuestionnaireData(prev => ({
        ...prev,
      zoneConfigurations: [
        ...prev.zoneConfigurations,
        {
          zoneName,
          interfaceCount: count,
          separationNames: []
        }
      ]
    }))
    
    // Reset processing state immediately
    setIsProcessingSelection(false)
    
    // Start asking for separation names
    setTimeout(() => {
      askSeparationNames(currentZoneIndex, count)
    }, 1000)
  }

  const askSeparationNames = (zoneIndex: number, count: number) => {
    const zoneName = questionnaireData.selectedZones[zoneIndex]
    const assistantMessage: Message = {
          role: "assistant",
      content: `What are the requirements for physical interfaces and separation for ${zoneName}? (Max 3)`,
      type: "separation_names",
      zoneName,
      count
    }
    setMessages(prev => [...prev, assistantMessage])
    
    // Ensure processing state is reset when asking for separation names
    setIsProcessingSelection(false)
  }

  const handleSeparationNames = (names: string[]) => {
    const zoneName = questionnaireData.selectedZones[currentZoneIndex]
    console.log('handleSeparationNames called with:', names, 'for zone:', zoneName, 'at index:', currentZoneIndex)
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: `Separation names: ${names.join(', ')}`,
      type: "text"
    }
    setMessages(prev => [...prev, userMessage])
    
    // Update zone configuration with separation names
    setQuestionnaireData(prev => {
      const updatedConfigurations = [...prev.zoneConfigurations]
      console.log('Current configurations before update:', updatedConfigurations)
      if (updatedConfigurations[currentZoneIndex]) {
        updatedConfigurations[currentZoneIndex] = {
          ...updatedConfigurations[currentZoneIndex],
          separationNames: names
        }
        console.log('Updated configuration at index', currentZoneIndex, ':', updatedConfigurations[currentZoneIndex])
      }
      return {
        ...prev,
        zoneConfigurations: updatedConfigurations
      }
    })
    
    // Reset processing state immediately
    setIsProcessingSelection(false)
    
    // Move to next zone or show summary
    setTimeout(() => {
      if (currentZoneIndex + 1 < questionnaireData.selectedZones.length) {
        setCurrentZoneIndex(prev => prev + 1)
        askZoneInterfaceCount(currentZoneIndex + 1)
      } else {
        // All zones configured, show summary with updated data
        setQuestionnaireData(prev => {
          showSummaryWithData(prev)
          return prev
        })
      }
    }, 1000)
  }


  const showSummaryWithData = (data: QuestionnaireData) => {
    console.log('showSummaryWithData called with data:', data)
    const totalSeparations = data.zoneConfigurations.reduce((sum, config) => sum + config.interfaceCount, 0)
    
    // Generate the API request JSON directly from zone configurations
    const apiRequest = {
      zones: data.zoneConfigurations.map(config => ({
        type: config.zoneName,
        compartments: config.separationNames
      }))
    }
    console.log('Generated API request:', apiRequest)
    
    const summaryMessage: Message = {
      role: "assistant",
      content: "Perfect! I have all the information needed. Here's your configuration summary:\n\n" +
               `• Destination: ${data.destination}\n` +
               `• Crew Size: ${data.crewSize}\n` +
               `• Mission Duration: ${data.missionDuration}\n` +
               `• Structure Type: ${data.structureType}\n` +
               `• Fairing Size: ${data.fairingSize}\n` +
               `• Priority: ${data.priority}\n` +
               `• Selected Zones: ${data.selectedZones.join(', ')}\n` +
               `• Zone Configurations: ${data.zoneConfigurations.map(z => `${z.zoneName} (${z.interfaceCount} separations)`).join(', ')}\n` +
               `• Total Separations: ${totalSeparations}\n` +
               `• Separations: ${data.zoneConfigurations.map(z => `${z.zoneName}: ${z.separationNames.join(', ')}`).join(' | ')}\n\n` +
               "Ready to finalize your space habitat design?",
      type: "options",
      options: [
        { label: "Finalize Design", value: "finalize", description: "Generate your space habitat floor plans" },
        { label: "Modify Configuration", value: "modify", description: "Go back and make changes" }
      ]
    }
    
    setMessages(prev => [...prev, summaryMessage])
  }

  const showSummary = () => {
    showSummaryWithData(questionnaireData)
  }


  const applyChanges = () => {
    if (drawings.length === 0) return
    
    // Set default prompt based on action type
    if (editActionType === 'REMOVE') {
      setEditPrompt('Remove the marked areas from the floor plan')
    } else if (editActionType === 'ADD') {
      setEditPrompt('Add new elements at the marked locations')
    } else if (editActionType === 'MODIFY') {
      setEditPrompt('Modify the elements at the marked locations')
    }
    
    // Show the edit modal to get action type and prompt
    setShowEditModal(true)
  }

  const retryEditRequest = async (editRequest: EditPlanRequest, file: File, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await editFloorPlan(editRequest, file)
        return result
      } catch (error: any) {
        console.error(`Edit attempt ${attempt} failed:`, error)
        
        // Check if it's a server error (500, 502, 503, 504) or network error
        const isRetryableError = error?.status >= 500 || error?.status === 0 || !error?.status
        
        if (attempt < maxRetries && isRetryableError) {
          setRetryAttempts(attempt)
          setIsRetrying(true)
          
          // Show retry message
          const retryMessage: Message = {
            role: "assistant",
            content: `🔄 Server error (${error?.status || 'network'}). Trying again... (Attempt ${attempt + 1}/${maxRetries})`,
            type: "text"
          }
          setMessages(prev => [...prev, retryMessage])
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        } else {
          throw error
        }
      }
    }
  }

  const handleEditSubmit = async () => {
    if (!editPrompt.trim()) {
      alert('Please enter a prompt describing the changes you want to make.')
      return
    }
    
    setShowEditModal(false)
    setIsEditing(true)
    setRetryAttempts(0)
    setIsRetrying(false)
    
    try {
      // Create a canvas to capture the image with drawings
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')
      
      // Load the original image
      const img = new (window as any).Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = generatedPlans[selectedPlanIndex].image_url
      })
      
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw the original image
      ctx.drawImage(img, 0, 0)
      
      // Draw the markings on top
      drawings.forEach(drawing => {
        ctx.strokeStyle = drawing.color
        ctx.lineWidth = 3
        ctx.beginPath()
        
        if (drawing.type === 'pen') {
          for (let i = 0; i < drawing.points.length; i += 2) {
            const x = drawing.points[i]
            const y = drawing.points[i + 1]
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
        } else if (drawing.type === 'circle') {
          ctx.arc(drawing.points[0], drawing.points[1], 20, 0, 2 * Math.PI)
        }
        
        ctx.stroke()
      })
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/png')
      })
      
      // Create file from blob
      const file = new File([blob], 'edited_floor_plan.png', { type: 'image/png' })
      
      // Send to edit API with retry logic
      const editRequest: EditPlanRequest = {
        image_url: generatedPlans[selectedPlanIndex].image_url,
        action_type: editActionType,
        prompt: editPrompt
      }
      
      const result = await retryEditRequest(editRequest, file)
      
      if (!result) {
        throw new Error('No result returned from edit API')
      }
      
      // Update the generated plans with the new edited image
      setGeneratedPlans(prev => prev.map((plan, index) => 
        index === selectedPlanIndex 
          ? { ...plan, image_url: result.result_image_url }
          : plan
      ))
      
      // Clear drawings
      setDrawings([])
      setCurrentPath([])
      setDrawingMode('none')
      
      // Show success message
      const successMessage: Message = {
        role: "assistant",
        content: `✅ Successfully applied changes to your floor plan! ${editActionType === 'ADD' ? 'Added' : editActionType === 'MODIFY' ? 'Modified' : 'Removed'} the marked areas.`,
        type: "text"
      }
      setMessages(prev => [...prev, successMessage])
      
    } catch (error: any) {
      console.error('Error applying changes:', error)
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Failed to apply changes after ${retryAttempts + 1} attempts. ${error?.status ? `Server error: ${error.status}` : 'Please check your connection and try again.'}`,
        type: "text"
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsEditing(false)
      setIsRetrying(false)
      setRetryAttempts(0)
    }
  }

  const retryCreateRequest = async (request: CreatePlanRequest, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await createFloorPlan(request)
        return result
      } catch (error: any) {
        console.error(`Create attempt ${attempt} failed:`, error)
        
        // Check if it's a server error (500, 502, 503, 504) or network error
        const isRetryableError = error?.status >= 500 || error?.status === 0 || !error?.status
        
        if (attempt < maxRetries && isRetryableError) {
          setRetryAttempts(attempt)
          setIsRetrying(true)
          
          // Show retry message
          const retryMessage: Message = {
            role: "assistant",
            content: `🔄 Server error (${error?.status || 'network'}). Trying again... (Attempt ${attempt + 1}/${maxRetries})`,
            type: "text"
          }
          setMessages(prev => [...prev, retryMessage])
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        } else {
          throw error
        }
      }
    }
  }

  const generateFloorPlans = async () => {
    setIsGenerating(true)
    setRetryAttempts(0)
    setIsRetrying(false)
    
    // Close chat and open visualization on mobile
    if (isMobile) {
      setShowMobileChat(false)
    }
    
    const generatingMessage: Message = {
      role: "assistant",
      content: "🚀 Finalizing your space habitat design... This may take a few moments.",
      type: "text"
    }
    setMessages(prev => [...prev, generatingMessage])
    
    try {
      // Convert zone configurations to API format
      const zones = questionnaireData.zoneConfigurations.map(config => ({
        type: config.zoneName,
        compartments: config.separationNames
      }))
      
      const request: CreatePlanRequest = {
        zones: zones
      }
      
      console.log('Sending API request:', request)
      const result = await retryCreateRequest(request)
      console.log('API response:', result)
      
      if (!result || !result.results) {
        throw new Error('No results returned from create API')
      }
      
      setGeneratedPlans(result.results)
      setSelectedPlanIndex(0) // Reset to first plan
      setZoomLevel(1) // Reset zoom
      setImagePosition({ x: 0, y: 0 }) // Reset position
      setDrawings([]) // Reset drawings
      setCurrentPath([]) // Reset current path
      setDrawingMode('none') // Reset drawing mode
      
      // Ensure visualization panel stays open on mobile after generation
      if (isMobile) {
        setShowMobileChat(false)
      }
      
      const successMessage: Message = {
        role: "assistant",
        content: `🎉 Perfect! Your space habitat design is ready! I've generated ${result.results.length} floor plan${result.results.length !== 1 ? 's' : ''}. Check the visualization panel to see your designs!`,
        type: "text"
      }
      setMessages(prev => [...prev, successMessage])
      
    } catch (error: any) {
      console.error('Error generating floor plans:', error)
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Failed to generate floor plans after ${retryAttempts + 1} attempts. ${error?.status ? `Server error: ${error.status}` : 'Please check your connection and try again.'}`,
        type: "text"
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
      setIsRetrying(false)
      setRetryAttempts(0)
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    
    // Don't add the user's typed message to chat
    // Instead, show the current question options if available
    const currentQ = questions[currentQuestion]
    if (!currentQ) {
      console.error('Current question is undefined in handleSendMessage. currentQuestion:', currentQuestion, 'questions.length:', questions.length)
      return
    }
    if (currentQ && currentQ.type === "options") {
      const assistantMessage: Message = {
        role: "assistant",
        content: currentQ.question,
        type: currentQ.type,
        options: currentQ.options
      }
      setMessages(prev => [...prev, assistantMessage])
    } else if (currentQ && currentQ.type === "zones") {
      const assistantMessage: Message = {
        role: "assistant",
        content: currentQ.question,
        type: currentQ.type,
        options: currentQ.options
      }
      setMessages(prev => [...prev, assistantMessage])
    } else {
      // If no current question, show a helpful message
      const assistantMessage: Message = {
        role: "assistant",
        content: "Please select from the available options above to continue with your space habitat design.",
        type: "text"
      }
      setMessages(prev => [...prev, assistantMessage])
    }
    
    setInput("")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header Bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left side - Logo only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Voronova" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10" />
            </Link>
          </div>

          {/* Right side - Menu Button */}
          <div className="flex items-center gap-2">
            {/* Mobile Chat Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-primary/10 lg:hidden"
                onClick={() => setShowMobileChat(!showMobileChat)}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            )}
            
            {/* Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-primary/10"
              onClick={toggleMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Right Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-lg" onClick={toggleMenu} />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-primary/95 to-primary/90 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-primary-foreground/20">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="Voronova" width={32} height={32} className="h-8 w-8" />
                  <span className="text-lg font-bold text-primary-foreground">VORONOVA</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={toggleMenu}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 flex flex-col justify-center px-6 space-y-8">
                <Link
                  href="/"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <a
                  href="#features"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  How It Works
                </a>
                <Link
                  href="/app"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Prompt Now
                </Link>
                <Link
                  href="/results"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Results
                </Link>
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-primary-foreground/20">
                <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg py-6">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - AI Assistant */}
        <div className={`w-full lg:w-80 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col transition-transform duration-300 ${
          isMobile && !showMobileChat ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="p-3 border-b border-border/50 bg-card/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Assistant
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Chat with your habitat design helper</p>
              </div>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-primary/10 lg:hidden"
                  onClick={() => setShowMobileChat(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 min-h-0 relative" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-3">
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-primary to-orange-500 text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}>
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
                
                {/* Render options if available */}
                {msg.type === "options" && msg.options && (
                  <div className="space-y-2">
                    {msg.options.map((option, optIdx) => (
                      <Button
                        key={optIdx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleOptionSelect(option.value)}
                        className="w-full justify-start text-left h-auto p-3"
                        disabled={isGenerating || isProcessingSelection}
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                          )}
                          {isProcessingSelection && (
                            <div className="text-xs text-primary mt-1 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing...
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Render zone selection */}
                {msg.type === "zones" && msg.options && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Select up to 6 zones for your space habitat ({questionnaireData.selectedZones.length}/6 selected)
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.options.map((option, optIdx) => {
                        const zoneType = zoneTypes.find(z => z.id === option.value)
                        const isSelected = questionnaireData.selectedZones.includes(zoneType?.name || "")
                        const isDisabled = !isSelected && questionnaireData.selectedZones.length >= 6
                        
                        return (
                          <Card
                            key={optIdx}
                            className={`p-3 transition-all ${
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : isDisabled
                                  ? "border-border/30 bg-muted/30 cursor-not-allowed opacity-50"
                                  : "border-border hover:border-primary/50 cursor-pointer"
                            }`}
                            onClick={() => !isDisabled && handleOptionSelect(option.value)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-xl">{zoneType?.icon}</div>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-muted-foreground">{option.description}</div>
                              </div>
                              {isSelected && (
                                <div className="ml-auto">
                                  <Check className="h-4 w-4 text-primary" />
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                    
                    {questionnaireData.selectedZones.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-3 text-sm">Selected Zones:</h4>
                        <div className="flex flex-wrap gap-2">
                          {questionnaireData.selectedZones.map((zone, index) => (
                            <div key={index} className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium">{zone}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setQuestionnaireData(prev => ({
                                    ...prev,
                                    selectedZones: prev.selectedZones.filter((_, i) => i !== index)
                                  }))
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {questionnaireData.selectedZones.length > 0 && (
                      <Button
                        onClick={() => {
                          startZoneConfiguration()
                        }}
                        className="w-full mt-4"
                        disabled={questionnaireData.selectedZones.length === 0}
                      >
                        Continue to Zone Configuration
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Render separation names input */}
                {msg.type === "separation_names" && (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Please enter the names for {msg.count} separation{msg.count !== 1 ? 's' : ''} in the {msg.zoneName} zone:
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: msg.count || 0 }, (_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-20">Separation {index + 1}:</span>
                          <Input
                            placeholder={`Enter separation ${index + 1} name`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll('input')
                                if (inputs) {
                                  const names = Array.from(inputs).map(input => (input as HTMLInputElement).value.trim()).filter(name => name)
                                  console.log('Enter key pressed, separation names:', names, 'Expected count:', msg.count)
                                  if (names.length === msg.count) {
                                    handleSeparationNames(names)
                                  } else {
                                    alert(`Please enter all ${msg.count} separation names. You entered ${names.length} names.`)
                                  }
                                }
                              }
                            }}
                            className="flex-1 text-sm h-8"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={(e) => {
                        const inputs = e.currentTarget.parentElement?.querySelectorAll('input')
                        if (inputs) {
                          const names = Array.from(inputs).map(input => (input as HTMLInputElement).value.trim()).filter(name => name)
                          console.log('Separation names entered:', names, 'Expected count:', msg.count)
                          if (names.length === msg.count) {
                            handleSeparationNames(names)
                          } else {
                            alert(`Please enter all ${msg.count} separation names. You entered ${names.length} names.`)
                          }
                        }
                      }}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                )}
                
                
              </div>
            ))}
            
            {/* Scroll to bottom button */}
            {showScrollButton && isClient && (
              <div className="absolute bottom-20 right-4 z-20">
                <Button
                  onClick={() => {
                    console.log('Manual scroll button clicked')
                    if (chatContainerRef.current) {
                      const container = chatContainerRef.current
                      console.log('Container info:', {
                        scrollHeight: container.scrollHeight,
                        clientHeight: container.clientHeight,
                        scrollTop: container.scrollTop,
                        isScrollable: container.scrollHeight > container.clientHeight
                      })
                      
                      // Force scroll to absolute bottom
                      container.scrollTop = container.scrollHeight
                      console.log('After scroll, scrollTop:', container.scrollTop)
                      
                      // Also try scrollTo
                      container.scrollTo(0, container.scrollHeight)
                      console.log('After scrollTo, scrollTop:', container.scrollTop)
                    }
                    forceScrollToBottom()
                  }}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg border-2 border-white"
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Scroll to Bottom
                </Button>
              </div>
            )}
            
          </div>

          <div className="p-3 border-t border-border/50 bg-card/50 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type and press Enter to see current options..."
                className="flex-1 bg-background/50 text-sm"
                disabled={isGenerating}
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                disabled={isGenerating}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Visualization */}
        <div className={`flex-1 flex flex-col min-h-0 pb-12 ${
          isMobile && showMobileChat ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Visualization Header */}
          <div className="p-3 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Box className="h-4 w-4 text-primary" />
              Interactive Habitat Visualization
            </h2>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-primary/10 lg:hidden"
                onClick={() => setShowMobileChat(true)}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border/50 bg-transparent">
                <Layers className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">2D View</span>
                <span className="sm:hidden">2D</span>
              </Button>
              <Button variant="outline" size="sm" className="border-border/50 bg-transparent">
                <Maximize2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">3D View</span>
                <span className="sm:hidden">3D</span>
              </Button>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="flex-1 flex items-center justify-center p-3 bg-gradient-to-br from-background to-primary/5 relative overflow-hidden min-h-0">
            {/* Background stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[
                { left: "8.36%", top: "6.01%", delay: "0.67s", duration: "2.84s" },
                { left: "91.10%", top: "76.75%", delay: "0.48s", duration: "3.23s" },
                { left: "0.59%", top: "4.50%", delay: "2.26s", duration: "2.34s" },
                { left: "68.43%", top: "56.52%", delay: "2.70s", duration: "3.09s" },
                { left: "13.09%", top: "6.24%", delay: "1.50s", duration: "2.48s" },
                { left: "14.64%", top: "38.20%", delay: "0.70s", duration: "3.30s" },
                { left: "98.40%", top: "87.49%", delay: "0.30s", duration: "3.47s" },
                { left: "26.52%", top: "20.92%", delay: "2.80s", duration: "3.08s" },
                { left: "24.71%", top: "22.36%", delay: "1.93s", duration: "3.38s" },
                { left: "43.64%", top: "29.40%", delay: "0.77s", duration: "3.27s" },
                { left: "96.49%", top: "1.73%", delay: "1.01s", duration: "3.61s" },
                { left: "49.50%", top: "1.45%", delay: "0.03s", duration: "3.24s" },
                { left: "38.52%", top: "21.81%", delay: "2.19s", duration: "3.60s" },
                { left: "3.14%", top: "66.76%", delay: "2.70s", duration: "2.56s" },
                { left: "18.89%", top: "35.57%", delay: "2.82s", duration: "3.28s" },
                { left: "37.07%", top: "57.34%", delay: "0.27s", duration: "3.40s" },
                { left: "30.01%", top: "64.78%", delay: "0.73s", duration: "2.68s" },
                { left: "31.27%", top: "71.72%", delay: "1.90s", duration: "2.70s" },
                { left: "91.49%", top: "58.29%", delay: "0.53s", duration: "3.18s" },
                { left: "89.74%", top: "70.88%", delay: "2.48s", duration: "2.85s" }
              ].map((star, i) => (
                <div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-primary/20 animate-pulse"
                  style={{
                    left: star.left,
                    top: star.top,
                    animationDelay: star.delay,
                    animationDuration: star.duration,
                  }}
                />
              ))}
            </div>

            {/* Main visualization */}
            {generatedPlans.length > 0 ? (
              <div className="w-full h-full p-6 z-10">
                <div className="h-full flex flex-col">
                  {/* Header with zone info and controls */}
                  <div className={`mb-4 ${isMobile ? 'flex flex-col gap-3' : 'flex items-center justify-between'}`}>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {generatedPlans[selectedPlanIndex]?.zone_type} Zone
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {generatedPlans[selectedPlanIndex]?.compartments.length} compartment{generatedPlans[selectedPlanIndex]?.compartments.length !== 1 ? 's' : ''}: {generatedPlans[selectedPlanIndex]?.compartments.join(', ')}
                      </p>
                </div>
                    <div className={`flex items-center gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
                      {generatedPlans.length > 1 && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPlanIndex(Math.max(0, selectedPlanIndex - 1))
                              setZoomLevel(1)
                              setImagePosition({ x: 0, y: 0 })
                              setDrawings([])
                              setCurrentPath([])
                              setDrawingMode('none')
                            }}
                            disabled={selectedPlanIndex === 0}
                          >
                            ←
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            {selectedPlanIndex + 1} of {generatedPlans.length}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPlanIndex(Math.min(generatedPlans.length - 1, selectedPlanIndex + 1))
                              setZoomLevel(1)
                              setImagePosition({ x: 0, y: 0 })
                              setDrawings([])
                              setCurrentPath([])
                              setDrawingMode('none')
                            }}
                            disabled={selectedPlanIndex === generatedPlans.length - 1}
                          >
                            →
                          </Button>
              </div>
                      )}
                      
                      {/* Drawing Controls */}
                      <div className="flex items-center gap-1 border border-border/50 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant={drawingMode === 'pen' ? 'default' : 'ghost'}
                          onClick={() => setDrawingMode(drawingMode === 'pen' ? 'none' : 'pen')}
                          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-sm">✏️</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={drawingMode === 'circle' ? 'default' : 'ghost'}
                          onClick={() => setDrawingMode(drawingMode === 'circle' ? 'none' : 'circle')}
                          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-sm">⭕</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDrawings([])
                            setCurrentPath([])
                            setDrawingMode('none')
                          }}
                          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-sm">🗑️</span>
                        </Button>
                </div>

                      {/* Zoom Controls */}
                      <div className="flex items-center gap-1 border border-border/50 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                          disabled={zoomLevel <= 0.5}
                          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-lg">−</span>
                        </Button>
                        <span className="text-sm text-muted-foreground px-2 min-w-[3rem] text-center">
                          {Math.round(zoomLevel * 100)}%
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                          disabled={zoomLevel >= 3}
                          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-lg">+</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setZoomLevel(1)
                            setImagePosition({ x: 0, y: 0 })
                          }}
                          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-xs">⌂</span>
                        </Button>
                      </div>
                      
                      {drawings.length > 0 && !isMobile && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          onClick={applyChanges}
                          disabled={isEditing}
                        >
                          {isEditing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">✓</span>
                              Apply Changes
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = generatedPlans[selectedPlanIndex]?.image_url
                          link.download = `${generatedPlans[selectedPlanIndex]?.zone_type}_floor_plan.jpg`
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                </div>
                  </div>
                  
                  {/* Mobile-specific Apply Changes button */}
                  {isMobile && drawings.length > 0 && (
                    <div className="mb-2 flex justify-center">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-10 px-4 text-sm font-medium shadow-md"
                        onClick={applyChanges}
                        disabled={isEditing}
                      >
                        {isEditing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">✓</span>
                            Apply Changes
                          </>
                        )}
                      </Button>
                </div>
              )}
                  
                  {/* Full-size floor plan display */}
                  <div 
                    className="flex-1 bg-white rounded-lg border border-border/50 p-4 flex items-center justify-center overflow-hidden relative"
                    onMouseDown={(e) => {
                      if (drawingMode === 'none' && zoomLevel > 1) {
                        setIsDragging(true)
                        setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
                      }
                    }}
                    onMouseMove={(e) => {
                      if (isDragging && zoomLevel > 1) {
                        setImagePosition({
                          x: e.clientX - dragStart.x,
                          y: e.clientY - dragStart.y
                        })
                      }
                    }}
                    onMouseUp={() => {
                      setIsDragging(false)
                    }}
                    onMouseLeave={() => {
                      setIsDragging(false)
                    }}
                    onTouchStart={(e) => {
                      if (drawingMode === 'none' && zoomLevel > 1 && e.touches.length === 1) {
                        const touch = e.touches[0]
                        setIsDragging(true)
                        setDragStart({ x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y })
                      }
                    }}
                    onTouchMove={(e) => {
                      if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
                        const touch = e.touches[0]
                        setImagePosition({
                          x: touch.clientX - dragStart.x,
                          y: touch.clientY - dragStart.y
                        })
                      }
                    }}
                    onTouchEnd={() => {
                      setIsDragging(false)
                    }}
                    style={{ 
                      cursor: drawingMode !== 'none' ? 'crosshair' : 
                             isDragging ? 'grabbing' : 
                             zoomLevel > 1 ? 'grab' : 'default' 
                    }}
                  >
                    {generatedPlans[selectedPlanIndex]?.image_url ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative">
                          <img 
                            ref={(img) => {
                              if (img && canvasRef) {
                                // Simple approach: match canvas to image exactly
                                const updateCanvas = () => {
                                  const canvas = canvasRef
                                  const imgRect = img.getBoundingClientRect()
                                  
                                  // Set canvas to match image size and position exactly
                                  canvas.width = imgRect.width
                                  canvas.height = imgRect.height
                                  canvas.style.width = imgRect.width + 'px'
                                  canvas.style.height = imgRect.height + 'px'
                                  canvas.style.left = '0px'
                                  canvas.style.top = '0px'
                                }
                                
                                updateCanvas()
                                
                                // Update on image load and resize
                                img.onload = updateCanvas
                                window.addEventListener('resize', updateCanvas)
                                
                                return () => {
                                  window.removeEventListener('resize', updateCanvas)
                                }
                              }
                            }}
                            src={generatedPlans[selectedPlanIndex].image_url} 
                            alt={`${generatedPlans[selectedPlanIndex].zone_type} floor plan`}
                            className="transition-transform duration-200 ease-out select-none max-w-full max-h-full object-contain"
                            style={{
                              transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`
                            }}
                            draggable={false}
                          />
                          
                          {/* Canvas overlay - positioned exactly on top of image */}
                          <canvas
                            ref={setCanvasRef}
                            className="absolute top-0 left-0"
                            style={{
                              pointerEvents: drawingMode !== 'none' ? 'auto' : 'none',
                              cursor: drawingMode !== 'none' ? 'crosshair' : 'default',
                              transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                              transformOrigin: 'center'
                            }}
                            onMouseDown={(e) => {
                              if (drawingMode !== 'none') {
                                const canvas = e.currentTarget
                                const rect = canvas.getBoundingClientRect()
                                
                                // Simple coordinate calculation
                                const x = e.clientX - rect.left
                                const y = e.clientY - rect.top
                                
                                console.log('Canvas mouse down:', { x, y, drawingMode, rect })
                                
                                if (drawingMode === 'pen') {
                                  setIsDrawing(true)
                                  setCurrentPath([x, y])
                                } else if (drawingMode === 'circle') {
                                  setCurrentPath([x, y])
                                }
                                e.preventDefault()
                              }
                            }}
                            onTouchStart={(e) => {
                              if (drawingMode !== 'none') {
                                const canvas = e.currentTarget
                                const rect = canvas.getBoundingClientRect()
                                const touch = e.touches[0]
                                
                                // Touch coordinate calculation
                                const x = touch.clientX - rect.left
                                const y = touch.clientY - rect.top
                                
                                console.log('Canvas touch start:', { x, y, drawingMode, rect })
                                
                                if (drawingMode === 'pen') {
                                  setIsDrawing(true)
                                  setCurrentPath([x, y])
                                } else if (drawingMode === 'circle') {
                                  setCurrentPath([x, y])
                                }
                                e.preventDefault()
                              }
                            }}
                            onMouseMove={(e) => {
                              if (isDrawing && drawingMode === 'pen') {
                                const canvas = e.currentTarget
                                const rect = canvas.getBoundingClientRect()
                                const x = e.clientX - rect.left
                                const y = e.clientY - rect.top
                                setCurrentPath(prev => [...prev, x, y])
                                console.log('Canvas mouse move:', { x, y })
                                e.preventDefault()
                              }
                            }}
                            onTouchMove={(e) => {
                              if (isDrawing && drawingMode === 'pen') {
                                const canvas = e.currentTarget
                                const rect = canvas.getBoundingClientRect()
                                const touch = e.touches[0]
                                const x = touch.clientX - rect.left
                                const y = touch.clientY - rect.top
                                setCurrentPath(prev => [...prev, x, y])
                                console.log('Canvas touch move:', { x, y })
                                e.preventDefault()
                              }
                            }}
                            onMouseUp={(e) => {
                              if (drawingMode !== 'none' && currentPath.length > 0) {
                                setDrawings(prev => [...prev, {
                                  type: drawingMode,
                                  points: [...currentPath],
                                  color: '#ff0000'
                                }])
                                setCurrentPath([])
                                e.preventDefault()
                              }
                              setIsDrawing(false)
                            }}
                            onTouchEnd={(e) => {
                              if (drawingMode !== 'none' && currentPath.length > 0) {
                                setDrawings(prev => [...prev, {
                                  type: drawingMode,
                                  points: [...currentPath],
                                  color: '#ff0000'
                                }])
                                setCurrentPath([])
                                e.preventDefault()
                              }
                              setIsDrawing(false)
                            }}
                            onMouseLeave={() => {
                              setIsDrawing(false)
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Layers className="h-12 w-12 mx-auto mb-2" />
                        <p>No floor plan image available</p>
                </div>
              )}
                    
                    {/* Status indicators */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {zoomLevel > 1 && (
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {Math.round(zoomLevel * 100)}% - Drag to pan
            </div>
              )}
                      {drawingMode !== 'none' && (
                        <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {drawingMode === 'pen' ? 'Drawing Mode' : 'Circle Mode'}
                </div>
              )}
            </div>
          </div>

                </div>
              </div>
            ) : isGenerating ? (
            <div className="relative w-full max-w-lg aspect-square">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin-slow" />
              <div className="absolute inset-6 rounded-full border-2 border-orange-500/20 animate-spin-reverse" />
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-primary/10 to-orange-500/10 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-2">
                    <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                    <p className="text-xs text-muted-foreground">🚀 Finalizing your space habitat design...</p>
                    <p className="text-xs text-muted-foreground">This may take a few moments</p>
                </div>
              </div>
                </div>
            ) : (
              <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin-slow" />
                <div className="absolute inset-6 rounded-full border-2 border-orange-500/20 animate-spin-reverse" />
                <div className="absolute inset-12 rounded-full bg-gradient-to-br from-primary/10 to-orange-500/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Box className="h-12 w-12 text-primary mx-auto animate-pulse" />
                    <p className="text-xs text-muted-foreground">Your space habitat design will appear here</p>
                    <p className="text-xs text-muted-foreground">Complete the questionnaire to generate floor plans</p>
                </div>
                </div>
                </div>
              )}
          </div>

          {/* Bottom Controls - Collapsible */}
          <div className={`fixed bottom-0 left-0 right-0 bg-card/30 backdrop-blur-sm border-t border-border/50 transition-all duration-300 ${
            isTabsExpanded ? 'h-auto max-h-[50vh]' : 'h-12'
          }`}>
            <div className="p-3">
            <Tabs defaultValue="controls" className="w-full">
                <div className="flex items-center justify-between mb-3">
                  <TabsList className="grid grid-cols-2 lg:grid-cols-3 flex-1">
                <TabsTrigger value="controls" className="text-xs">Design Controls</TabsTrigger>
                <TabsTrigger value="resources" className="text-xs">Resources</TabsTrigger>
                <TabsTrigger value="export" className="text-xs hidden lg:block">Export</TabsTrigger>
              </TabsList>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTabsExpanded(!isTabsExpanded)}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <span className={`text-xs transition-transform duration-200 ${isTabsExpanded ? 'rotate-180' : ''}`}>
                      ⌄
                    </span>
                  </Button>
                </div>

              {isTabsExpanded && (
                <>
              <TabsContent value="controls" className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-2">Configuration Status</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination:</span>
                        <span className={questionnaireData.destination ? "text-green-600" : "text-muted-foreground"}>
                          {questionnaireData.destination || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Crew Size:</span>
                        <span className={questionnaireData.crewSize ? "text-green-600" : "text-muted-foreground"}>
                          {questionnaireData.crewSize || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selected Zones:</span>
                        <span className={questionnaireData.selectedZones.length > 0 ? "text-green-600" : "text-muted-foreground"}>
                          {questionnaireData.selectedZones.length} selected
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zone Configurations:</span>
                        <span className={questionnaireData.zoneConfigurations.length > 0 ? "text-green-600" : "text-muted-foreground"}>
                          {questionnaireData.zoneConfigurations.length} configured
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Separations:</span>
                        <span className={questionnaireData.zoneConfigurations.length > 0 ? "text-green-600" : "text-muted-foreground"}>
                          {questionnaireData.zoneConfigurations.reduce((sum, config) => sum + config.interfaceCount, 0)} defined
                        </span>
                      </div>
                      {questionnaireData.zoneConfigurations.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {questionnaireData.zoneConfigurations.map(z => `${z.zoneName}: ${z.separationNames.join(', ')}`).join(' | ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCurrentQuestion(0)
                          setCurrentZoneIndex(0)
                          setCurrentSeparationIndex(0)
                          setIsInZoneConfiguration(false)
                          setMessages([{
                            role: "assistant",
                            content: "Let's start over! What is your mission destination?",
                            type: "options",
                            options: questions[0].options
                          }])
                          setQuestionnaireData({
                            destination: "",
                            crewSize: "",
                            missionDuration: "",
                            structureType: "",
                            fairingSize: "",
                            priority: "",
                            selectedZones: [],
                            zoneConfigurations: []
                          })
                        }}
                        className="w-full text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restart Questionnaire
                      </Button>
                      {generatedPlans.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = '/results'}
                          className="w-full text-xs"
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Analyze Results
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border/50 bg-card/30 p-2 hover:bg-card/50 transition-colors cursor-pointer">
                    <h4 className="text-xs font-medium text-foreground mb-1">Space Station Guide</h4>
                    <p className="text-xs text-muted-foreground">Reference materials</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-card/30 p-2 hover:bg-card/50 transition-colors cursor-pointer">
                    <h4 className="text-xs font-medium text-foreground mb-1">Mars Blueprints</h4>
                    <p className="text-xs text-muted-foreground">Design templates</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-card/30 p-2 hover:bg-card/50 transition-colors cursor-pointer">
                    <h4 className="text-xs font-medium text-foreground mb-1">Standards</h4>
                    <p className="text-xs text-muted-foreground">Industry specs</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                    disabled={generatedPlans.length === 0}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-primary/50 bg-transparent hover:bg-primary/10"
                    disabled={generatedPlans.length === 0}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-primary/50 bg-transparent hover:bg-primary/10"
                    disabled={generatedPlans.length === 0}
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>

      {/* Full Size Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg max-w-6xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {selectedPlan.zone_type} Zone - Full Size View
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan.compartments.length} compartment{selectedPlan.compartments.length !== 1 ? 's' : ''}: {selectedPlan.compartments.join(', ')}
                </p>
    </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedPlan.image_url
                    link.download = `${selectedPlan.zone_type}_floor_plan.jpg`
                    link.click()
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <div className="bg-white rounded-lg border border-border/50 p-4 flex justify-center">
                <img 
                  src={selectedPlan.image_url} 
                  alt={`${selectedPlan.zone_type} floor plan - full size`}
                  className="max-w-full h-auto"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4">Edit Floor Plan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Action Type</label>
                <select
                  value={editActionType}
                  onChange={(e) => {
                    const newActionType = e.target.value as 'ADD' | 'MODIFY' | 'REMOVE'
                    setEditActionType(newActionType)
                    
                    // Update prompt based on action type
                    if (newActionType === 'REMOVE') {
                      setEditPrompt('Remove the marked areas from the floor plan')
                    } else if (newActionType === 'ADD') {
                      setEditPrompt('Add new elements at the marked locations')
                    } else if (newActionType === 'MODIFY') {
                      setEditPrompt('Modify the elements at the marked locations')
                    }
                  }}
                  className="w-full p-2 border border-border bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="ADD">Add</option>
                  <option value="MODIFY">Modify</option>
                  <option value="REMOVE">Remove</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Prompt</label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Describe the changes you want to make to the floor plan..."
                  className="w-full p-2 border border-border bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}