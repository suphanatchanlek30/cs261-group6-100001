// utils/locationHelper.js

/**
 * ขออนุญาตเข้าถึงพิกัดจาก browser แล้วคืนค่า { lat, lng }
 * - รองรับการตัดทศนิยม 7 หลัก
 * - โยน error หากผู้ใช้ปฏิเสธหรืออุปกรณ์ไม่รองรับ
 */
export async function getCurrentLocation() {
  if (!navigator.geolocation) {
    throw new Error("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง (Geolocation)");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(7));
        const lng = parseFloat(pos.coords.longitude.toFixed(7));
        resolve({ lat, lng });
      },
      (err) => {
        switch (err.code) {
          case 1:
            reject(new Error("ผู้ใช้ไม่อนุญาตให้เข้าถึงตำแหน่ง"));
            break;
          case 2:
            reject(new Error("ไม่สามารถระบุตำแหน่งได้"));
            break;
          case 3:
            reject(new Error("หมดเวลารอการตอบกลับจากอุปกรณ์"));
            break;
          default:
            reject(new Error("เกิดข้อผิดพลาดในการระบุตำแหน่ง"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
