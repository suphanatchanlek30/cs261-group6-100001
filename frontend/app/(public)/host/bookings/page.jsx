// app/(public)/host/bookings/page.jsx
import HostBookingsView from "@/components/host-dashboard/booking/HostBookingsView";

export default function HostBookingsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
      <p className="text-gray-600">ตรวจสอบการจอง กรองตามสถานะ/สถานที่/ช่วงเวลา และดูรายละเอียด</p>
      <HostBookingsView />
    </section>
  );
}