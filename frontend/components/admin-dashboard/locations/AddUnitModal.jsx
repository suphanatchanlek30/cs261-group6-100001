// components/admin-dashboard/locations/AddUnitModal.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { createUnit } from "@/services/locationService";
import ImageUploadInput from "@/components/common/ImageUploadInput";

const INITIAL_FORM = {
  code: "",
  name: "",
  imageUrl: "",
  shortDesc: "",
  capacity: 1,
  priceHourly: 0,
};

export default function AddUnitModal({ open, onClose, locationId, onAdded }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const codeRef = useRef(null);

  // รีเซ็ตทุกครั้งที่เปิดโมดัล
  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setTimeout(() => codeRef.current?.focus(), 0);
    }
  }, [open]);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setImageUrl = (url) => setForm((p) => ({ ...p, imageUrl: url }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      code: String(form.code).trim(),
      name: String(form.name).trim(),
      shortDesc: String(form.shortDesc).trim(),
      capacity: Math.max(1, parseInt(form.capacity) || 1),
      priceHourly: Math.max(0, parseFloat(form.priceHourly) || 0),
    };

    const { ok, message } = await createUnit(locationId, payload);
    setLoading(false);

    if (ok) {
      Swal.fire("สำเร็จ", "เพิ่มยูนิตเรียบร้อยแล้ว", "success");
      onAdded?.();
      // บันทึกแล้วปิดโมดัล
      onClose?.();
    } else {
      Swal.fire("ผิดพลาด", message || "ไม่สามารถเพิ่มยูนิตได้", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">เพิ่มยูนิตใหม่</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form (scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4 grow">
          <Field label="รหัสยูนิต (code)">
            <input
              ref={codeRef}
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </Field>

          <Field label="ชื่อยูนิต">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </Field>

          <Field label="รายละเอียดสั้น">
            <input
              name="shortDesc"
              value={form.shortDesc}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="จำนวนที่นั่ง">
              <input
                type="number"
                min={1}
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </Field>
            <Field label="ราคา/ชั่วโมง (บาท)">
              <input
                type="number"
                step="any"
                min={0}
                name="priceHourly"
                value={form.priceHourly}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </Field>
          </div>

          <ImageUploadInput
            label="รูปภาพยูนิต"
            value={form.imageUrl}
            onChange={setImageUrl}
            uploadFolder="nangnaidee/units"
            rounded="rounded-xl"
            hint="อัปโหลดไฟล์หรือวาง URL ได้"
          />
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-3 p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            ปิด
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              const formEl = e.currentTarget.closest("div")?.previousElementSibling;
              formEl?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
            }}
            className="px-5 py-2 bg-[#7C3AED] text-white rounded-md hover:bg-[#6B21A8] disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึก & ปิด"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
