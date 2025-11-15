// app/(public)/host/locations/[id]/edit/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMyLocationDetail, updateDraftLocation } from "@/services/hostlocationService"; // <-- ใช้ API ของ Host
import HostEditLocationForm from "@/components/host-dashboard/location/HostEditLocationForm"; // <-- ใช้ฟอร์มของ Host
import Swal from "sweetalert2";

export default function EditHostLocationPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [loc, setLoc] = useState(null);
    const [error, setError] = useState("");

    // ดึงข้อมูลสถานที่ของ Host
    useEffect(() => {
        (async () => {
            setLoading(true);
            const { ok, data, message } = await getMyLocationDetail(id);
            if (!ok) setError(message || "ไม่พบสถานที่");
            else setLoc(data);
            setLoading(false);
        })();
    }, [id]);

    const handleCancel = () => router.back();

    // บันทึก (Patch)
    const handleSave = async (patch) => {
        const { ok, message } = await updateDraftLocation(id, patch);
        if (!ok) {
            return Swal.fire("อัปเดตไม่สำเร็จ", String(message), "error");
        }
        await Swal.fire("สำเร็จ", "อัปเดตสถานที่เรียบร้อย", "success");
        router.push("/host/locations"); // กลับหน้า List ของ Host
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="max-w-xl mx-auto mt-10 bg-white border border-red-200 text-red-700 rounded-xl p-6">
                <div className="font-semibold mb-2">เกิดข้อผิดพลาด</div>
                <div>{error}</div>
                <div className="mt-4">
                    <button
                        onClick={() => router.push("/host/locations")}
                        className="px-4 py-2 border rounded-md border-gray-200 text-gray-700"
                    >
                        ← กลับ
                    </button>
                </div>
            </div>
        );
    }
    
    // --- ตรวจสอบสถานะก่อนอนุญาตให้แก้ไข ---
    const canEdit = loc?.publishStatus === "DRAFT" || loc?.publishStatus === "REJECTED";
    if (!canEdit) {
         return (
             <div className="max-w-xl mx-auto mt-10 bg-white border border-amber-200 text-amber-700 rounded-xl p-6">
                <div className="font-semibold mb-2">ไม่สามารถแก้ไขได้</div>
                <div>คุณสามารถแก้ไขได้เฉพาะสถานที่ที่มีสถานะ "Draft" หรือ "Rejected" เท่านั้น</div>
                <div className="mt-4">
                    <button
                        onClick={() => router.push("/host/locations")}
                        className="px-4 py-2 border rounded-md border-gray-200 text-gray-700"
                    >
                        ← กลับ
                    </button>
                </div>
            </div>
         );
    }

    // ถ้าผ่านเงื่อนไข (DRAFT หรือ REJECTED)
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fafafa,rgba(250,250,250,0))] py-8">
            <section className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl p-8 mt-2 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-300">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Edit Location</h1>
                        <p className="text-gray-500 text-sm">
                            แก้ไขข้อมูลสถานที่ (ID: {id})
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        ← กลับ
                    </button>
                </div>

                {/* Form */}
                <HostEditLocationForm
                    location={loc}
                    onSuccess={handleSave}
                    onCancel={handleCancel}
                />
            </section>
        </div>
    );
}