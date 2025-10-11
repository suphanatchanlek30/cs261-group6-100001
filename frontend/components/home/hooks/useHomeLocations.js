// components/home/hooks/useHomeLocations.js
"use client";

import { useEffect, useState } from "react";
import { getLocations } from "@/services/locationService";
import { PROVINCE_PRESETS } from "@/utils/constants/provincePresets";

/** ดึงรายการสถานที่หน้า Home (เลือกจังหวัด → near+radiusKm, ไม่เลือก → ทั่วไป) */
export default function useHomeLocations({ province = null, size = 6 }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        let params;
        if (province && PROVINCE_PRESETS[province]) {
          const { lat, lng, radiusKm } = PROVINCE_PRESETS[province];
          params = { near: `${lat},${lng}`, radiusKm, page: 0, size };
        } else {
          params = { page: 0, size };
        }

        const { ok, data, message } = await getLocations(params);
        if (cancelled) return;

        if (!ok) throw new Error(message || "โหลดข้อมูลไม่สำเร็จ");
        setItems(data.items || []);
        setTotal(Number.isFinite(data.total) ? data.total : (data.items || []).length);
      } catch (e) {
        if (!cancelled) setErr(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [province, size]);

  return { items, total, loading, error };
}
