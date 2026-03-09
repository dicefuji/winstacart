'use client'

import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DeliveryAddress } from '@/lib/types'

// Fix Leaflet default icon issue
const storeIcon = new L.DivIcon({
  className: 'custom-icon',
  html: '<div style="width:32px;height:32px;background:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏪</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const driverIcon = new L.DivIcon({
  className: 'custom-icon',
  html: '<div style="width:36px;height:36px;background:#7c3aed;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚗</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const homeIcon = new L.DivIcon({
  className: 'custom-icon',
  html: '<div style="width:32px;height:32px;background:#dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏠</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface OrderMapProps {
  progress: number
  deliveryAddress: DeliveryAddress
}

// Store location (Safeway in SF)
const storePos: [number, number] = [37.7749, -122.4194]
// Home position
const homePos: [number, number] = [37.7849, -122.4094]

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  React.useEffect(() => {
    map.setView(center, 14)
  }, [map, center])
  return null
}

export default function OrderMap({ progress }: OrderMapProps) {
  const driverPos = useMemo((): [number, number] => {
    const t = progress / 100
    return [
      storePos[0] + (homePos[0] - storePos[0]) * t,
      storePos[1] + (homePos[1] - storePos[1]) * t,
    ]
  }, [progress])

  const routePath: [number, number][] = useMemo(() => {
    const pts: [number, number][] = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const lat = storePos[0] + (homePos[0] - storePos[0]) * t
      const lng = storePos[1] + (homePos[1] - storePos[1]) * t + Math.sin(t * Math.PI) * 0.003
      pts.push([lat, lng])
    }
    return pts
  }, [])

  const center: [number, number] = [
    (storePos[0] + homePos[0]) / 2,
    (storePos[1] + homePos[1]) / 2,
  ]

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapController center={center} />

      {/* Route path */}
      <Polyline
        positions={routePath}
        pathOptions={{ color: '#16a34a', weight: 4, opacity: 0.6, dashArray: '8, 12' }}
      />

      {/* Traveled path */}
      <Polyline
        positions={routePath.slice(0, Math.ceil((progress / 100) * routePath.length))}
        pathOptions={{ color: '#16a34a', weight: 4, opacity: 1 }}
      />

      {/* Store marker */}
      <Marker position={storePos} icon={storeIcon} />

      {/* Driver marker */}
      {progress > 0 && progress < 100 && (
        <Marker position={driverPos} icon={driverIcon} />
      )}

      {/* Home marker */}
      <Marker position={homePos} icon={homeIcon} />
    </MapContainer>
  )
}
