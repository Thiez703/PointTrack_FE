'use client'

import React, { useEffect, useState } from 'react'
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  MapControl,
  ControlPosition
} from '@vis.gl/react-google-maps'
import { SITE_CONFIG } from '@/lib/Constant'
import { AlertCircle } from 'lucide-react'

// Haversine formula to calculate distance
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371e3 
  const f1 = (lat1 * Math.PI) / 180
  const f2 = (lat2 * Math.PI) / 180
  const df = ((lat2 - lat1) * Math.PI) / 180
  const dl = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(df / 2) * Math.sin(df / 2) +
    Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

interface CheckinMapProps {
  customerLat: number
  customerLng: number
  employeeLat: number | null
  employeeLng: number | null
  onDistanceChange?: (distance: number) => void
}

const MapContent = ({
  customerLat,
  customerLng,
  employeeLat,
  employeeLng,
  onDistanceChange
}: CheckinMapProps) => {
  const map = useMap()
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    if (customerLat && customerLng && employeeLat && employeeLng) {
      const dist = getDistance(customerLat, customerLng, employeeLat, employeeLng)
      setDistance(dist)
      onDistanceChange?.(dist)

      if (map) {
        const bounds = new google.maps.LatLngBounds()
        bounds.extend({ lat: customerLat, lng: customerLng })
        bounds.extend({ lat: employeeLat, lng: employeeLng })
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
      }
    }
  }, [customerLat, customerLng, employeeLat, employeeLng, map, onDistanceChange])

  // Geofence Circle (50m)
  useEffect(() => {
    if (!map || !customerLat || !customerLng) return

    const circle = new google.maps.Circle({
      strokeColor: '#ef4444',
      strokeOpacity: 0.6,
      strokeWeight: 1.5,
      fillColor: '#ef4444',
      fillOpacity: 0.1,
      map,
      center: { lat: customerLat, lng: customerLng },
      radius: 50
    })

    return () => circle.setMap(null)
  }, [map, customerLat, customerLng])

  return (
    <>
      {/* Customer Marker - Standard Red Marker */}
      <Marker 
        position={{ lat: customerLat, lng: customerLng }}
        title="Khách hàng"
      />

      {/* Employee Marker - Simple Blue Circle */}
      {employeeLat && employeeLng && (
        <Marker 
          position={{ lat: employeeLat, lng: employeeLng }}
          title="Vị trí của bạn"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8
          }}
        />
      )}

      {/* Distance Warning Overlay */}
      {distance !== null && distance > 50 && (
        <MapControl position={ControlPosition.TOP_CENTER}>
          <div className="mt-4 mx-4 bg-red-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-xl animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Bạn đang đứng quá xa ( &gt; 50m)</span>
          </div>
        </MapControl>
      )}
    </>
  )
}

export const CheckinMap: React.FC<CheckinMapProps> = (props) => {
  if (!props.customerLat || !props.customerLng) return null

  return (
    <div className="w-full h-[260px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 relative">
      <APIProvider apiKey={SITE_CONFIG.googleMapsApiKey}>
        <Map
          defaultCenter={{ lat: props.customerLat, lng: props.customerLng }}
          defaultZoom={17}
          disableDefaultUI={true}
          gestureHandling={'greedy'}
          className="w-full h-full"
        >
          <MapContent {...props} />
        </Map>
      </APIProvider>
      
      {/* Info labels Overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-white/95 backdrop-blur px-2 py-1 rounded-md border border-gray-100 shadow-sm flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-red-500" />
             <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">Khách hàng</span>
          </div>
          <div className="bg-white/95 backdrop-blur px-2 py-1 rounded-md border border-gray-100 shadow-sm flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-blue-500" />
             <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">Bạn</span>
          </div>
      </div>
    </div>
  )
}
