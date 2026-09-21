import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Search, AlertCircle, Loader2 } from 'lucide-react'

// Singleton Google Maps Loader instance
let googleLoaderInstance = null
function getGoogleLoader() {
  if (!googleLoaderInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    googleLoaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places']
    })
  }
  return googleLoaderInstance
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
  const searchInputRef = useRef(null)
  const autocompleteRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [hasApiKey, setHasApiKey] = useState(Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY))

  const currentLat = latitude !== '' && latitude !== null && !isNaN(Number(latitude))
    ? Number(latitude)
    : defaultLat

  const currentLng = longitude !== '' && longitude !== null && !isNaN(Number(longitude))
    ? Number(longitude)
    : defaultLng

  // Initialize Google Maps
  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      try {
        setLoading(true)
        setLoadError(null)

        const loader = getGoogleLoader()
        const google = await loader.load()

        if (!isMounted || !mapContainerRef.current) return

        const initialPos = { lat: currentLat, lng: currentLng }

        // Create Map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialPos,
          zoom: 13,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        })

        // Create Marker
        const marker = new google.maps.Marker({
          position: initialPos,
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: 'Geser pin untuk ubah koordinat',
        })

        // Event: Marker Drag End
        marker.addListener('dragend', (e) => {
          const lat = Number(e.latLng.lat().toFixed(6))
          const lng = Number(e.latLng.lng().toFixed(6))
          onChange(lat, lng)
        })

        // Event: Click on Map
        map.addListener('click', (e) => {
          const lat = Number(e.latLng.lat().toFixed(6))
          const lng = Number(e.latLng.lng().toFixed(6))
          marker.setPosition({ lat, lng })
          onChange(lat, lng)
        })

        // Initialize Places Autocomplete if search input is available
        if (searchInputRef.current && google.maps.places) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['geometry', 'name', 'formatted_address'],
            componentRestrictions: { country: 'id' }, // prioritize Indonesia
          })

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.geometry && place.geometry.location) {
              const lat = Number(place.geometry.location.lat().toFixed(6))
              const lng = Number(place.geometry.location.lng().toFixed(6))
              map.setCenter({ lat, lng })
              map.setZoom(15)
              marker.setPosition({ lat, lng })
              onChange(lat, lng)
            }
          })

          autocompleteRef.current = autocomplete
        }

        mapInstanceRef.current = map
        markerRef.current = marker
        setLoading(false)
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load Google Maps:', err)
        setLoadError(err.message || 'Gagal memuat Google Maps')
        setLoading(false)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [])

  // Sync marker and map when latitude or longitude props change externally (e.g. typing manual)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const markerPos = markerRef.current.getPosition()
      if (markerPos) {
        const markerLat = markerPos.lat()
        const markerLng = markerPos.lng()

        if (
          Math.abs(markerLat - currentLat) > 0.00001 ||
          Math.abs(markerLng - currentLng) > 0.00001
        ) {
          const newPos = { lat: currentLat, lng: currentLng }
          markerRef.current.setPosition(newPos)
          mapInstanceRef.current.panTo(newPos)
        }
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
            const newPos = { lat, lng }
            markerRef.current.setPosition(newPos)
            mapInstanceRef.current.setCenter(newPos)
            mapInstanceRef.current.setZoom(16)
          }
        },
        () => {
          // Geolocation permission denied or failed
        }
      )
    }
  }

  return (
    <div className="space-y-2.5">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
          <span>Google Maps & Koordinat Spasial</span>
        </Label>

        <button
          type="button"
          onClick={handleCurrentLocation}
          className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 font-mono transition-colors"
          title="Gunakan Lokasi Perangkat Sekarang"
        >
          <Navigation className="w-3 h-3" />
          <span>GPS Saya</span>
        </button>
      </div>

      {/* Google Places Search Box */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Cari lokasi / alamat di Google Maps (misal: Cibinong Science Center, Bandung)..."
          className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900"
        />
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

      {/* Interactive Google Map Canvas */}
      <div className="space-y-1">
        <div className="relative w-full h-56 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-10">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500 mb-1.5" />
              <span className="text-xs text-zinc-500 font-mono">Memuat Google Maps...</span>
            </div>
          )}

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 z-10 text-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mb-1.5" />
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Google Maps Memerlukan API Key
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                Tambahkan <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_MAPS_API_KEY</code> di file <code className="font-mono">.env</code>.
              </p>
            </div>
          )}

          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Hint Overlay */}
          <div className="absolute bottom-2 left-2 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm pointer-events-none">
            Klik peta atau geser pin merah untuk set koordinat
          </div>
        </div>
      </div>

      {!hasApiKey && (
        <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between px-1">
          <span>* Mode Google Maps aktif. Masukkan VITE_GOOGLE_MAPS_API_KEY di .env untuk menghapus watermark dev.</span>
        </div>
      )}
    </div>
  )
}
