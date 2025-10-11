// components/home/provincePresets.js

// จุดศูนย์กลาง + รัศมีโดยประมาณ (กม.) สำหรับการเรียก API แบบ near+radiusKm
export const PROVINCE_PRESETS = {
  Bangkok: { lat: 13.7563, lng: 100.5018, radiusKm: 35 },
  Nonthaburi: { lat: 13.8621, lng: 100.5140, radiusKm: 25 },
  "Pathum Thani": { lat: 14.0217, lng: 100.5250, radiusKm: 28 },
};

// ลิสต์ชื่อไว้ใช้วาดปุ่มเรียงตามภาพ
export const POPULAR_LOCATIONS = ["Bangkok", "Nonthaburi", "Pathum Thani"];
