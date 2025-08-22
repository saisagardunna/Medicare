"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, MapPin, Phone, Clock, Navigation, Building2, Pill } from "lucide-react"
import { useRouter } from "next/navigation"

interface Location {
  id: string
  name: string
  type: "pharmacy" | "hospital"
  address: string
  phone: string
  distance: string
  rating: number
  isOpen: boolean
  hours: string
  lat: number
  lng: number
}

export default function MapsPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "pharmacy" | "hospital">("all")
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          loadNearbyLocations(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your location. Using default location.")
          loadNearbyLocations(40.7128, -74.0060) // Default to New York City
        }
      )
    } else {
      console.error("Geolocation not supported by browser")
      setError("Geolocation not supported. Using default location.")
      loadNearbyLocations(40.7128, -74.0060) // Default to New York City
    }
  }, [])

  const loadNearbyLocations = async (lat: number, lng: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const nearbyResponse = await fetch(
        `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"~"hospital|pharmacy"](around:5000,${lat},${lng}););out body;`
      )
      if (!nearbyResponse.ok) throw new Error("Failed to fetch nearby locations")
      const nearbyData = await nearbyResponse.json()
      const nearbyLocations: Location[] = nearbyData.elements
        .map((place: any) => {
          const type: "pharmacy" | "hospital" = place.tags.amenity === "pharmacy" ? "pharmacy" : "hospital"
          return {
            id: place.id.toString(),
            name: place.tags.name || "Unknown",
            type,
            address: place.tags["addr:street"] || "Unknown address",
            phone: place.tags["contact:phone"] || "Not available",
            distance: calculateDistance(lat, lng, place.lat, place.lon),
            rating: 0,
            isOpen: false,
            hours: place.tags["opening_hours"] || "Not available",
            lat: place.lat,
            lng: place.lon,
          }
        })
        .filter((loc: Location) => loc.type !== undefined)

      setLocations(nearbyLocations)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching locations:", error)
      setError("Failed to fetch nearby locations. Using mock data.")
      const mockLocations: Location[] = [
        {
          id: "1",
          name: "City Medical Pharmacy",
          type: "pharmacy",
          address: "123 Main Street, Downtown",
          phone: "+1 (555) 123-4567",
          distance: calculateDistance(lat, lng, 40.7120, -74.0050),
          rating: 4.5,
          isOpen: true,
          hours: "8:00 AM - 10:00 PM",
          lat: 40.7120,
          lng: -74.0050,
        },
        {
          id: "2",
          name: "General Hospital",
          type: "hospital",
          address: "456 Health Avenue, Medical District",
          phone: "+1 (555) 987-6543",
          distance: calculateDistance(lat, lng, 40.7100, -74.0040),
          rating: 4.2,
          isOpen: true,
          hours: "24/7",
          lat: 40.7100,
          lng: -74.0040,
        },
      ]
      setLocations(mockLocations)
      setIsLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371 // Radius of Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance.toFixed(1) + " km"
  }

  const filteredLocations = locations.filter((location) => {
    const matchesType = selectedType === "all" || location.type === selectedType
    const matchesSearch =
      searchQuery === "" ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.type === "hospital" && searchQuery.toLowerCase().includes("hospital"))
    return matchesType && matchesSearch
  })

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`, "_blank")
  }

  const callLocation = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="hover:scale-105 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform duration-300" />
              <h1 className="text-2xl font-bold text-gray-800">Find Nearby</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for pharmacies or hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full focus:ring-2 focus:ring-blue-500 hover:shadow-md transition-all duration-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                onClick={() => setSelectedType("all")}
                className="hover:scale-105 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
              >
                All
              </Button>
              <Button
                variant={selectedType === "pharmacy" ? "default" : "outline"}
                onClick={() => setSelectedType("pharmacy")}
                className="hover:scale-105 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
              >
                <Pill className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Pharmacies
              </Button>
              <Button
                variant={selectedType === "hospital" ? "default" : "outline"}
                onClick={() => setSelectedType("hospital")}
                className="hover:scale-105 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
              >
                <Building2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Hospitals
              </Button>
            </div>
          </div>
        </div>

        {/* Map */}
        <Card className="mb-8 hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-0">
            {userLocation && (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.05},${userLocation.lat - 0.05},${userLocation.lng + 0.05},${userLocation.lat + 0.05}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`}
                width="100%"
                height="400"
                style={{ border: "none" }}
                title="Map"
              ></iframe>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 bg-red-50 border-red-200 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => loadNearbyLocations(userLocation?.lat || 40.7128, userLocation?.lng || -74.0060)}
                className="mt-4 hover:scale-105 hover:bg-blue-600 transition-all duration-300"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding nearby locations...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nearby Locations ({filteredLocations.length})
            </h2>
            {filteredLocations.length === 0 ? (
              <p className="text-center text-gray-500">No locations found. Try adjusting your search or filter.</p>
            ) : (
              filteredLocations.map((location) => (
                <Card key={location.id} className="hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`p-3 rounded-full ${
                            location.type === "pharmacy" ? "bg-green-100" : "bg-red-100"
                          } group-hover:scale-110 transition-transform duration-300`}
                        >
                          {location.type === "pharmacy" ? (
                            <Pill className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <Building2 className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                              {location.name}
                            </h3>
                            <Badge
                              variant={location.isOpen ? "default" : "secondary"}
                              className="text-xs group-hover:scale-105 transition-transform duration-300"
                            >
                              {location.isOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-1 group-hover:text-gray-700 transition-colors duration-300">
                            {location.address}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center group-hover:text-blue-600 transition-colors duration-300">
                              <Clock className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              {location.hours}
                            </div>
                            <div className="flex items-center group-hover:text-green-600 transition-colors duration-300">
                              <Navigation className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              {location.distance}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => openInMaps(location.lat, location.lng)}
                        className="flex-1 hover:scale-105 hover:bg-blue-600 transition-all duration-300"
                      >
                        <MapPin className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Directions
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => callLocation(location.phone)}
                        className="flex-1 hover:scale-105 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                      >
                        <Phone className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}