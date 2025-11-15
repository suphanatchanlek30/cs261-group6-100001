"use client";
import { useState, useEffect, useMemo } from "react";
import { getLocations } from "@/services/locationService";

export function useSearchLocations({ q, near, radiusKm, page, size }) {
  const [items, setItems] = useState([]);
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
      if (!ok) setErr(message || "โหลดข้อมูลไม่สำเร็จ");
      else {
        const filtered = (data.items || []).filter((it) => it?.isActive === true);
        setItems(filtered);
        setTotal(filtered.length);
      }
      setLoading(false);
    })();
    return () => (cancelled = true);
  }, [apiParams]);

  return { items, total, loading, err };
}
