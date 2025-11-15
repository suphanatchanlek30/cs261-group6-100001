// frontend/app/(public)/host/profile/page.jsx
"use client";
import HostProfileView from '@/components/host-dashboard/profile/HostProfileView';

export default function HostProfilePage() {
    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600">จัดการข้อมูลโปรไฟล์ของคุณได้จากหน้านี้.</p>
            <HostProfileView />
        </section>
    );
}
