"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Camera, MapPin, MessageCircle, Shield, Zap, ArrowRight, Sparkles } from "lucide-react"
import { LoadingSpinner } from "@/components/loading"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard")
    }
  }, [isSignedIn, isLoaded, router])

  const handleSignIn = () => {
    router.push("/sign-in")
  }

  const handleSignUp = () => {
    router.push("/sign-up")
  }

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return <LoadingSpinner />
  }

  // If user is signed in, show loading while redirecting
  if (isSignedIn) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <Heart className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                MediCare AI
              </span>
              <div className="text-xs text-gray-500">Your Health Assistant</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleSignIn}
              className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 hover:scale-105"
            >
              Sign In
            </Button>
            <Button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 hover:bg-blue-100 transition-colors duration-300">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Medical Assistant
            </div>
            <h1 className="text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Your Smart
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient">
                {" "}
                Medical{" "}
              </span>
              Companion
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Identify medicines instantly, get detailed information, find nearby pharmacies, and chat with our AI
              assistant - all powered by advanced artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleSignUp}
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 group"
              >
                Start Your Health Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSignIn}
                className="text-lg px-8 py-4 border-2 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-transparent"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Powerful Medical Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for smart healthcare management in one place
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center p-8">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  Medicine Recognition
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Take a photo or upload an image to identify medicines instantly with 99% accuracy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:-rotate-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center p-8">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-green-600 transition-colors duration-300">
                  Detailed Information
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get comprehensive details about medicines, ingredients, dosage, and side effects
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center p-8">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-red-600 transition-colors duration-300">
                  Find Nearby Stores
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Locate pharmacies and hospitals near your location with real-time availability
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:-rotate-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center p-8">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-purple-600 transition-colors duration-300">
                  AI Chat Assistant
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get instant answers to your medical questions from our advanced AI assistant
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center p-8">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-yellow-600 transition-colors duration-300">
                  Fast & Accurate
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Powered by advanced AI for lightning-fast and highly reliable results
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:-rotate-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center p-8">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3 group-hover:text-pink-600 transition-colors duration-300">
                  User Reviews
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Read and share experiences about medicines with our trusted community
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Healthcare?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who trust MediCare AI for their medical needs
          </p>
          <Button
            size="lg"
            onClick={handleSignUp}
            className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 group">
            <Heart className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-bold">MediCare AI</span>
          </div>
          <p className="text-gray-400 mb-4">
            Your trusted AI-powered medical assistant. Always consult healthcare professionals for medical advice.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
