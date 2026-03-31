'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Crosshair, Search, Loader2, MapPin, X } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'

// Fix Leaflet default icon issue with webpack/Next.js
const createOrangeIcon = () =>
  L.divIcon({
    html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#f97316" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
    className: '',
  })

export interface PickedLocation {
  lat: number
  lng: number
  address: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

// Child component: pan/zoom map programmatically
function MapController({ center, zoom }: { center: [number, number] | null; zoom: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

// Child component: handle map click
function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009] // TP.HCM

interface LocationPickerMapProps {
  initialLocation?: { lat: number; lng: number }
  onLocationChange: (location: PickedLocation) => void
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLocation,
  onLocationChange,
}) => {
  const [mounted, setMounted] = useState(false)
  const [marker, setMarker] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  )
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [displayAddress, setDisplayAddress] = useState('')

  const { getCurrentLocation, loading: gpsLoading, error: gpsError, lat: gpsLat, lng: gpsLng } = useGeolocation()
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const iconRef = useRef<L.DivIcon | null>(null)

  useEffect(() => {
    setMounted(true)
    iconRef.current = createOrangeIcon()
  }, [])

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'vi', 'User-Agent': 'PointTrack/1.0' } }
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }, [])

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setMarker([lat, lng])
    const address = await reverseGeocode(lat, lng)
    setDisplayAddress(address)
    onLocationChange({ lat, lng, address })
  }, [reverseGeocode, onLocationChange])

  const handleMarkerDrag = useCallback(async (e: L.DragEndEvent) => {
    const { lat, lng } = e.target.getLatLng()
    setMarker([lat, lng])
    const address = await reverseGeocode(lat, lng)
    setDisplayAddress(address)
    onLocationChange({ lat, lng, address })
  }, [reverseGeocode, onLocationChange])

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    if (!value.trim()) { setSearchResults([]); return }
    searchDebounce.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&countrycodes=vn&limit=5`,
          { headers: { 'Accept-Language': 'vi', 'User-Agent': 'PointTrack/1.0' } }
        )
        setSearchResults(await res.json())
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 600)
  }

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setMarker([lat, lng])
    setDisplayAddress(result.display_name)
    setSearchQuery(result.display_name)
    setSearchResults([])
    setFlyTo({ center: [lat, lng], zoom: 17 })
    onLocationChange({ lat, lng, address: result.display_name })
  }

  // Apply GPS location when it arrives
  useEffect(() => {
    if (gpsLat === null || gpsLng === null) return
    const apply = async () => {
      setMarker([gpsLat, gpsLng])
      setFlyTo({ center: [gpsLat, gpsLng], zoom: 17 })
      const address = await reverseGeocode(gpsLat, gpsLng)
      setDisplayAddress(address)
      setSearchQuery(address)
      onLocationChange({ lat: gpsLat, lng: gpsLng, address })
    }
    apply()
  }, [gpsLat, gpsLng]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[420px] bg-gray-50 rounded-2xl border border-gray-100">
        <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
        <span className="ml-3 text-gray-500 font-medium">Đang tải bản đồ...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Tìm kiếm địa chỉ tại Việt Nam..."
              className="pl-10 pr-8 rounded-xl border-gray-200 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={gpsLoading}
            className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 shrink-0"
            title="Lấy vị trí hiện tại"
          >
            {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          </Button>
        </div>

        {/* Search dropdown */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="absolute z-[1000] top-full mt-1 left-0 right-10 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
            {isSearching ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tìm kiếm...
              </div>
            ) : (
              searchResults.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-orange-50 text-sm text-gray-700 border-b border-gray-50 last:border-0 flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{r.display_name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {gpsError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {gpsError}
        </p>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 420 }}>
        <MapContainer
          center={marker ?? DEFAULT_CENTER}
          zoom={marker ? 16 : 13}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleMapClick} />
          {flyTo && <MapController center={flyTo.center} zoom={flyTo.zoom} />}
          {marker && iconRef.current && (
            <Marker
              position={marker}
              icon={iconRef.current}
              draggable
              ref={markerRef}
              eventHandlers={{ dragend: handleMarkerDrag }}
            />
          )}
        </MapContainer>
      </div>

      {marker ? (
        <p className="text-[11px] text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
          <span className="font-mono">{marker[0].toFixed(6)}, {marker[1].toFixed(6)}</span>
          {displayAddress && <><span className="text-gray-300 mx-1">·</span><span className="italic truncate">{displayAddress}</span></>}
        </p>
      ) : (
        <p className="text-[11px] text-orange-600 font-medium text-center">
          Nhấn vào bản đồ hoặc tìm kiếm địa chỉ để chọn vị trí
        </p>
      )}
    </div>
  )
}
