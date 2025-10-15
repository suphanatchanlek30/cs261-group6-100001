// services/adminService.js
import axios from "./axiosInstance";

// GET /api/admin/payments?status=&page=&size=
export async function getAdminPayments({ status, page = 0, size = 10 } = {}) {
  try {
    const res = await axios.get("/admin/payments", {
      params: { status, page, size },
      validateStatus: () => true,
    });
    if (res.status === 200) return { ok: true, data: res.data };
    return {
      ok: false,
      message:
        typeof res.data === "string"
          ? res.data
          : res.data?.message || `HTTP ${res.status}`,
      status: res.status,
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.response?.data?.message || err?.message || "โหลดรายการชำระเงินล้มเหลว",
    };
  }
}

// PATCH /api/admin/payments/{paymentId}/review - อนุมัติ/ปฏิเสธการชำระเงิน
export async function updateAdminPaymentStatus(paymentId, action, reason) {
  try {
    // แปลง action เป็น status ตาม API spec
    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    
    const body = { status };
    // เพิ่ม reason ถ้ามี (สำหรับกรณีปฏิเสธ)
    if (reason) {
      body.reason = reason;
    }

    const res = await axios.patch(
      `/admin/payments/${paymentId}/review`,
      body,
      { validateStatus: () => true }
    );

    if (res.status === 200) {
      return { ok: true, data: res.data };
    }

    // จัดการ error cases ต่างๆ ตาม spec
    let errorMessage = "อัปเดตสถานะไม่สำเร็จ";
    
    switch (res.status) {
      case 401:
        errorMessage = "ต้องเข้าสู่ระบบด้วยบัญชีแอดมิน";
        break;
      case 403:
        errorMessage = "ไม่มีสิทธิ์เข้าถึง ต้องเป็นแอดมินเท่านั้น";
        break;
      case 404:
        errorMessage = "ไม่พบรายการชำระเงินนี้ในระบบ";
        break;
      case 409:
        errorMessage = "รายการนี้ถูกทบทวนแล้ว";
        break;
      case 422:
        errorMessage = "ข้อมูลที่ส่งไม่ถูกต้อง";
        break;
      default:
        errorMessage = res.data?.message || `เกิดข้อผิดพลาด HTTP ${res.status}`;
    }

    return {
      ok: false,
      message: errorMessage,
      status: res.status,
    };
  } catch (err) {
    // จัดการ network errors หรือ errors อื่นๆ
    let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
    
    if (err?.response?.status) {
      // มี response กลับมา แต่เกิด error
      switch (err.response.status) {
        case 401:
          errorMessage = "ต้องเข้าสู่ระบบด้วยบัญชีแอดมิน";
          break;
        case 403:
          errorMessage = "ไม่มีสิทธิ์เข้าถึง ต้องเป็นแอดมินเท่านั้น";
          break;
        case 404:
          errorMessage = "ไม่พบรายการชำระเงินนี้ในระบบ";
          break;
        case 409:
          errorMessage = "รายการนี้ถูกทบทวนแล้ว";
          break;
        default:
          errorMessage = err.response.data?.message || `เกิดข้อผิดพลาด HTTP ${err.response.status}`;
      }
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return {
      ok: false,
      message: errorMessage,
    };
  }
}
