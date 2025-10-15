// app/(public)/bookings/[bookingId]/review/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";


import ReviewHeader from "@/components/review/ReviewHeader";
import StarRating from "@/components/review/StarRating";

import { getMyBookingOverviewById, formatRangeLocal, formatRangeLocalHotfix } from "@/services/bookingService";
import { createReview } from "@/services/reviewService";

export default function ReviewPage() {
    const { bookingId } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [ov, setOv] = useState(null); // { booking, unit, location, review, actions }

    // form state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { ok, data, message } = await getMyBookingOverviewById(bookingId);
            if (!ok) {
                setErr(message || "โหลดข้อมูลไม่สำเร็จ");
                setLoading(false);
                return;
            }
            setOv(data);
            setLoading(false);
        })();
    }, [bookingId]);

    const b = ov?.booking || {};
    const u = ov?.unit || {};
    const l = ov?.location || {};
    //   const canWrite = ov?.review?.canWrite ?? (b?.status === "CONFIRMED"); // fallback
    const serverFlag = ov?.review?.canReview;
    const alreadyReviewed = !!ov?.review?.reviewId;          // มีรีวิวไปแล้วหรือยัง
    const computedEligible = b?.status === "CONFIRMED" && !alreadyReviewed;
    const canWrite = (serverFlag !== undefined) ? serverFlag : computedEligible;

    // const cover = u?.imageUrl || l?.coverImageUrl || "/placeholder.jpg";
    // Hero ด้านบน = รูปสถานที่
    const locationCover = l?.coverImageUrl || "/placeholder.jpg";

    // รูปเล็กด้านซ้ายของหัวข้อร้าน = รูปยูนิต (ถ้าไม่มีก็ค่อย fallback เป็นรูปสถานที่)
    const unitThumb = u?.imageUrl || l?.coverImageUrl || "/placeholder.jpg";

    const { dateText, timeText } = formatRangeLocalHotfix(b.startTime, b.endTime);

    const handleSubmit = async () => {
        if (rating < 1) {
            Swal.fire("กรุณาให้ดาว", "เลือกระดับคะแนนอย่างน้อย 1 ดาว", "warning");
            return;
        }
        const { ok, data, message, status } = await createReview({
            bookingId,
            rating,
            comment: comment?.trim() || "",
        });
        if (!ok) {
            // ข้อความตามสเปค: 403/409/422/400
            const title =
                status === 403 ? "ไม่มีสิทธิ์" :
                    status === 409 ? "รีวิวซ้ำ" :
                        status === 422 ? "รีวิวไม่ได้" : "ส่งรีวิวไม่สำเร็จ";
            Swal.fire(title, message || "", "error");
            return;
        }
        await Swal.fire("สำเร็จ", data?.message || "รีวิวสำเร็จแล้ว", "success");
        router.replace("/my-booking?tab=CONFIRMED"); // กลับแท็บ Success
    };

    console.log("WIRE start/end:", b.startTime, b.endTime);

    if (loading) return <main className="max-w-6xl mx-auto px-6 py-10">Loading…</main>;
    if (err) return <main className="max-w-6xl mx-auto px-6 py-10 text-rose-600">{err}</main>;
    if (!ov) return null;

    // ถ้าไม่เข้าเงื่อนไขรีวิว
    if (!canWrite) {
        return (
            <main className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold mb-4">Share Your Experience</h1>
                {/* <p className="text-neutral-600">คุณยังไม่เข้าเงื่อนไขสำหรับการรีวิวรายการนี้ (ต้องเป็นการจองสถานะ CONFIRMED และยังไม่เคยรีวิว)</p> */}
                <p className="text-neutral-600">
                    {b?.status !== "CONFIRMED"
                        ? "ยังรีวิวไม่ได้: การจองต้องอยู่ในสถานะ CONFIRMED"
                        : alreadyReviewed
                            ? "รีวิวไปแล้วสำหรับการจองนี้"
                            : "ยังไม่เข้าเงื่อนไขสำหรับการรีวิว"}
                </p>
                <button className="mt-6 rounded-lg border px-4 py-2" onClick={() => router.replace("/my-booking")}>
                    กลับไป My booking
                </button>
            </main>
        );
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-10">
            {/* hero image (optional) */}
            {/* <img src={cover} alt={l?.name} className="w-full h-64 object-cover rounded-2xl shadow" /> */}
            <img src={locationCover} alt={l?.name} className="w-full h-64 object-cover rounded-2xl shadow" />

            <section className="mt-10">
                <h1 className="text-3xl font-extrabold text-gray-900">Share Your Experience</h1>
                <p className="mt-2 text-neutral-700">
                    Thank you for using our service! Please rate and review your experience with the location you booked.
                </p>

                <div className="mt-6">
                    <ReviewHeader
                        // coverImageUrl={cover}
                        unitImageUrl={unitThumb}
                        locationName={l?.name}
                        address={l?.address}
                        dateText={dateText}
                        timeText={timeText}
                        hasWifi={!!u?.shortDesc?.toLowerCase?.().includes("wifi")}
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-gray-900">Rating</h2>
                    <div className="mt-2">
                        <StarRating value={rating} onChange={setRating} size={30} />
                    </div>

                    <div className="mt-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us your experience"
                            rows={4}
                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-violet-500"
                        />
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-neutral-600 hover:text-neutral-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="rounded-lg bg-[#7C3AED] hover:bg-[#A78BFA] px-5 py-2 font-semibold text-white"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
