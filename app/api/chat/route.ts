import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDJPJR-gcFymXn7VeWY_8rot-MvssUXOXc")

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Use the correct model name for the current API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a helpful medical AI assistant. Provide accurate, helpful information about medicines, symptoms, and general health questions. Always remind users to consult healthcare professionals for serious medical concerns. Keep responses concise but informative.

User question: ${message}

Please provide a helpful response:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in chat API:", error)

    // Provide a fallback response if API fails
    const fallbackResponse = `I apologize, but I'm having trouble connecting to my AI service right now. Here are some general medical tips:

• Always read medicine labels carefully
• Take medications as prescribed by your doctor
• Store medicines in a cool, dry place
• Check expiration dates regularly
• Consult a healthcare professional for any medical concerns

Please try again later or contact a healthcare professional for immediate medical advice.`

    return NextResponse.json({ response: fallbackResponse })
  }
}
