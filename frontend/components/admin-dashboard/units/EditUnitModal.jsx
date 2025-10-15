// components/admin-dashboard/locations/EditUnitModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import ImageUploadInput from "@/components/common/ImageUploadInput";
import { updateUnit } from "@/services/unitService";

/**
 * Modal แก้ไข Unit
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - unit: { id, code, name, imageUrl, shortDesc, capacity, priceHourly, active|isActive }
 *  - onUpdated: (updatedUnit) => void  // แจ้ง parent เพื่อรีเฟรช state
 */
export default function EditUnitModal({ open, onClose, unit, onUpdated }) {
  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
    shortDesc: "",
    capacity: 1,
    priceHourly: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // map ค่าเริ่มต้นเมื่อ modal เปิด
  useEffect(() => {
    if (!open || !unit) return;
    setForm({
      name: unit.name ?? "",
      imageUrl: unit.imageUrl ?? "",
      shortDesc: unit.shortDesc ?? "",
      capacity: unit.capacity ?? 1,
      priceHourly: unit.priceHourly ?? 0,
      isActive: (unit.isActive ?? unit.active) ?? true,
    });
  }, [open, unit]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const setImageUrl = (url) => setForm((p) => ({ ...p, imageUrl: url }));

  // สร้าง patch เฉพาะฟิลด์ที่เปลี่ยนจริง
  const buildPatch = useMemo(() => {
    if (!unit) return () => ({});
    return () => {
      const patch = {};
      const t = (s) => (typeof s === "string" ? s.trim() : s);

      if (t(form.name) !== (unit.name ?? "")) patch.name = t(form.name);
      if (t(form.imageUrl) !== (unit.imageUrl ?? "")) patch.imageUrl = t(form.imageUrl) || null;
      if (t(form.shortDesc) !== (unit.shortDesc ?? "")) patch.shortDesc = t(form.shortDesc) || null;

      const cap = Number(form.capacity);
      const capOrig = Number(unit.capacity ?? 1);
      if (!Number.isNaN(cap) && cap !== capOrig) patch.capacity = cap;

      const price = Number(form.priceHourly);
      const priceOrig = Number(unit.priceHourly ?? 0);
      if (!Number.isNaN(price) && price !== priceOrig) patch.priceHourly = price;

      const act = !!form.isActive;
      const actOrig = !!((unit.isActive ?? unit.active) ?? true);
      if (act !== actOrig) patch.isActive = act;

      return patch;
    };
  }, [form, unit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!unit?.id) return;

    const patch = buildPatch();
    if (Object.keys(patch).length === 0) {
      return Swal.fire("ไม่มีการเปลี่ยนแปลง", "กรุณาแก้ไขข้อมูลอย่างน้อย 1 รายการ", "info");
    }
    // validation เบื้องต้น
    if (patch.capacity !== undefined && patch.capacity < 1) {
      return Swal.fire("ข้อมูลไม่ถูกต้อง", "จำนวนที่นั่งต้องมากกว่า 0", "warning");
    }
    if (patch.priceHourly !== undefined && patch.priceHourly < 0.01) {
      return Swal.fire("ข้อมูลไม่ถูกต้อง", "ราคา/ชั่วโมงต้องมากกว่า 0", "warning");
    }

    setSaving(true);
    const { ok, data, message } = await updateUnit(unit.id, patch);
    setSaving(false);

    if (!ok) {
      return Swal.fire("อัปเดตไม่สำเร็จ", String(message), "error");
    }
    Swal.fire({ icon: "success", title: "บันทึกแล้ว", timer: 1200, showConfirmButton: false });
    // แจ้ง parent ให้อัปเดตรายการ unit ในหน้า detail
    onUpdated?.(data);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
    <div
      className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 my-10
                 flex flex-col max-h-[90vh] overflow-y-auto"
    >
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        onClick={onClose}
      >
        ✕
      </button>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        แก้ไขยูนิต
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* อ่านอย่างเดียว: code */}
        {unit?.code && (
          <Field label="รหัสยูนิต (code)">
            <input
              value={unit.code}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
            />
          </Field>
        )}

        <Field label="ชื่อยูนิต">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="เช่น โต๊ะริมหน้าต่าง"
          />
        </Field>

        <Field label="รายละเอียดสั้น">
          <input
            name="shortDesc"
            value={form.shortDesc}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="ปลั๊กพร้อม โคมไฟ"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="จำนวนที่นั่ง">
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min={1}
            />
          </Field>
          <Field label="ราคา/ชั่วโมง (บาท)">
            <input
              type="number"
              step="any"
              name="priceHourly"
              value={form.priceHourly}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min={0}
            />
          </Field>
        </div>

        {/* รูปภาพ */}
        <ImageUploadInput
          label="รูปภาพยูนิต"
          value={form.imageUrl}
          onChange={setImageUrl}
          uploadFolder="nangnaidee/units"
          rounded="rounded-xl"
          hint="อัปโหลดไฟล์หรือวาง URL ได้"
        />

        {/* ปุ่ม */}
        <div className="flex justify-end gap-3 pt-2 sticky bottom--100 bg-white py-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#7C3AED] text-white rounded-md hover:bg-[#6B21A8] disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
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
