// app/(public)/search/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchSection from "@/components/search/SearchSection";
import { getLocations } from "@/services/locationService";
import SearchResultRow from "@/components/search/parts/SearchResultRow";

const ROWS_PER_PAGE = 10;

export default function SearchPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const q = sp.get("q") || "";
  const near = sp.get("near") || "";
  const radiusKm = sp.get("radiusKm") || "";

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(ROWS_PER_PAGE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiParams = useMemo(() => {
    const p = { page, size };
    if (q) p.q = q;
    if (near && radiusKm) {
      p.near = near;
      p.radiusKm = Number(radiusKm);
    }
    return p;
  }, [q, near, radiusKm, page, size]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      const { ok, data, message } = await getLocations(apiParams);
      if (cancelled) return;
      if (!ok) setErr(String(message || "โหลดข้อมูลไม่สำเร็จ"));
      else {
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [apiParams]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  const handleSearch = (payload) => {
    const params = new URLSearchParams();
    if (payload?.keyword?.trim()) params.set("q", payload.keyword.trim());
    if (payload?.nearMe && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = +pos.coords.latitude.toFixed(6);
          const lng = +pos.coords.longitude.toFixed(6);
          params.set("near", `${lat},${lng}`);
          params.set("radiusKm", String(payload.distanceKm || 5));
          router.replace(`/search?${params.toString()}`);
          setPage(0);
        },
        () => {
          router.replace(`/search?${params.toString()}`);
          setPage(0);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      router.replace(`/search?${params.toString()}`);
      setPage(0);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <SearchSection onSearch={handleSearch} />

      <header className="mt-10 mb-6">
        <h1 className="text-[26px] font-extrabold text-[#7C3AED]">All Location</h1>
        <p className="text-[15px] text-neutral-600 mt-1">สถานที่ทั้งหมด</p>
      </header>

      {loading ? (
        <div className="py-16 text-center text-neutral-500">Loading...</div>
      ) : err ? (
        <div className="py-16 text-center text-red-600">{err}</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">No results</div>
      ) : (
        <div className="space-y-5">
          {items.map((it) => (
            <SearchResultRow key={it.id} item={it} />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2 select-none">
          <PageBtn label="«" onClick={() => setPage(0)} disabled={page === 0} />
          <PageBtn label="‹" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} />
          {page > 1 && <PageNumber n={1} active={false} onClick={() => setPage(0)} />}
          {page > 2 && <Dots />}
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter((i) => Math.abs(i - page) <= 1)
            .map((i) => (
              <PageNumber key={i} n={i + 1} active={i === page} onClick={() => setPage(i)} />
            ))}
          {page < totalPages - 3 && <Dots />}
          {page < totalPages - 2 && (
            <PageNumber n={totalPages} active={false} onClick={() => setPage(totalPages - 1)} />
          )}
          <PageBtn
            label="›"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          />
          <PageBtn label="»" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} />
        </div>
      )}
    </div>
  );
}

function PageBtn({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-9 w-9 rounded-[10px] border border-gray-300 bg-white text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
    >
      {label}
    </button>
  );
}
function PageNumber({ n, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "h-9 w-9 rounded-[10px] text-sm font-semibold",
        active
          ? "bg-[#7C3AED] text-white shadow-[0_8px_20px_rgba(124,58,237,.28)]"
          : "bg-white border border-gray-300 hover:bg-gray-50",
      ].join(" ")}
    >
      {n}
    </button>
  );
}
function Dots() {
  return <span className="mx-1 text-gray-500">…</span>;
}
