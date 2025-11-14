// components/host-dashboard/location/HostEditLocationForm.jsx
"use client";

// 1. เพิ่ม 'useMemo' เข้าไปใน import
import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import ImageUploadInput from "@/components/common/ImageUploadInput";
import MapPinModal from "@/components/common/MapPinModal"; 

export default function HostEditLocationForm({ location = {}, onSuccess, onCancel }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        geoLat: "",
        geoLng: "",
        coverImageUrl: "",
    });

    const [openMap, setOpenMap] = useState(false);
    const [initialPos, setInitialPos] = useState(null); 

    useEffect(() => {
        if (!location) return;
        setForm({
            name: location.name ?? "",
            description: location.description ?? "",
            address: location.address ?? "",
            geoLat: location.geoLat ?? "",
            geoLng: location.geoLng ?? "",
            coverImageUrl: location.coverImageUrl ?? "",
        });
    }, [location]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const setImageUrl = (url) => setForm((p) => ({ ...p, coverImageUrl: url }));

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

    const openMapPicker = () => {
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
                    setInitialPos({ lat: 13.7563, lng: 100.5018 }); // Fallback BKK
                    setOpenMap(true);
                }
            );
        } else {
            setInitialPos({ lat: 13.7563, lng: 100.5018 }); // Fallback BKK
            setOpenMap(true);
        }
    };

    const handlePick = ({ lat, lng }) => {
        setForm((p) => ({ ...p, geoLat: lat, geoLng: lng }));
        setOpenMap(false);
    };

    // 2. แก้ไข: useMemo จะ 'คืนค่า' เป็นฟังก์ชัน buildPatch
    const buildPatch = useMemo(() => {
      // ฟังก์ชันนี้จะถูกสร้างใหม่ 'เฉพาะเมื่อ' form หรือ location เปลี่ยน
      return () => {
        const patch = {};
        const t = (s) => (typeof s === "string" ? s.trim() : s);
        
        const orig = {
            name: location.name ?? "",
            description: location.description ?? "",
            address: location.address ?? "",
            geoLat: location.geoLat ?? null,
            geoLng: location.geoLng ?? null,
            coverImageUrl: location.coverImageUrl ?? ""
        };

        if (t(form.name) !== orig.name) patch.name = t(form.name);
        if (t(form.description) !== orig.description) patch.description = t(form.description) || null;
        if (t(form.address) !== orig.address) patch.address = t(form.address);

        const latForm = form.geoLat === "" ? null : Number(form.geoLat);
        const lngForm = form.geoLng === "" ? null : Number(form.geoLng);
        if (latForm !== orig.geoLat) patch.geoLat = latForm;
        if (lngForm !== orig.geoLng) patch.geoLng = lngForm;

        if (t(form.coverImageUrl) !== orig.coverImageUrl) {
            patch.coverImageUrl = t(form.coverImageUrl) || null;
        }

        return patch;
      };
    }, [form, location]); // <--- Dependency ที่ถูกต้อง

    const onSubmit = async (e) => {
        e.preventDefault();
        // 3. เรียกใช้ฟังก์ชัน buildPatch() เพื่อเอา object
        const patch = buildPatch(); 

        if (Object.keys(patch).length === 0) {
            Swal.fire("ไม่มีการเปลี่ยนแปลง", "กรุณาแก้ไขข้อมูลอย่างน้อย 1 รายการ", "info");
            return;
        }
        
        await onSuccess?.(patch);
    };

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-6 text-gray-600">
                <Group title="Basic Info" desc="ข้อมูลพื้นฐานของสถานที่">
                    <Field label="Place Name *">
                        <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </Field>
                    <Field label="Description">
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </Field>
                    <Field label="Address *">
                        <input
                            name="address"
                            value={form.address}
                            onChange={onChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </Field>
                </Group>

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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </Field>
                            <Field label="Longitude">
                                <input
                                    name="geoLng"
                                    type="number"
                                    step="any"
                                    value={form.geoLng}
                                    onChange={onChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </Field>
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={useCurrentLocation} className="whitespace-nowrap px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                ใช้ตำแหน่งปัจจุบัน
                            </button>
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={openMapPicker} className="whitespace-nowrap px-4 py-2 rounded-lg bg-[#7C3AED] text-white hover:bg-[#5c23cf]">
                                ปักหมุดบนแผนที่
                            </button>
                        </div>
                    </div>
                </Group>

                <Group title="Cover Image" desc="อัปโหลดไฟล์หรือวาง URL">
                    <ImageUploadInput
                        label=""
                        value={form.coverImageUrl}
                        onChange={setImageUrl}
                        uploadFolder="nangnaidee/locations"
                        rounded="rounded-xl"
                    />
                </Group>

                {/* Status control removed: isActive can only be toggled on Approved in detail page */}

                <div className="sticky bottom-0 bg-white/70 backdrop-blur border-t border-gray-100 pt-3 -mx-8 px-8 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-600">
                        Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 rounded-md bg-[#7C3AED] text-white hover:bg-[#6B21A8]">
                        Save
                    </button>
                </div>
            </form>

            <MapPinModal
                open={openMap}
                onClose={() => setOpenMap(false)}
                onPick={handlePick}
                initial={initialPos}
            />
        </>
    );
}

// Sub components
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