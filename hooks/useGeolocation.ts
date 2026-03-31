'use client'

import { useState, useCallback } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: false,
  })

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Trình duyệt không hỗ trợ định vị GPS' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Bạn đã từ chối cấp quyền truy cập vị trí',
          2: 'Không thể xác định vị trí hiện tại',
          3: 'Hết thời gian lấy vị trí',
        }
        setState(prev => ({
          ...prev,
          error: messages[err.code] || 'Lỗi không xác định',
          loading: false,
        }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  return { ...state, getCurrentLocation }
}
