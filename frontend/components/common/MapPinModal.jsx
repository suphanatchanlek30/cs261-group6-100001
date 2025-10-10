"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// ✅ โหลดเฉพาะฝั่ง client
if (typeof window !== "undefined") {
  import("leaflet/dist/leaflet.css");
}

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const useMapEvents = dynamic(() => import("react-leaflet").then((m) => m.useMapEvents), { ssr: false });

let L;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

/**
 * MapPinModal
 * - เปิด modal แล้วขออนุญาต GPS
 * - หมุดจะขึ้นตรงตำแหน่งปัจจุบันทันที
 * - สามารถลากหมุดได้ / คลิกแผนที่เพื่อเปลี่ยนตำแหน่ง
 * - เมื่อกด "ใช้พิกัดนี้" จะส่ง lat,lng กลับไป
 */
export default function MapPinModal({ open, onClose, onPick }) {
  const [picked, setPicked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(Date.now());

  // ✅ ขอสิทธิ์ตำแหน่งเมื่อเปิด modal
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setMapKey(Date.now());

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPicked({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          console.warn("ไม่สามารถดึงตำแหน่งได้:", err);
          // fallback → BKK
          setPicked({ lat: 13.7563, lng: 100.5018 });
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      // กรณี browser ไม่รองรับ
      setPicked({ lat: 13.7563, lng: 100.5018 });
      setLoading(false);
    }
  }, [open]);

  const icon = L
    ? L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
        iconAnchor: [12, 41],
      })
    : null;

  // ✅ จับคลิกบนแผนที่เพื่อเปลี่ยนหมุด
  const ClickToSet = () => {
    useMapEvents({
      click(e) {
        setPicked({
          lat: parseFloat(e.latlng.lat.toFixed(7)),
          lng: parseFloat(e.latlng.lng.toFixed(7)),
        });
      },
    });
    return null;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">ปักหมุดบนแผนที่</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Map Section */}
        <div className="h-[260px] flex items-center justify-center">
          {loading || !picked ? (
            <div className="text-gray-500 text-sm">📍 กำลังดึงตำแหน่งปัจจุบันของคุณ...</div>
          ) : (
            <MapContainer
              key={mapKey}
              center={[picked.lat, picked.lng]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickToSet />
              {icon && (
                <Marker
                  position={[picked.lat, picked.lng]}
                  icon={icon}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const pos = e.target.getLatLng();
                      setPicked({
                        lat: parseFloat(pos.lat.toFixed(7)),
                        lng: parseFloat(pos.lng.toFixed(7)),
                      });
                    },
                  }}
                />
              )}
            </MapContainer>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            lat: <b>{picked?.lat ?? "-"}</b>, lng: <b>{picked?.lng ?? "-"}</b>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => onPick?.(picked)}
              className="px-4 py-2 rounded-md bg-[#7C3AED] text-white hover:bg-[#5c23cf]"
              disabled={!picked}
            >
              ใช้พิกัดนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
