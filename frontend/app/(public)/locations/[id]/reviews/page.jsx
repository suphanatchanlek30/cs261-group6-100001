// app/(public)/locations/[id]/reviews/page.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLocationById } from "@/services/locationService";
import { getLocationReviews } from "@/services/reviewService";
import StarRating from "@/components/common/StarRating";
import Pagination from "@/components/common/Pagination";

const PAGE_SIZE = 10;

export default function LocationReviewsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [location, setLocation] = useState(null);
  const [allItems, setAllItems] = useState([]); // เก็บ "ทั้งหมด" แล้วค่อยกรอง/เรียงใน client

  // UI states
  const [page, setPage] = useState(0);
  const [minRating, setMinRating] = useState(0); // number
  const [sort, setSort] = useState("newest"); // newest | highest | lowest

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErr("");

    // 1) หัวข้อ location
    const locRes = await getLocationById(id);
    if (!locRes.ok) {
      setErr(locRes.message || "Load location failed");
      setLoading(false);
      return;
    }
    setLocation(locRes.data);

    // 2) โหลดรีวิว "ทั้งหมด" (loop ทีละ page จาก API จนหมด)
    //    ถ้า API ของคุณรองรับ size ใหญ่ก็เปลี่ยนเป็น size: 1000 ได้
    let acc = [];
    let curPage = 0;
    let totalPages = 1;

    while (curPage < totalPages) {
      const res = await getLocationReviews(id, {
        page: curPage,
        size: 50, // ปรับได้ตามประสิทธิภาพ
      });

      if (!res.ok) {
        setErr(res.message || "Load reviews failed");
        setLoading(false);
        return;
      }

      const data = res.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      acc = acc.concat(items);

      // รองรับทั้งแบบส่ง totalPages มา หรือส่ง total/size มา
      if (typeof data.totalPages === "number") {
        totalPages = Math.max(1, data.totalPages);
      } else {
        const total = typeof data.total === "number" ? data.total : acc.length;
        totalPages = Math.max(1, Math.ceil(total / 50));
      }

      curPage += 1;
      // กันลูปค้างเผื่อ API ไม่ส่งจำนวนหน้ามา
      if (curPage > 500) break;
    }

    setAllItems(acc);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // กรอง + เรียง ใน client
  const filteredSorted = useMemo(() => {
    let list = Array.isArray(allItems) ? [...allItems] : [];

    // กรองคะแนนขั้นต่ำ
    if (minRating > 0) {
      list = list.filter((x) => (Number(x.rating) || 0) >= Number(minRating));
    }

    // เรียง
    if (sort === "highest") {
      list.sort((a, b) => {
        const r = (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (r !== 0) return r;
        // เท่ากันให้ใหม่กว่ามาก่อน
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    } else if (sort === "lowest") {
      list.sort((a, b) => {
        const r = (Number(a.rating) || 0) - (Number(b.rating) || 0);
        if (r !== 0) return r;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    } else {
      // newest
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return list;
  }, [allItems, minRating, sort]);

  // แบ่งหน้าใน client
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, page]);

  // ถ้าเปลี่ยน filter/sort ให้เด้งกลับหน้า 1
  useEffect(() => {
    setPage(0);
  }, [minRating, sort]);

  const title = useMemo(
    () => (location?.name ? `${location.name} — Reviews` : "Reviews"),
    [location?.name]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img
          src={location?.coverImageUrl || "/placeholder.jpg"}
          alt={location?.name || "location"}
          className="h-40 w-full sm:h-28 sm:w-48 rounded-xl object-cover shadow"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-neutral-900">{title}</h1>
          {location?.address && (
            <p className="mt-1 text-sm text-neutral-600">{location.address}</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-700">Minimum rating</label>
          <select
            value={String(minRating)}
            onChange={(e) => setMinRating(parseInt(e.target.value, 10))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="0">All</option>
            <option value="5">5 ★</option>
            <option value="4">4 ★+</option>
            <option value="3">3 ★+</option>
            <option value="2">2 ★+</option>
            <option value="1">1 ★+</option>
          </select>

          <label className="ml-2 text-sm text-neutral-700">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest rating</option>
            <option value="lowest">Lowest rating</option>
          </select>
        </div>

        <button
          onClick={() => router.back()}
          className="self-start sm:self-auto rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <section className="mt-5">
        {loading ? (
          <ReviewsSkeleton />
        ) : err ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {err}
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyReviews />
        ) : (
          <ul className="space-y-3">
            {pageItems.map((rv) => (
              <li key={rv.id}>
                <ReviewCard review={rv} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination (client-side) */}
      {!loading && filteredSorted.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </main>
  );
}

/* ---------------- Components ---------------- */

function ReviewCard({ review }) {
  const name =
    [review.userFirstName, review.userLastName].filter(Boolean).join(" ") ||
    "Anonymous";
  const initial = (review.userFirstName || name || "U").charAt(0).toUpperCase();

  const dateText = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-neutral-900">{name}</span>
            <StarRating value={Number(review.rating) || 0} size={14} />
            {dateText && (
              <span className="text-xs text-neutral-500">{dateText}</span>
            )}
          </div>
          {review.comment && (
            <p className="mt-1 text-sm text-neutral-700 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <ul className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <li key={i} className="animate-pulse">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyReviews() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <p className="text-sm text-neutral-600">No reviews match your filters.</p>
    </div>
  );
}
