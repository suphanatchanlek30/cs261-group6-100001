// components/admin-dashboard/locations/EditLocationForm.jsx
"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ImageUploadInput from "@/components/common/ImageUploadInput";
// ใช้ MapPinModal ที่ทำไว้ก่อนหน้า (มี dynamic import ด้านใน component แล้ว)
import MapPinModal from "@/components/common/MapPinModal";

export default function EditLocationForm({ location = {}, onSuccess, onCancel }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        geoLat: "",
        geoLng: "",
        coverImageUrl: "",
        isActive: true,
    });

    // modal เลือกพิกัด
    const [openMap, setOpenMap] = useState(false);
    const [initialPos, setInitialPos] = useState(null); // ค่าเริ่มต้นตอนเปิดแผนที่

    useEffect(() => {
        if (!location) return;
        setForm({
            name: location.name ?? "",
            description: location.description ?? "",
            address: location.address ?? "",
            geoLat: location.geoLat ?? "",
            geoLng: location.geoLng ?? "",
            coverImageUrl: location.coverImageUrl ?? "",
            isActive: location.active ?? true,
        });
    }, [location]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const setImageUrl = (url) => setForm((p) => ({ ...p, coverImageUrl: url }));

    // ====== ปุ่มตำแหน่งปัจจุบัน (ขออนุญาต GPS แล้วตั้งค่า lat/lng) ======
    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            return Swal.fire("อุปกรณ์ไม่รองรับ", "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง", "info");
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(7));
                const lng = Number(pos.coords.longitude.toFixed(7));
                setForm((p) => ({ ...p, geoLat: lat, geoLng: lng }));
                Swal.fire("สำเร็จ", "ตั้งค่าพิกัดจากตำแหน่งปัจจุบันแล้ว", "success");
            },
            (err) => {
                Swal.fire("ไม่สามารถระบุตำแหน่ง", err.message || "โปรดอนุญาตการเข้าถึงตำแหน่ง", "warning");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ====== ปุ่มเปิดแผนที่เพื่อปักหมุด ======
    const openMapPicker = () => {
        // ตั้งต้นจากค่าปัจจุบัน ถ้าไม่มีให้ลองถาม GPS
        if (form.geoLat && form.geoLng) {
            setInitialPos({ lat: Number(form.geoLat), lng: Number(form.geoLng) });
            setOpenMap(true);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setInitialPos({
                        lat: Number(pos.coords.latitude.toFixed(7)),
                        lng: Number(pos.coords.longitude.toFixed(7)),
                    });
                    setOpenMap(true);
                },
                () => {
                    // fallback: BKK
                    setInitialPos({ lat: 13.7563, lng: 100.5018 });
                    setOpenMap(true);
                }
            );
        } else {
            setInitialPos({ lat: 13.7563, lng: 100.5018 });
            setOpenMap(true);
        }
    };

    // รับค่าจากโมดอลแผนที่
    const handlePick = ({ lat, lng }) => {
        setForm((p) => ({ ...p, geoLat: lat, geoLng: lng }));
        setOpenMap(false);
    };

    // ====== สร้าง patch เฉพาะฟิลด์ที่เปลี่ยนจริง ======
    const buildPatch = () => {
        const patch = {};
        const t = (s) => (typeof s === "string" ? s.trim() : s);

        if (t(form.name) !== (location.name ?? "")) patch.name = t(form.name);
        if (t(form.description) !== (location.description ?? "")) patch.description = t(form.description) || null;
        if (t(form.address) !== (location.address ?? "")) patch.address = t(form.address);

        const latForm = form.geoLat === "" ? null : Number(form.geoLat);
        const lngForm = form.geoLng === "" ? null : Number(form.geoLng);
        const latOrig = location.geoLat ?? null;
        const lngOrig = location.geoLng ?? null;
        if (latForm !== latOrig) patch.geoLat = latForm;
        if (lngForm !== lngOrig) patch.geoLng = lngForm;

        if (t(form.coverImageUrl) !== (location.coverImageUrl ?? "")) {
            patch.coverImageUrl = t(form.coverImageUrl) || null;
        }

        const isActiveForm = !!form.isActive;
        const isActiveOrig = !!(location.active ?? true);
        if (isActiveForm !== isActiveOrig) patch.isActive = isActiveForm;

        return patch;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const patch = buildPatch();

        if (Object.keys(patch).length === 0) {
            Swal.fire("ไม่มีการเปลี่ยนแปลง", "กรุณาแก้ไขข้อมูลอย่างน้อย 1 รายการ", "info");
            return;
        }
        if (patch.geoLat !== undefined && patch.geoLat !== null && Number.isNaN(patch.geoLat)) {
            Swal.fire("ข้อมูลไม่ถูกต้อง", "Latitude ต้องเป็นตัวเลข", "warning");
            return;
        }
        if (patch.geoLng !== undefined && patch.geoLng !== null && Number.isNaN(patch.geoLng)) {
            Swal.fire("ข้อมูลไม่ถูกต้อง", "Longitude ต้องเป็นตัวเลข", "warning");
            return;
        }

        await onSuccess?.(patch);
    };

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-6 text-gray-600">
                {/* กลุ่ม 1: ข้อมูลพื้นฐาน */}
                <Group title="Basic Info" desc="ข้อมูลพื้นฐานของสถานที่">
                    <Field label="Place Name *">
                        <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400 bg-white text-gray-700"
                            placeholder="เช่น NangNaiDee Central Rama 9"
                        />
                    </Field>

                    <Field label="Description">
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400 bg-white text-gray-700"
                            placeholder="คำอธิบายสั้น ๆ"
                        />
                    </Field>

                    <Field label="Address *">
                        <input
                            name="address"
                            value={form.address}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400 bg-white text-gray-700"
                            placeholder="บ้านเลขที่ / ถนน / แขวง เขต / จังหวัด"
                        />
                    </Field>
                </Group>

                {/* กลุ่ม 2: พิกัด + ปุ่ม GPS / Map */}
                <Group title="Location" desc="เลือกจาก GPS หรือปักหมุดบนแผนที่">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Latitude">
                                <input
                                    name="geoLat"
                                    type="number"
                                    step="any"
                                    value={form.geoLat}
                                    onChange={onChange}
                                    placeholder="13.7563310"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400 bg-white text-gray-700"
                                />
                            </Field>
                            <Field label="Longitude">
                                <input
                                    name="geoLng"
                                    type="number"
                                    step="any"
                                    value={form.geoLng}
                                    onChange={onChange}
                                    placeholder="100.5017650"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400 bg-white text-gray-700"
                                />
                            </Field>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={useCurrentLocation}
                                className="whitespace-nowrap px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                title="ใช้ตำแหน่งปัจจุบัน"
                            >
                                ใช้ตำแหน่งปัจจุบัน
                            </button>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={openMapPicker}
                                className="whitespace-nowrap px-4 py-2 rounded-lg bg-[#7C3AED] text-white hover:bg-[#5c23cf]"
                                title="ปักหมุดบนแผนที่"
                            >
                                ปักหมุดบนแผนที่
                            </button>
                        </div>
                    </div>
                </Group>

                {/* กลุ่ม 3: รูปปก */}
                <Group title="Cover Image" desc="อัปโหลดไฟล์หรือวาง URL">
                    <ImageUploadInput
                        label=""
                        value={form.coverImageUrl}
                        onChange={setImageUrl}
                        uploadFolder="nangnaidee/locations"
                        rounded="rounded-xl"
                        hint="อัปโหลดไฟล์หรือวางลิงก์รูปภาพได้"
                    />
                </Group>

                {/* กลุ่ม 4: สถานะ */}
                <Group title="Status">
                    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                        <input
                            id="isActive"
                            type="checkbox"
                            name="isActive"
                            checked={!!form.isActive}
                            onChange={onChange}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-200"
                        />
                        <span className="text-sm text-gray-600">Active</span>
                    </label>
                </Group>

                {/* ปุ่มบันทึก/ยกเลิก */}
                <div className="sticky bottom-0 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-100 pt-3 -mx-8 px-8 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-600">
                        Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 rounded-md bg-purple-600/90 text-white hover:bg-purple-600">
                        Save
                    </button>
                </div>
            </form>

            {/* โมดอลปักหมุด */}
            <MapPinModal
                open={openMap}
                onClose={() => setOpenMap(false)}
                onPick={handlePick}
                initial={initialPos}
            />
        </>
    );
}

/* ---------- Sub components ---------- */
function Group({ title, desc, children }) {
    return (
        <section className="p-4 rounded-xl border border-gray-100 bg-white">
            <header className="mb-3">
                <h3 className="font-medium text-gray-700">{title}</h3>
                {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
            </header>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Field({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm text-gray-600">{label}</label>
            {children}
        </div>
    );
}
