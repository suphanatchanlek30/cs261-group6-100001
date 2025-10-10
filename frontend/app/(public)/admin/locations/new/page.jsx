// app/(public)/admin/locations/new/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { uploadImage } from "@/services/uploadService";
import { createLocation } from "@/services/locationService";
import { FiUploadCloud, FiMapPin } from "react-icons/fi";
import MapPinModal from "@/components/common/MapPinModal";

export default function NewLocationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    geoLat: "",
    geoLng: "",
    coverImageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [openMap, setOpenMap] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadImage(file, "nangnaidee/locations");
      setForm((prev) => ({ ...prev, coverImageUrl: res.url }));
      setPreview(res.url);
      Swal.fire("อัปโหลดสำเร็จ", "อัปโหลดรูปภาพเรียบร้อยแล้ว", "success");
    } catch (err) {
      Swal.fire("ผิดพลาด", err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      geoLat: form.geoLat === "" ? null : parseFloat(form.geoLat),
      geoLng: form.geoLng === "" ? null : parseFloat(form.geoLng),
    };
    try {
      const res = await createLocation(payload);
      if (res.ok) {
        await Swal.fire("สำเร็จ", "สร้างสถานที่เรียบร้อยแล้ว!", "success");
        router.push("/admin/locations");
      } else {
        Swal.fire("ผิดพลาด", res.message, "error");
      }
    } catch (err) {
      Swal.fire("ผิดพลาด", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ได้ค่าจาก MapModal → อัปเดตฟอร์ม (ปัดทศนิยม 7)
  const handlePickLocation = ({ lat, lng }) => {
    setForm((prev) => ({
      ...prev,
      geoLat: parseFloat(lat.toFixed(7)),
      geoLng: parseFloat(lng.toFixed(7)),
    }));
    setOpenMap(false);
  };

  return (
    <section className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl p-8 mt-6 border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New Location</h1>
      <p className="text-gray-500 mb-6">สร้างสถานที่ใหม่สำหรับระบบ NangNaiDee</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ชื่อ / คำอธิบาย / ที่อยู่ */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Place Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7C3AED]"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>

        {/* พิกัด + ปุ่มปักหมุด */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              name="geoLat"
              step="any"
              value={form.geoLat}
              onChange={handleChange}
              placeholder="ตัวอย่าง: 13.7563310"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              name="geoLng"
              step="any"
              value={form.geoLng}
              onChange={handleChange}
              placeholder="ตัวอย่าง: 100.5017650"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenMap(true)}
          className="inline-flex items-center gap-2 mt-1 text-[#7C3AED] hover:text-[#5c23cf]"
        >
          <FiMapPin /> ปักหมุดบนแผนที่
        </button>

        {/* อัปโหลดรูป */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-48 rounded-md shadow-sm border mb-3"
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-dashed border-[#7C3AED] rounded-lg hover:bg-purple-50 transition">
            <FiUploadCloud className="text-[#7C3AED]" />
            <span className="text-sm text-gray-700">
              {uploading ? "Uploading..." : "Choose file to upload"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
              disabled={uploading}
            />
          </label>
        </div>

        {/* ปุ่ม Save / Cancel */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={() => router.push("/admin/locations")}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-md bg-[#7C3AED] text-white hover:bg-[#5c23cf] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {/* โมดอลปักหมุด (เปิดเมื่อกดปุ่ม) */}
      <MapPinModal
        open={openMap}
        onClose={() => setOpenMap(false)}
        onPick={handlePickLocation}
        initial={
          form.geoLat && form.geoLng
            ? { lat: Number(form.geoLat), lng: Number(form.geoLng) }
            : null
        }
      />
    </section>
  );
}
