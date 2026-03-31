'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

const createOrangeIcon = () =>
  L.divIcon({
    html: `<svg width="22" height="32" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#f97316" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`,
    iconSize: [22, 32],
    iconAnchor: [11, 32],
    className: '',
  })

interface MiniMapPreviewProps {
  lat: number
  lng: number
  label?: string
}

export const MiniMapPreview: React.FC<MiniMapPreviewProps> = ({ lat, lng, label }) => {
  const [mounted, setMounted] = useState(false)
  const iconRef = useRef<L.DivIcon | null>(null)

  useEffect(() => {
    setMounted(true)
    iconRef.current = createOrangeIcon()
  }, [])

  if (!mounted) return null

  return (
    <div className="rounded-xl overflow-hidden border border-orange-200 shadow-sm">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ width: '100%', height: 120 }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {iconRef.current && <Marker position={[lat, lng]} icon={iconRef.current} />}
      </MapContainer>
      {label && (
        <div className="px-2 py-1 bg-orange-50 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
          <span className="text-[10px] text-orange-700 font-medium truncate">{label}</span>
        </div>
      )}
    </div>
  )
}
