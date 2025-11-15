// components/host-dashboard/profile/HostProfileView.jsx
"use client";
import { useEffect, useState } from 'react';
import { getHostProfile } from '@/services/hostProfileService';
import ProfileHeader from '@/components/host-dashboard/profile/ProfileHeader';
import ProfileDetailsCard from '@/components/host-dashboard/profile/ProfileDetailsCard';
import RolesBadgeList from '@/components/host-dashboard/profile/RolesBadgeList';
import OnboardingTips from '@/components/host-dashboard/profile/OnboardingTips';
import ProfileSkeleton from '@/components/host-dashboard/profile/ProfileSkeleton';

export default function HostProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const { ok, data, status, message } = await getHostProfile();
    if (!ok) {
      if (status === 401) setError('กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ Host');
      else if (status === 403) setError('คุณไม่มีสิทธิ์เข้าถึงหน้าโปรไฟล์ Host');
      else setError(message || 'โหลดโปรไฟล์ไม่สำเร็จ');
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-6 md:py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 space-y-3">
          <h2 className="text-lg font-semibold">เกิดข้อผิดพลาด</h2>
          <p className="text-sm leading-relaxed">{error}</p>
          <button
            onClick={load}
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700"
          >ลองใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 md:py-10">
      <ProfileHeader fullName={profile.fullName} email={profile.email} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ProfileDetailsCard profile={profile} />
          <OnboardingTips profile={profile} />
        </div>
        <aside className="space-y-6">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-violet-800 mb-3">Roles</h2>
            <RolesBadgeList roles={profile.roles} />
          </div>
        </aside>
      </div>
    </div>
  );
}
