import re

with open("src/components/KSTManagementView.jsx", "r") as f:
    text = f.read()

new_map_code = """const MapDisplay = ({ locations }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-2.5489, 118.0149], 5)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstanceRef.current)
    }

    const map = mapInstanceRef.current

    // Delay invalidateSize to ensure container is fully rendered
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    const getIcon = (jenis) => {
      let color = '#3b82f6' 
      if (jenis === 'KST') color = '#10b981' 
      if (jenis === 'BRIDA' || jenis === 'BAPPEDA' || jenis === 'BAPPERIDA') color = '#f59e0b'
      
      return L.divIcon({
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })
    }

    const bounds = L.latLngBounds()
    let hasPoints = false

    locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        hasPoints = true
        L.marker([loc.latitude, loc.longitude], { icon: getIcon(loc.jenis) })
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
              <strong style="display: block; margin-bottom: 2px;">${loc.nama}</strong>
              <span style="background: #f1f5f9; padding: 1px 4px; border-radius: 4px; font-size: 10px; border: 1px solid #e2e8f0;">${loc.jenis || 'KST'}</span>
              <div style="margin-top: 4px; color: #64748b;">${loc.kota_provinsi || loc.wilayah || ''}</div>
            </div>
          `)
          .addTo(map)
        bounds.extend([loc.latitude, loc.longitude])
      }
    })

    if (hasPoints) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
    } else {
      map.setView([-2.5489, 118.0149], 5)
    }

  }, [locations])

  // Also cleanup map when component completely unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative z-0 mb-6 bg-zinc-100 dark:bg-zinc-900">
      <div ref={mapRef} className="w-full h-full absolute inset-0 z-0"></div>
    </div>
  )
}"""

# Using regex to replace the old MapDisplay block
text = re.sub(r'const MapDisplay = \(\{ locations \}\) => \{.*?return \(\n    <div className="w-full h-\[400px\].*?</div>\n  \)\n\}', new_map_code, text, flags=re.DOTALL)

with open("src/components/KSTManagementView.jsx", "w") as f:
    f.write(text)
