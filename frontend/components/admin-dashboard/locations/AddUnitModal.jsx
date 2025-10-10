"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { createUnit } from "@/services/locationService";
import ImageUploadInput from "@/components/common/ImageUploadInput";

export default function AddUnitModal({ open, onClose, locationId, onAdded }) {
    const [form, setForm] = useState({
        code: "",
        name: "",
        imageUrl: "",
        shortDesc: "",
        capacity: 1,
        priceHourly: 0,
    });
    const [loading, setLoading] = useState(false);

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
            capacity: parseInt(form.capacity),
            priceHourly: parseFloat(form.priceHourly),
        };

        const { ok, message } = await createUnit(locationId, payload);
        setLoading(false);

        if (ok) {
            Swal.fire("สำเร็จ", "เพิ่มยูนิตเรียบร้อยแล้ว", "success");
            onAdded?.();
            onClose();
        } else {
            Swal.fire("ผิดพลาด", message || "ไม่สามารถเพิ่มยูนิตได้", "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    เพิ่มยูนิตใหม่
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="รหัสยูนิต (code)">
                        <input
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border-1 border-gray-300 rounded-lg"
                        />
                    </Field>
                    <Field label="ชื่อยูนิต">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border-1 border-gray-300 rounded-lg"
                        />
                    </Field>
                    <Field label="รายละเอียดสั้น">
                        <input
                            name="shortDesc"
                            value={form.shortDesc}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border-1 border-gray-300  rounded-lg"
                        />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="จำนวนที่นั่ง">
                            <input
                                type="number"
                                name="capacity"
                                value={form.capacity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border-1 border-gray-300 rounded-lg"
                            />
                        </Field>
                        <Field label="ราคา/ชั่วโมง (บาท)">
                            <input
                                type="number"
                                step="any"
                                name="priceHourly"
                                value={form.priceHourly}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border-1 border-gray-300 rounded-lg"
                            />
                        </Field>
                    </div>

                    {/* อัปโหลด/URL รูป */}
                    <ImageUploadInput
                        label="รูปภาพยูนิต"
                        value={form.imageUrl}
                        onChange={setImageUrl}
                        uploadFolder="nangnaidee/units"
                        rounded="rounded-xl"
                        hint="อัปโหลดไฟล์หรือวาง URL ได้"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-[#7C3AED] text-white rounded-md hover:bg-[#6B21A8] disabled:opacity-50"
                        >
                            {loading ? "กำลังบันทึก..." : "บันทึก"}
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
