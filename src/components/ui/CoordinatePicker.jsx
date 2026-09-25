import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react'

// Custom sleek marker SVG icon (no missing asset issues)
const createMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-16px, -32px);
      ">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#09090b" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

export default function CoordinatePicker({
  latitude,
  longitude,
  onChange,
  defaultLat = -6.917464,
  defaultLng = 107.619122,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  const currentLat = latitude !== '' && latitude !== null && !isNaN(Number(latitude))
    ? Number(latitude)
    : defaultLat

  const currentLng = longitude !== '' && longitude !== null && !isNaN(Number(longitude))
    ? Number(longitude)
    : defaultLng

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([currentLat, currentLng], {
        draggable: true,
        icon: createMarkerIcon(),
      }).addTo(map)

      // When marker is dragged
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng()
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)))
      })

      // When user clicks anywhere on map
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)))
      })

      mapInstanceRef.current = map
      markerRef.current = marker

      // Invalidate size after modal render animation
      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Sync marker and map when latitude or longitude props change externally (e.g. typing manual)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const markerLatLng = markerRef.current.getLatLng()
      if (
        Math.abs(markerLatLng.lat - currentLat) > 0.00001 ||
        Math.abs(markerLatLng.lng - currentLng) > 0.00001
      ) {
        markerRef.current.setLatLng([currentLat, currentLng])
        mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true })
      }
    }
  }, [currentLat, currentLng])

  const handleManualLatChange = (e) => {
    const val = e.target.value
    onChange(val, longitude)
  }

  const handleManualLngChange = (e) => {
    const val = e.target.value
    onChange(latitude, val)
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6))
          const lng = Number(pos.coords.longitude.toFixed(6))
          onChange(lat, lng)
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
            mapInstanceRef.current.setView([lat, lng], 15)
          }
        },
        () => {
          // Geolocation permission denied or unavailable
        }
      )
    }
  }

  // Free OpenStreetMap Nominatim Place Search
  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=id&limit=5`
      )
      const data = await res.json()
      setSearchResults(data)
      setShowDropdown(true)
    } catch (err) {
      console.error('Nominatim search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectPlace = (place) => {
    const lat = Number(parseFloat(place.lat).toFixed(6))
    const lng = Number(parseFloat(place.lon).toFixed(6))
    onChange(lat, lng)

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapInstanceRef.current.setView([lat, lng], 15)
    }

    setShowDropdown(false)
    setSearchQuery(place.display_name.split(',')[0])
  }

  return (
    <div className="space-y-2.5">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
          <span>Koordinat</span>
        </Label>

        <button
          type="button"
          onClick={handleCurrentLocation}
          className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 font-mono transition-colors"
          title="Gunakan Lokasi Perangkat Sekarang"
        >
          <Navigation className="w-3 h-3" />
        </button>
      </div>



      {/* Manual Inputs Row (Two-Way Sync) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-mono text-zinc-500">Latitude (Garis Lintang)</div>
          <Input
            type="number"
            step="any"
            value={latitude ?? ''}
            onChange={handleManualLatChange}
            placeholder="-6.917464"
            className="h-8 text-xs font-mono bg-white dark:bg-zinc-900"
          />
        </div>
        <div className="space-y-1">
          <div className="text-[11px] font-mono text-zinc-500">Longitude (Garis Bujur)</div>
          <Input
            type="number"
            step="any"
            value={longitude ?? ''}
            onChange={handleManualLngChange}
            placeholder="107.619122"
            className="h-8 text-xs font-mono bg-white dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="space-y-1">
        <div className="relative w-full h-56 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Hint Overlay */}
          <div className="absolute bottom-2 left-2 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm pointer-events-none">
            Klik peta atau geser pin untuk set koordinat
          </div>
        </div>
      </div>
    </div>
  )
}
