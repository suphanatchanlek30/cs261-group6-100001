"use client";
import ReviewLocationsPageView from "@/components/admin-dashboard/reviewlocations/ReviewLocationsPageView";

export default function AdminReviewLocationsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Review Location</h1>
        <p className="text-gray-600">ตรวจสอบ อนุมัติ หรือปฏิเสธคำขอสถานที่จาก Host ได้ในหน้านี้</p>
      </div>
      <ReviewLocationsPageView />
    </section>
  );
}
