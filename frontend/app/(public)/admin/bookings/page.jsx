// app/(public)/admin/bookings/page.jsx
export default function AdminBookingsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Manage Booking</h1>
      <p className="text-gray-600">ตรวจสอบ อนุมัติ หรือปฏิเสธคำขอจองจากผู้ใช้ได้ในหน้านี้</p>
      {/* TODO: ตารางรายการจอง + ปุ่มอนุมัติ/ปฏิเสธ + modal แสดงรายละเอียด */}
    </section>
  );
}
