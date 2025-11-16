"use client";
import { useCallback, useEffect, useState } from "react";
import DashboardStatCards from "./DashboardStatCards";
import IncomeReportChartHost from "./IncomeReportChartHost";
import { getHostDashboard } from "../../../services/hostDashboardService";

export default function HostFinancialDashboardView() {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState({ cards: {}, bookingTrend: [], revenueDaily: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const params = (filters.from && filters.to) ? { from: filters.from, to: filters.to } : {};
    const res = await getHostDashboard(params);
    if (res.ok) setData(res.data); else setError(res.message || "โหลดข้อมูลไม่สำเร็จ");
    setLoading(false);
  }, [filters.from, filters.to]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatCards cards={data.cards} loading={loading} />
      <IncomeReportChartHost cards={data.cards} bookingTrend={data.bookingTrend} revenueDaily={data.revenueDaily} loading={loading} />
    </div>
  );
}
