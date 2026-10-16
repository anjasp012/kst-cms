import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Compass, Navigation, Search, Loader2, MapPin, X } from 'lucide-react'

// Custom sleek marker SVG icon (clean, no missing assets, sharp shadow)
// Map category to marker color: Kawasan (Biru), Kebun Raya (Ijo), BRIDA (Merah)
const getCategoryColor = (cat = '') => {
  const c = String(cat || '').toUpperCase()
  if (c.includes('KEBUN RAYA') || c.includes('BOTANI') || c.includes('KR ') || c.includes('KR-')) return '#16a34a' // Ijo
  if (c.includes('BRIDA') || c.includes('BAPPERIDA') || c.includes('BAPPEDA') || c.includes('DAERAH')) return '#dc2626' // Merah
  return '#2563eb' // Biru (Kawasan)
}

// Sleek, pixel-perfect marker SVG icon (sharp tip at exact bottom center)
const createMarkerIcon = (color = '#2563eb') => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="
        width: 30px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.45));">
          <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 13.3 22 13.9 22.55a1.6 1.6 0 0 0 2.2 0C16.7 37 30 25.5 30 15 30 6.716 23.284 0 15 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="15" cy="14" r="5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
  })
}

export default function CoordinatePicker({
  latitude,
  longitude,
  onChange,
  defaultLat = -1.136358,
  defaultLng = 116.858022,
  mapTarget = null,
  category = 'Kawasan',
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [locating, setLocating] = useState(false)

  const pinColor = getCategoryColor(category)

  const hasValidLat = latitude !== '' && latitude !== null && !isNaN(Number(latitude))
  const hasValidLng = longitude !== '' && longitude !== null && !isNaN(Number(longitude))

  const currentLat = hasValidLat ? Number(latitude) : defaultLat
  const currentLng = hasValidLng ? Number(longitude) : defaultLng

  // Update marker icon dynamically if category changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createMarkerIcon(pinColor))
    }
  }, [pinColor])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    let resizeObserver = null

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: hasValidLat && hasValidLng ? 14 : 5,
        zoomControl: true,
      })

      // Precision cursor for picking point
      map.getContainer().style.cursor = 'crosshair'

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([currentLat, currentLng], {
        draggable: true,
        icon: createMarkerIcon(pinColor),
      }).addTo(map)

      // When marker is dragged
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng()
        const latFixed = Number(position.lat.toFixed(6))
        const lngFixed = Number(position.lng.toFixed(6))
        onChange(latFixed, lngFixed)
      })

      // When map is clicked
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        const latFixed = Number(lat.toFixed(6))
        const lngFixed = Number(lng.toFixed(6))
        marker.setLatLng([latFixed, lngFixed])
        onChange(latFixed, lngFixed)
      })

      mapInstanceRef.current = map
      markerRef.current = marker

      // Ensure proper map sizing
      const resizeTimer = setTimeout(() => {
        map.invalidateSize()
      }, 200)

      if (window.ResizeObserver && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        })
        resizeObserver.observe(mapContainerRef.current)
      }

      return () => {
        clearTimeout(resizeTimer)
        if (resizeObserver) resizeObserver.disconnect()
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          markerRef.current = null
        }
      }
    }
  }, [])

  // Sync marker position when lat/lng change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && hasValidLat && hasValidLng) {
      const markerLatLng = markerRef.current.getLatLng()
      if (
        Math.abs(markerLatLng.lat - currentLat) > 0.00001 ||
        Math.abs(markerLatLng.lng - currentLng) > 0.00001
      ) {
        markerRef.current.setLatLng([currentLat, currentLng])
        mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true })
      }
    }
  }, [currentLat, currentLng, hasValidLat, hasValidLng])

  // Fly and zoom to mapTarget when user selects province or city
  useEffect(() => {
    if (!mapTarget || !mapInstanceRef.current) return
    const { lat, lng, zoom } = mapTarget
    if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      const targetZoom = zoom || 12
      mapInstanceRef.current.flyTo([Number(lat), Number(lng)], targetZoom, {
        animate: true,
        duration: 1.2
      })
      if (markerRef.current) {
        markerRef.current.setLatLng([Number(lat), Number(lng)])
      }
    }
  }, [mapTarget?.timestamp, mapTarget?.lat, mapTarget?.lng, mapTarget?.zoom])

  // Handle manual input changes
  const handleManualLatChange = (e) => {
    const val = e.target.value
    onChange(val, longitude)
  }

  const handleManualLngChange = (e) => {
    const val = e.target.value
    onChange(latitude, val)
  }

  // Geolocation (Current Device Location)
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur Geolocation tidak didukung oleh browser Anda.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        onChange(lat, lng)

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
          mapInstanceRef.current.setView([lat, lng], 15, { animate: true })
        }
      },
      (err) => {
        setLocating(false)
        console.warn('Geolocation error:', err)
        alert('Gagal mengambil lokasi saat ini. Pastikan izin akses lokasi diaktifkan di browser.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
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
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true })
    }

    setShowDropdown(false)
    setSearchQuery(place.display_name.split(',')[0])
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Titik Koordinat Spasial (Latitude & Longitude)
            </h4>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-8">
            Ketik koordinat, cari nama tempat, atau geser pin di peta interaktif.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto pl-8 sm:pl-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCurrentLocation}
            disabled={locating}
            className="text-xs h-8 px-3 gap-1.5 font-medium border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>Lokasi Saya (GPS)</span>
          </Button>
        </div>
      </div>

      {/* 2. Grid Inputs: Latitude, Longitude & Search Place */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        
        {/* Latitude Input */}
        <div className="sm:col-span-3 space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Latitude (Lintang)
            </Label>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Lat</span>
          </div>
          <Input
            type="number"
            step="any"
            value={latitude ?? ''}
            onChange={handleManualLatChange}
            placeholder="-1.136358"
            className="h-9 text-xs font-mono bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
          />
        </div>

        {/* Longitude Input */}
        <div className="sm:col-span-3 space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Longitude (Bujur)
            </Label>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Lng</span>
          </div>
          <Input
            type="number"
            step="any"
            value={longitude ?? ''}
            onChange={handleManualLngChange}
            placeholder="116.858022"
            className="h-9 text-xs font-mono bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
          />
        </div>

        {/* Place Search on OpenStreetMap */}
        <div className="sm:col-span-6 space-y-1 relative">
          <Label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            Cari Nama Alamat / Tempat di Peta
          </Label>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                placeholder="Ketik nama tempat, misal: Balikpapan / Serpong..."
                className="h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 pr-7"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowDropdown(false)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="h-9 px-3 text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white shrink-0"
            >
              {searching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5 mr-1" />
              )}
              <span>Cari</span>
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-56 overflow-y-auto p-1 space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                Pilih Lokasi Ditemukan
              </div>
              {searchResults.map((place, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-start gap-2 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed text-zinc-700 dark:text-zinc-200 text-[11px]">
                    {place.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 3. Interactive Leaflet Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-inner group">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Live Coordinate Overlay Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-800 shadow-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[11px]">
            {hasValidLat && hasValidLng 
              ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
              : 'Belum ada titik dipilih'}
          </span>
        </div>

        {/* Hint Pill */}
        <div className="absolute top-2.5 right-2.5 z-[400] bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide shadow-sm pointer-events-none">
          💡 Klik peta atau geser pin marker
        </div>
      </div>

    </div>
  )
}
