// services/paymentService.js
import axios from "./axiosInstance";

/** POST /api/payments -> 201 { paymentId, status, amount } */
export async function createPayment({ bookingId, method = "QR" }) {
  try {
    const res = await axios.post("/payments", { bookingId, method });
    if (res.status === 201) return { ok: true, data: res.data };
    return { ok: false, message: res.data?.message || `HTTP ${res.status}` };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err?.message || "สร้างใบชำระเงินล้มเหลว";
    return { ok: false, message: msg };
  }
}

/** POST /api/payments/{paymentId}/proof -> 200 { status } */
export async function attachPaymentProof(paymentId, proofUrl) {
  try {
    const res = await axios.post(`/payments/${paymentId}/proof`, { proofUrl });
    if (res.status === 200) return { ok: true, data: res.data };
    return { ok: false, message: res.data?.message || `HTTP ${res.status}` };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err?.message || "ส่งสลิปล้มเหลว";
    return { ok: false, message: msg };
  }
}
