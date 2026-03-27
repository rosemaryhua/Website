import { useEffect, useRef, useState } from 'react'
import { MAP_PINS, CITY_CENTERS } from '../utils/mapPins'

const CITY_COLORS = {
  Taipei: '#3b82f6',
  Seoul: '#10b981',
  Busan: '#f59e0b',
  Gyeongju: '#ef4444',
}

export default function PinMap({ cityFilter }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  const filteredPins = MAP_PINS.filter(p => p.city === cityFilter)
  const center = CITY_CENTERS[cityFilter] || CITY_CENTERS.Seoul

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      try {
        const L = await import('leaflet')

        // Load leaflet CSS dynamically
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
          // Wait for CSS to load
          await new Promise(resolve => { link.onload = resolve; setTimeout(resolve, 1000) })
        }

        if (cancelled || !mapRef.current) return

        // Clean up previous map
        if (mapInstance.current) {
          mapInstance.current.remove()
          mapInstance.current = null
        }

        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: center.zoom,
          zoomControl: true,
          attributionControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18,
        }).addTo(map)

        const color = CITY_COLORS[cityFilter] || '#3b82f6'

        filteredPins.forEach(pin => {
          const icon = L.divIcon({
            className: '',
            html: `<div style="
              background: ${color};
              width: 24px; height: 24px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24],
          })

          L.marker([pin.lat, pin.lng], { icon })
            .addTo(map)
            .bindPopup(`<b>${pin.name}</b><br><a href="https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}" target="_blank" style="color:#2563eb">Open in Google Maps</a>`)
        })

        // Fit bounds if multiple pins
        if (filteredPins.length > 1) {
          const bounds = L.latLngBounds(filteredPins.map(p => [p.lat, p.lng]))
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
        }

        mapInstance.current = map
        if (!cancelled) setReady(true)
      } catch (e) {
        console.error('Map init error:', e)
        if (!cancelled) setError(true)
      }
    }

    setReady(false)
    setError(false)
    initMap()

    return () => {
      cancelled = true
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [cityFilter])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-500">
        <p>Could not load the map. Try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <p className="text-sm text-gray-400">Loading map...</p>
        </div>
      )}
      <div ref={mapRef} style={{ height: '100%', width: '100%', minHeight: '400px' }} />
    </div>
  )
}
