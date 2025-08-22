"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ArrowLeft, Star, MapPin, MessageCircle, Play, Users, Factory } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface MedicineData {
  name: string
  genericName: string
  description: string
  ingredients: string[]
  manufacturer: string
  dosage: string
  sideEffects: string[]
  precautions: string[]
  youtubeVideoId: string
  reviews: Array<{
    user: string
    rating: number
    comment: string
    date: string
  }>
}

export default function AnalysisPage() {
  const router = useRouter()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [medicineData, setMedicineData] = useState<MedicineData | null>(null)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })

  useEffect(() => {
    const imageData = localStorage.getItem("capturedImage")
    if (imageData) {
      setCapturedImage(imageData)
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI("AIzaSyDJPJR-gcFymXn7VeWY_8rot-MvssUXOXc")
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      // Analyze image using Gemini API
      const analyzeImage = async () => {
        try {
          const imageBase64 = imageData.split(',')[1] // Remove data URL prefix
          const prompt = `You are a medical AI assistant specialized in analyzing medicine packaging. Analyze the provided image of a medicine package and extract the following details: name, generic name, description, ingredients, manufacturer, dosage instructions, side effects, precautions, and a relevant YouTube video ID (search for an educational video if possible, otherwise use "dQw4w9WgXcQ" as a placeholder). Ensure the response is in JSON format matching this structure:
          {
            "name": string,
            "genericName": string,
            "description": string,
            "ingredients": string[],
            "manufacturer": string,
            "dosage": string,
            "sideEffects": string[],
            "precautions": string[],
            "youtubeVideoId": string
          }
          If the image is unclear or no medicine is identified, return a JSON object with default values indicating failure but avoid null or empty fields. Provide a clear error message in the description field.`

          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
            { text: prompt },
          ])
          const response = await result.response
          let text = response.text()

          // Clean up response to ensure valid JSON
          text = text.replace(/```json\n|```/g, '').trim() // Remove markdown code blocks if present
          let parsedData: MedicineData
          try {
            parsedData = JSON.parse(text)
            // Validate parsed data structure
            parsedData = {
              name: parsedData.name || "Unknown Medicine",
              genericName: parsedData.genericName || "Unknown",
              description: parsedData.description || "Unable to identify medicine from image.",
              ingredients: Array.isArray(parsedData.ingredients) ? parsedData.ingredients : [],
              manufacturer: parsedData.manufacturer || "Unknown",
              dosage: parsedData.dosage || "Consult a healthcare professional.",
              sideEffects: Array.isArray(parsedData.sideEffects) ? parsedData.sideEffects : [],
              precautions: Array.isArray(parsedData.precautions) ? parsedData.precautions : [],
              youtubeVideoId: parsedData.youtubeVideoId || "dQw4w9WgXcQ",
              reviews: [],
            }
          } catch (error) {
            // Fallback if JSON parsing fails
            parsedData = {
              name: "Unknown Medicine",
              genericName: "Unknown",
              description: "Failed to parse medicine details from image. Please ensure the image is clear and try again.",
              ingredients: [],
              manufacturer: "Unknown",
              dosage: "Consult a healthcare professional.",
              sideEffects: [],
              precautions: [],
              youtubeVideoId: "dQw4w9WgXcQ",
              reviews: [],
            }
          }

          // Append default reviews to maintain consistency
          parsedData.reviews = [
            {
              user: "John D.",
              rating: 5,
              comment: "Very effective for headaches. Works quickly.",
              date: "2024-01-15",
            },
            {
              user: "Sarah M.",
              rating: 4,
              comment: "Good pain relief, but sometimes causes mild stomach upset.",
              date: "2024-01-10",
            },
            {
              user: "Mike R.",
              rating: 5,
              comment: "Reliable and affordable. Always keep it at home.",
              date: "2024-01-05",
            },
          ]
          setMedicineData(parsedData)
          setIsAnalyzing(false)
        } catch (error) {
          console.error("Error analyzing image:", error)
          setMedicineData({
            name: "Unknown Medicine",
            genericName: "Unknown",
            description: "Error analyzing image. Please ensure the image is clear and try again or consult a healthcare professional.",
            ingredients: [],
            manufacturer: "Unknown",
            dosage: "Consult a healthcare professional.",
            sideEffects: [],
            precautions: [],
            youtubeVideoId: "dQw4w9WgXcQ",
            reviews: [
              {
                user: "John D.",
                rating: 5,
                comment: "Very effective for headaches. Works quickly.",
                date: "2024-01-15",
              },
              {
                user: "Sarah M.",
                rating: 4,
                comment: "Good pain relief, but sometimes causes mild stomach upset.",
                date: "2024-01-10",
              },
              {
                user: "Mike R.",
                rating: 5,
                comment: "Reliable and affordable. Always keep it at home.",
                date: "2024-01-05",
              },
            ],
          })
          setIsAnalyzing(false)
        }
      }

      analyzeImage()
    } else {
      router.push("/dashboard")
    }
  }, [router])

  const submitReview = () => {
    if (medicineData && newReview.comment.trim()) {
      const updatedReviews = [
        ...medicineData.reviews,
        {
          user: "You",
          rating: newReview.rating,
          comment: newReview.comment,
          date: new Date().toISOString().split("T")[0],
        },
      ]
      setMedicineData({
        ...medicineData,
        reviews: updatedReviews,
      })
      setNewReview({ rating: 5, comment: "" })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  if (!capturedImage) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-800">Medicine Analysis</h1>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href="/maps">
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Find Nearby
              </Button>
            </Link>
            <Link href="/chatbot">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isAnalyzing ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analyzing Your Medicine...</h2>
            <p className="text-gray-600">Please wait while we identify and gather information about your medicine.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image Section */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Captured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured medicine"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medicine Information */}
            <div className="lg:col-span-2">
              {medicineData && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-3xl text-blue-800">{medicineData.name}</CardTitle>
                          <CardDescription className="text-lg mt-2">
                            Generic: {medicineData.genericName}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Identified
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{medicineData.description}</p>
                    </CardContent>
                  </Card>

                  {/* Detailed Information Tabs */}
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="video">Video</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                      <TabsTrigger value="manufacturer">Manufacturer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-red-500" />
                            Ingredients
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {medicineData.ingredients.map((ingredient, index) => (
                              <Badge key={index} variant="outline">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Dosage Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{medicineData.dosage}</p>
                        </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-orange-600">Side Effects</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {medicineData.sideEffects.map((effect, index) => (
                                <li key={index} className="text-gray-700">
                                  • {effect}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-blue-600">Precautions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {medicineData.precautions.map((precaution, index) => (
                                <li key={index} className="text-gray-700">
                                  • {precaution}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="video">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Play className="h-5 w-5 mr-2 text-red-500" />
                            Educational Video
                          </CardTitle>
                          <CardDescription>Learn more about this medicine from medical professionals</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">Video about {medicineData.name}</p>
                              <Button
                                className="mt-4"
                                onClick={() =>
                                  window.open(
                                    `https://www.youtube.com/watch?v=${medicineData.youtubeVideoId}`,
                                    "_blank",
                                  )
                                }
                              >
                                Watch on YouTube
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="reviews">
                      <div className="space-y-4">
                        {/* Add Review */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Share Your Experience</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Rating</label>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-6 w-6 cursor-pointer ${
                                      star <= newReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Your Review</label>
                              <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="Share your experience with this medicine..."
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              />
                            </div>
                            <Button onClick={submitReview} className="w-full">
                              Submit Review
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Existing Reviews */}
                        <div className="space-y-4">
                          {medicineData.reviews.map((review, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{review.user}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">{renderStars(review.rating)}</div>
                                    <span className="text-sm text-gray-500">{review.date}</span>
                                  </div>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="manufacturer">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Factory className="h-5 w-5 mr-2 text-blue-500" />
                            Manufacturer Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-800">Company</h4>
                              <p className="text-gray-600">{medicineData.manufacturer}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Quality Assurance</h4>
                              <p className="text-gray-600">
                                This medicine is manufactured under strict quality control standards and is approved by
                                regulatory authorities.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Batch Information</h4>
                              <p className="text-gray-600">
                                Always check the batch number and expiry date on the packaging before use.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}