// services/uploadService.js
import axios from "./axiosInstance";

/**
 * อัปโหลดรูปไปยัง backend → Cloudinary
 * @param {File} file - ไฟล์รูป
 * @param {string} folder - โฟลเดอร์ใน Cloudinary (optional)
 */
export async function uploadImage(file, folder = "nangnaidee/locations") {
  if (!file) throw new Error("กรุณาเลือกไฟล์");

  // สร้าง FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // เรียก API ผ่าน axios instance (จะมี Authorization Header ให้อัตโนมัติ)
  const res = await axios.post("/uploads/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // { url, publicId }
}
