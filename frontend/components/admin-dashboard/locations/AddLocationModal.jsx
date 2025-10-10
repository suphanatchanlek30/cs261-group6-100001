// components/admin-dashboard/locations/AddLocationModal.jsx

"use client";

import { useState } from "react";
import { createLocation } from "@/services/locationService";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";

// โหลด map component เฉพาะฝั่ง client
const SimpleMapPicker = dynamic(() => import("@/components/common/SimpleMapPicker"), {
  ssr: false,
});

export default function AddLocationModal({ show, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    geoLat: "",
    geoLng: "",
    coverImageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      description: form.description,
      address: form.address,
      geoLat: parseFloat(form.geoLat),
      geoLng: parseFloat(form.geoLng),
      coverImageUrl: form.coverImageUrl,
    };

    const res = await createLocation(payload);
    setLoading(false);

    if (res.ok) {
      Swal.fire("สำเร็จ", "เพิ่มสถานที่เรียบร้อยแล้ว!", "success");
      onSuccess?.();
      onClose();
    } else {
      Swal.fire("ผิดพลาด", res.message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Add New Location
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Place Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="2"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Latitude / Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="geoLat"
                value={form.geoLat}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="geoLng"
                value={form.geoLng}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* 🌍 Map Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เลือกตำแหน่งบนแผนที่
            </label>
            <SimpleMapPicker
              initial={
                form.geoLat && form.geoLng
                  ? { lat: parseFloat(form.geoLat), lng: parseFloat(form.geoLng) }
                  : null
              }
              onPick={({ lat, lng }) =>
                setForm((prev) => ({
                  ...prev,
                  geoLat: lat,
                  geoLng: lng,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cover Image URL
            </label>
            <input
              type="text"
              name="coverImageUrl"
              value={form.coverImageUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-md bg-[#7C3AED] text-white hover:bg-[#5c23cf] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
