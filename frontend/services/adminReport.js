// frontend/services/adminReport.js
import axiosInstance from './axiosInstance';

/**
 * GET /admin/reports/usage
 * optional params: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 */
export async function getUsageReport(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const url = '/admin/reports/usage' + (query.toString() ? `?${query.toString()}` : '');
    const resp = await axiosInstance.get(url);
    return { ok: true, data: resp.data };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message || err?.response?.data || err.message || 'โหลดรายงานไม่สำเร็จ';
    return { ok: false, status, message };
  }
}


export async function getMonthlyRevenueReport(params = {}) {
  try {
    const query = new URLSearchParams();

    query.append("type", "monthly");
    query.append("format", "csv");

    if (params.year) query.append("year", params.year);
    const url =
      "/admin/reports/export" + (query.toString() ? `?${query.toString()}` : "");
    const resp = await axiosInstance.get(url);
    return { ok: true, data: resp.data };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "โหลดรายงาน CSV ไม่สำเร็จ";

    return { ok: false, status, message };
  }
}