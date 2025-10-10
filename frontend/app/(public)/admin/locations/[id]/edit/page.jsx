"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLocationById, updateLocation } from "@/services/locationService";
import EditLocationForm from "@/components/admin-dashboard/locations/EditLocationForm";
import Swal from "sweetalert2";

export default function EditLocationPage() {
    const { id } = useParams(); // /admin/locations/[id]/edit
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [loc, setLoc] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { ok, data, message } = await getLocationById(id);
            if (!ok) setError(message || "ไม่พบสถานที่");
            else setLoc(data);
            setLoading(false);
        })();
    }, [id]);

    const handleCancel = () => router.back();

    const handleSave = async (patch) => {
        const { ok, message } = await updateLocation(id, patch);
        if (!ok) {
            return Swal.fire("อัปเดตไม่สำเร็จ", String(message), "error");
        }
        await Swal.fire("สำเร็จ", "อัปเดตสถานที่เรียบร้อย", "success");
        // กลับหน้าตารางตาม flow ใหม่
        router.push("/admin/locations");
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
                        onClick={() => router.push("/admin/locations")}
                        className="px-4 py-2 border rounded-md border-gray-300"
                    >
                        ← กลับ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fafafa,rgba(250,250,250,0))] py-8">
            <section className="max-w-3xl mx-auto bg-white shadow-sm rounded-xl p-8 mt-2 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Edit Location</h1>
                        <p className="text-gray-500 text-sm">
                            แก้ไขเฉพาะข้อมูลของสถานที่นี้ (ID: {id})
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300  rounded-lg hover:bg-gray-50"
                    >
                        ← กลับ
                    </button>
                </div>

                {/* Form */}
                <EditLocationForm
                    location={loc}
                    onSuccess={handleSave}
                    onCancel={handleCancel}
                />
            </section>
        </div>
    );
}
