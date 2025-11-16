// frontend/services/adminTransactionService.js
import axios from './axiosInstance';

/**
 * GET /admin/transactions
 * params: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', page, size, payStatus }
 */
export async function getAdminTransactions({ from, to, page = 0, size = 20, payStatus } = {}) {
  try {
    const params = { page, size };
    if (from) params.from = from;
    if (to) params.to = to;
    if (payStatus) params.payStatus = payStatus;

    const resp = await axios.get('/admin/transactions', { params });
    return { ok: true, data: resp.data };
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message || err?.response?.data || err.message || 'โหลดรายการธุรกรรมไม่สำเร็จ';
    return { ok: false, status, message };
  }
}

export default {
  getAdminTransactions,
};
