// app/(public)/my-booking/page.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Swal from "sweetalert2";
import FilterTabs from "@/components/mybooking/FilterTabs";
import BookingCard from "@/components/mybooking/BookingCard";
// ใช้ Pagination แบบเดียวกับหน้า Search
import Pagination from "@/components/search/Pagination";
import EmptyState from "@/components/common/EmptyState";
import {
  getMyBookingsOverview,
  cancelBooking,
  formatRangeLocal,
} from "@/services/bookingService";
import { getLocationReviewsOverview } from "@/services/reviewService";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/authClient";

export default function MyBookingPage() {
  // tab: HOLD | PENDING_REVIEW | CONFIRMED | CANCELLED | EXPIRED | undefined
  const [tab, setTab] = useState();
  const [page, setPage] = useState(0);   // 0-based
  const [size] = useState(10);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({
    items: [],
    page: 0,
    size: 10,
    total: 0,
    totalPages: 1,
  });
  const [reviewStatsMap, setReviewStatsMap] = useState({}); // { [locationId]: { avgRating, totalReviews } }
  const [authed, setAuthed] = useState(null); // null: unknown, true/false after check

  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const { ok, data, message } = await getMyBookingsOverview({
      status: tab,
      page,
      size,
    });
    if (!ok) {
      setErr(message || "โหลดข้อมูลไม่สำเร็จ");
      setLoading(false);
      return;
    }
    setData(data);
    setLoading(false);
  }, [tab, page, size]);

  // Watch auth status and fetch only when authenticated
  useEffect(() => {
    const check = () => setAuthed(isAuthenticated());
    check();
    if (typeof window !== "undefined") {
      window.addEventListener("auth-changed", check);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-changed", check);
      }
    };
  }, []);

  useEffect(() => {
    if (authed === true) {
      load();
    } else if (authed === false) {
      // ensure not showing backend error when unauthenticated
      setLoading(false);
      setErr("");
    }
  }, [authed, load]);

  // เมื่อโหลดรายการแล้ว ดึงสรุปรีวิวของแต่ละสถานที่
  useEffect(() => {
    const items = data?.items || [];
    const ids = Array.from(
      new Set(
        items
          .map((row) => row?.location?.id)
          .filter(Boolean)
      )
    );
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await getLocationReviewsOverview(id, { page: 0, size: 0 });
            if (res.ok) return [id, res.data?.stats || null];
          } catch (_) {}
          return [id, null];
        })
      );
      if (!cancelled) {
        const next = Object.fromEntries(entries);
        setReviewStatsMap((prev) => ({ ...prev, ...next }));
      }
    })();
    return () => { cancelled = true; };
  }, [data]);

  const onTabChange = (next) => {
    setTab(next);
    setPage(0); // เปลี่ยนแท็บแล้วรีเซ็ตหน้า
  };

  const onCancelBooking = async (bookingId) => {
    const ask = await Swal.fire({
      title: "Confirm cancellation?",
      text: "Cancellation cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Close",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!ask.isConfirmed) return;

    const reasonRes = await Swal.fire({
      title: "Reason (optional)",
      input: "text",
      inputPlaceholder: "Change of plan",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Skip",
    });
    const reason = reasonRes.isConfirmed ? reasonRes.value : undefined;

    const { ok, message } = await cancelBooking(bookingId, reason);
    if (!ok) {
      await Swal.fire("Cancel failed", message || "ไม่สามารถยกเลิกได้", "error");
      return;
    }
    await Swal.fire("Cancelled", "", "success");
    load();
  };

  const items = useMemo(() => data?.items ?? [], [data]);

  // คำนวณ totalPages ให้ตรงกับสไตล์ Pagination ของหน้า Search
  const totalPages = useMemo(() => {
    if (typeof data?.totalPages === "number") {
      return Math.max(1, data.totalPages);
    }
    if (typeof data?.total === "number") {
      return Math.max(1, Math.ceil(data.total / size));
    }
    return 1;
  }, [data, size]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-semibold text-violet-600">My booking</h1>
      {authed && <FilterTabs value={tab} onChange={onTabChange} />}

      {authed === false && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-neutral-700">กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดการจองของคุณ</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/login?next=/my-booking`)}
              className="h-10 w-40 rounded-xl bg-violet-600 font-semibold text-white hover:bg-violet-700 transition"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      )}

      {authed && loading && <div className="mt-6">Loading...</div>}
      {authed && err && !loading && <div className="mt-6 text-rose-600">{err}</div>}

      {authed && !loading && !err && items.length === 0 && (
        <EmptyState onGoSearch={() => (window.location.href = "/search")} />
      )}

      {authed && (
      <div className="mt-4 space-y-4">
        {items.map((row, idx) => {
          const b = row.booking || {};
          const u = row.unit || {};
          const l = row.location || {};
          const act = row.actions || {};
          const rev = row.review || {};

          const key = b.id || `row-${page}-${idx}`;
          const rs = reviewStatsMap[l.id] || {};
          const rating = typeof rs.avgRating === "number" ? rs.avgRating : (rev.avgRating ?? null);
          const reviewCount = typeof rs.totalReviews === "number" ? rs.totalReviews : (rev.ratingCount ?? null);
          const { dateText, timeText } = formatRangeLocal(b.startTime, b.endTime);
          const cover = u.imageUrl || l.coverImageUrl || "/placeholder.jpg";
          const unitLabel = u.code ? `${u.code} · ${u.name}` : u.name;

          return (
            <BookingCard
              key={key}
              coverImageUrl={cover}
              status={b.status}
              locationName={l.name}
              unitLabel={unitLabel}
              addressText={l.address}
              rating={rating}
              reviewCount={reviewCount}
              capacity={u.capacity ?? 1}
              quiet={false}
              wifi={!!u.shortDesc?.toLowerCase?.().includes("wifi")}
              dateText={dateText}
              timeText={timeText}
              hours={b.hours ?? 0}
              bookingCode={b.bookingCode ?? ""}
              total={b.total ?? 0}
              canPay={!!act.canPay}
              canCancel={!!act.canCancel}
              canReview={rev.canReview ?? (b.status === "CONFIRMED" && !rev.reviewId)}
              onPay={() => router.push(`/payment/${b.id}`)}
              onCancel={() => onCancelBooking(b.id)}
              onReview={() => router.push(`/bookings/${b.id}/review`)}
              // canReview={!!(rev.canWrite ?? (b.status === "CONFIRMED"))}
              // onReview={() => (window.location.href = `/bookings/${b.id}/review`)}
            />
          );
        })}
      </div>
      )}

      {/* ใช้ Pagination แบบเดียวกับหน้า Search: รับ { page, totalPages, setPage } */}
      {authed && items.length > 0 && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  );
}
