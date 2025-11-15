// app/payment/[bookingId]/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FiMapPin, FiMap } from "react-icons/fi";

import PaymentSummaryCard from "@/components/payment/PaymentSummaryCard";
import PaymentQRSection from "@/components/payment/PaymentQRSection";

import { getMyBookingOverviewById, formatRangeLocal, formatRangeLocalHotfix } from "@/services/bookingService";
import { getLocationReviewsOverview } from "@/services/reviewService";
import { createPayment, attachPaymentProof } from "@/services/paymentService";
import { uploadImage } from "@/services/uploadService";

export default function PaymentPage() {
    const { bookingId } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [overview, setOverview] = useState(null); // { booking, unit, location, payment, review, actions }
    const [reviewStats, setReviewStats] = useState(null); // { avgRating, totalReviews }
    const [showQR, setShowQR] = useState(false);

    // สลิป
    const [slipUrl, setSlipUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // โหลด overview
    useEffect(() => {
        (async () => {
            if (!bookingId) return;
            setLoading(true);
            const { ok, data, message } = await getMyBookingOverviewById(bookingId);
            if (!ok) {
                setErr(message || "โหลดรายละเอียดไม่สำเร็จ");
                setLoading(false);
                return;
            }
            setOverview(data);
            // ดึงสรุปรีวิวของสถานที่เพื่อแสดงคะแนน/จำนวนรีวิว
            if (data?.location?.id) {
                const ov = await getLocationReviewsOverview(data.location.id);
                if (ov.ok) setReviewStats(ov.data?.stats || null);
            }
            setLoading(false);
        })();
    }, [bookingId]);

    // helper extract
    const b = overview?.booking || {};
    const u = overview?.unit || {};
    const l = overview?.location || {};
    const pay = overview?.payment || {};
    const actions = overview?.actions || {};
    const rev = overview?.review || {};

    const cover = u?.imageUrl || l?.coverImageUrl || "/placeholder.jpg";
    const unitLabel = u?.code ? `${u.code} · ${u.name}` : u?.name;
    const { dateText, timeText } = formatRangeLocalHotfix(b.startTime, b.endTime);

    // กดสร้าง QR -> POST /api/payments
    const handleCreateQR = async () => {
        if (!bookingId) return;
        const { ok, data, message } = await createPayment({ bookingId, method: "QR" });
        if (!ok) {
            Swal.fire("Create payment failed", message || "", "error");
            return;
        }
        // อัปเดตสถานะ payment/สิทธิ์อัปโหลดใน state ให้พร้อมโชว์ QR + upload slip
        setOverview((prev) => ({
            ...prev,
            payment: { id: data.paymentId, status: data.status, proofUrl: null, amount: data.amount },
            actions: { ...(prev?.actions || {}), canUploadSlip: true, canPay: false },
        }));
        setShowQR(true);
        Swal.fire("Created", "Payment has been created. Scan the QR to pay.", "success");
    };

    // เลือกไฟล์ -> อัปโหลดไป BE -> ได้ Cloudinary URL
    const handlePickFile = async (file) => {
        if (!file) return;
        try {
            setUploading(true);
            const res = await uploadImage(file, "nangnaidee/payments");
            setSlipUrl(res.url);
        } catch (e) {
            Swal.fire("Upload failed", e.message, "error");
        } finally {
            setUploading(false);
        }
    };

    // ส่งสลิป -> POST /api/payments/{paymentId}/proof -> success -> ไป My Booking
    const handleSendSlip = async () => {
        if (!pay?.id) {
            Swal.fire("No payment", "Please create a payment first.", "warning");
            return;
        }
        if (!slipUrl) {
            Swal.fire("No slip uploaded!", "Please upload your payment slip before sending.", "warning");
            return;
        }
        const ask = await Swal.fire({
            icon: "question",
            title: "Confirm to send the slip?",
            text: "We will verify your payment.",
            showCancelButton: true,
            confirmButtonText: "Send",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#22C55E",
        });
        if (!ask.isConfirmed) return;

        const { ok, data, message } = await attachPaymentProof(pay.id, slipUrl);
        if (!ok) {
            Swal.fire("Submit failed", message || "ไม่สามารถส่งสลิปได้", "error");
            return;
        }
        await Swal.fire({
            icon: "success",
            title: "We have received your slip.",
            text: "Please wait for approval from the admin.",
            confirmButtonText: "Go to My Booking",
            confirmButtonColor: "#22C55E",
        });
        router.replace("/my-booking");
    };

    if (loading) return <main className="max-w-6xl mx-auto px-6 py-10">Loading…</main>;
    if (err) return <main className="max-w-6xl mx-auto px-6 py-10 text-rose-600">{err}</main>;
    if (!overview) return null;

    return (
        <main className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-[26px] font-extrabold text-[#7C3AED] mb-6">Payment</h1>

            {/* แถวหัวเรื่องเหนือการ์ด (ตัวอย่าง label “WAIT FOR PAYMENT”) */}
            <div className="mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-[22px] sm:text-[24px] font-extrabold text-gray-900">
                        {l?.name}
                    </h2>

                    {/* ป้าย WAIT FOR PAYMENT (แสดงเมื่อยังต้องชำระ/อัปสลิป) */}
                    {(actions?.canPay || actions?.canUploadSlip) && (
                        <span className="inline-flex items-center rounded-full bg-[#E1C9FF] px-3 py-1 text-[12px] font-bold tracking-wider text-gray-900">
                            WAIT FOR PAYMENT
                        </span>
                    )}
                </div>

                {/* บรรทัดที่อยู่ + ไอคอน */}
                <div className="mt-2 flex items-center gap-2 text-[15px] text-neutral-600">
                    <FiMapPin className="shrink-0" />
                    <span>{l?.address}</span>
                    {/* ไอคอนแผนที่ด้านขวา (ตกแต่ง/เผื่อคลิกลิงก์แผนที่ภายหลัง) */}
                    <FiMap className="shrink-0 ml-2 text-gray-800" />
                </div>
                {/* ถ้ามี label สถานะรวมทั้งหน้า สามารถแสดงเพิ่มตรงนี้ได้ */}
            </div>

            <PaymentSummaryCard
                coverImageUrl={cover}
                status={b?.status}
                locationName={l?.name}
                unitLabel={unitLabel}
                address={l?.address}
                capacity={u?.capacity}
                quiet={false}
                wifi={!!u?.shortDesc?.toLowerCase?.().includes("wifi")}
                dateText={dateText}
                timeText={timeText + (b?.hours ? ` (${b.hours} ${b.hours > 1 ? "hours" : "hour"})` : "")}
                total={b?.total}
                rating={reviewStats?.avgRating ?? null}
                reviewCount={reviewStats?.totalReviews ?? null}
                bookingCode={b?.bookingCode ?? null}
                canPay={!!actions?.canPay}
                onCreateQR={handleCreateQR}
            />

            <PaymentQRSection
                show={showQR || !!pay?.id}
                amount={pay?.amount ?? b?.total}
                qrImageUrl={"https://res.cloudinary.com/dqo72maxa/image/upload/v1760012825/Frame_637_vkzcyl.png"}
                slipUrl={slipUrl}
                uploading={uploading}
                canUploadSlip={!!actions?.canUploadSlip}
                onPickFile={handlePickFile}
                onSendSlip={handleSendSlip}
            />
        </main>
    );
}
