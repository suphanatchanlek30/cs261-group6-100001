// services/adminFinanceReportService.js
import axios from "./axiosInstance";

/**
 * GET /api/admin/reports/finance/summary
 * query: { groupBy, from, to }
 */
export async function fetchFinanceSummary({
  groupBy = "month",
  from = "2025-01-01",
  to,
} = {}) {
  try {
    const finalTo = to || (from ? from.substring(0, 4) + "-12-31" : undefined);

    const res = await axios.get("/admin/reports/finance/summary", {
      params: { groupBy, from, to: finalTo },
    });

    return { ok: true, data: res.data };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "ไม่สามารถดึงรายงานการเงินได้";

    return { ok: false, status, message };
  }
}


/**
 * GET /api/admin/reports/finance/dashboard
 * query: { view }
 * ใช้ตอนกดปุ่ม year (view=year)
 */
export async function fetchFinanceDashboard({ view = "year" } = {}) {
  try {
    const res = await axios.get("/admin/reports/finance/dashboard", {
      params: { view },
    });

    return { ok: true, data: res.data };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "ไม่สามารถดึงแดชบอร์ดการเงินได้";

    return { ok: false, status, message };
  }
}