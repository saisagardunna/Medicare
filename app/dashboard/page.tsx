"use client"

import type React from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, Heart, User, MapPin, MessageCircle, LogOut, Pill, Building2, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/")
    }
  }, [isSignedIn, router])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        console.log("Cleaning up camera stream")
        cameraStream.getTracks().forEach((track) => track.stop())
        setCameraStream(null)
      }
    }
  }, [cameraStream])

  const checkCameraPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" } as any)
      console.log("Camera permission state:", permissionStatus.state)
      return permissionStatus.state === "granted" || permissionStatus.state === "prompt"
    } catch (error) {
      console.error("Error checking camera permission:", error)
      return false
    }
  }

  const startCamera = useCallback(async () => {
    // Prompt user to allow camera access
    const allowCamera = window.confirm(
      "MediCare AI needs camera access to take a photo of the medicine. Please ensure your camera is enabled and click 'Allow' in the browser prompt. Continue?"
    )
    if (!allowCamera) {
      setCameraError("Camera access was not allowed. Please try again and allow permissions.")
      setShowCamera(true) // Keep modal open for retry
      console.log("User cancelled camera permission prompt")
      return
    }

    try {
      setCameraError(null)
      setShowCamera(true)
      console.log("Attempting to start camera with default settings")

      // Check if media devices are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported by this browser or device.")
        console.error("MediaDevices not supported")
        return
      }

      // Check permission state
      const hasPermission = await checkCameraPermission()
      if (!hasPermission) {
        setCameraError(
          "Camera permission is denied or unavailable. Please enable camera access in your browser settings and try again.\n\n" +
          "For Chrome: Click the lock icon in the address bar > Permissions > Set Camera to 'Allow'.\n" +
          "For Safari: Go to Settings > Websites > Camera > Allow for this site.\n" +
          "For mobile: Check device settings to allow camera access for this browser."
        )
        console.error("Camera permission not granted")
        return
      }

      // Use default camera (no facingMode) for maximum compatibility
      const constraints = { video: true }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Camera stream obtained:", stream.id)
      setCameraStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for video element to be ready
        await new Promise((resolve) => setTimeout(resolve, 500)) // Increased delay
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, dimensions:", videoRef.current?.videoWidth, videoRef.current?.videoHeight)
          videoRef.current?.play().catch((err) => {
            console.error("Error playing video:", err)
            setCameraError(
              "Failed to display camera feed. Please ensure camera permissions are granted and try again."
            )
          })
        }
      } else {
        console.error("Video ref not available")
        setCameraError("Camera feed could not be initialized. Please try again.")
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      let errorMessage = "Unable to access camera. Please check permissions and ensure your device has a camera.\n\n" +
        "For Chrome: Click the lock icon in the address bar > Permissions > Set Camera to 'Allow'.\n" +
        "For Safari: Go to Settings > Websites > Camera > Allow for this site.\n" +
        "For mobile: Check device settings to allow camera access for this browser."
      if (error.name === "NotAllowedError") {
        errorMessage = "Camera access denied. Please allow camera permissions in your browser settings and try again.\n\n" +
          "For Chrome: Click the lock icon in the address bar > Permissions > Set Camera to 'Allow'.\n" +
          "For Safari: Go to Settings > Websites > Camera > Allow for this site.\n" +
          "For mobile: Check device settings to allow camera access for this browser."
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found. Please ensure your device has a working camera."
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Camera settings not supported. Default camera should have worked, but please check your device."
      }
      setCameraError(errorMessage)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      console.log("Stopping camera stream")
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    setCameraError(null)
  }, [cameraStream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (context && video.videoWidth && video.videoHeight) {
        console.log("Capturing photo with dimensions:", video.videoWidth, video.videoHeight)
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        console.log("Photo captured, storing in localStorage")
        localStorage.setItem("capturedImage", imageData)
        stopCamera()
        router.push("/analysis")
      } else {
        console.error("Cannot capture photo: Invalid video dimensions or context")
        setCameraError("Failed to capture photo. Camera feed not ready or dimensions unavailable. Please try again.")
      }
    } else {
      console.error("Cannot capture photo: Video or canvas ref not available")
      setCameraError("Camera not initialized. Please try again.")
    }
  }, [router, stopCamera])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("Uploading file:", file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        console.log("File uploaded, storing in localStorage")
        localStorage.setItem("capturedImage", imageData)
        router.push("/analysis")
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full pulse-ring"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">MediCare AI</h1>
              <p className="text-sm text-gray-500">Your Medical Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Hello, {user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "User"}!
              </span>
            </div>
            <SignOutButton>
              <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600 bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </header>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Capture Medicine Photo</h3>
            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg p-4">
                  <p className="text-red-500 text-center mb-4">{cameraError}</p>
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    className="px-4 py-2 rounded-full bg-transparent hover:bg-blue-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Camera
                  </Button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none"></div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={capturePhoto}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full hover:scale-105 transition-all duration-300"
                disabled={!!cameraError}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button
                onClick={stopCamera}
                variant="destructive"
                className="px-6 py-2 rounded-full hover:scale-105 transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Your <span className="text-blue-600">Medical Dashboard</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take a photo or upload an image of your medicine to get instant detailed information, find nearby
            pharmacies, or chat with our AI assistant.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card
            className="group hover:shadow-2xl transition-all duration-700 hover:-translate-y-6 hover:rotate-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer overflow-hidden relative transform-gpu"
            onClick={startCamera}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 group-hover:from-white/5 transition-all duration-500"></div>
            <CardHeader className="text-center relative z-10 p-8">
              <div className="mx-auto mb-6 p-6 bg-white/20 rounded-full w-fit group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
                <Camera className="h-12 w-12 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-3xl mb-3 group-hover:scale-105 transition-transform duration-300">
                Take Photo
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                Use your camera to capture a medicine photo for instant AI-powered analysis
              </CardDescription>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center justify-center text-sm">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  Click to activate camera
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="group hover:shadow-2xl transition-all duration-700 hover:-translate-y-6 hover:-rotate-2 bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer overflow-hidden relative transform-gpu"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 group-hover:from-white/5 transition-all duration-500"></div>
            <CardHeader className="text-center relative z-10 p-8">
              <div className="mx-auto mb-6 p-6 bg-white/20 rounded-full w-fit group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 shadow-2xl">
                <Upload className="h-12 w-12 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-3xl mb-3 group-hover:scale-105 transition-transform duration-300">
                Upload Image
              </CardTitle>
              <CardDescription className="text-green-100 text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                Select an existing image from your device gallery for analysis
              </CardDescription>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center justify-center text-sm">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  Click to browse files
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {/* Quick Access Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/maps" className="group">
            <Card className="hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1 cursor-pointer bg-white/90 backdrop-blur-sm border-2 border-transparent hover:border-red-200 transform-gpu">
              <CardHeader className="text-center p-6">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <MapPin className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg group-hover:text-red-600 transition-colors duration-300 group-hover:scale-105 transform">
                  Find Nearby
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Locate pharmacies and hospitals around you
                </CardDescription>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="text-xs text-red-500 font-medium">→ Explore locations</div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/chatbot" className="group">
            <Card className="hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:-rotate-1 cursor-pointer bg-white/90 backdrop-blur-sm border-2 border-transparent hover:border-purple-200 transform-gpu">
              <CardHeader className="text-center p-6">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg group-hover:text-purple-600 transition-colors duration-300 group-hover:scale-105 transform">
                  AI Assistant
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Chat with our medical AI for instant help
                </CardDescription>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="text-xs text-purple-500 font-medium">→ Start chatting</div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/contact" className="group">
            <Card className="hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1 cursor-pointer bg-white/90 backdrop-blur-sm border-2 border-transparent hover:border-pink-200 transform-gpu">
              <CardHeader className="text-center p-6">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Heart className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg group-hover:text-pink-600 transition-colors duration-300 group-hover:scale-105 transform">
                  Contact Support
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Get help and support from our team
                </CardDescription>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="text-xs text-pink-500 font-medium">→ Get support</div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 text-center">
              <Pill className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-blue-100">Medicines Identified</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-green-100">Partner Pharmacies</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-purple-100">AI Support</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">99%</div>
              <div className="text-sm text-red-100">User Satisfaction</div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-dashed border-2 border-gray-300 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How to Get Started</h3>
            <p className="text-gray-600 mb-4">
              Simply take a photo or upload an image of any medicine to get detailed information including ingredients,
              dosage, side effects, and more!
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center group hover:text-blue-600 transition-colors duration-300">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2 group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                Capture/Upload
              </div>
              <div className="flex items-center group hover:text-green-600 transition-colors duration-300">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-2 group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                AI Analysis
              </div>
              <div className="flex items-center group hover:text-purple-600 transition-colors duration-300">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-2 group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                Get Results
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}