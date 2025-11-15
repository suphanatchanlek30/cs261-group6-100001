// components/host-dashboard/profile/ProfileSkeleton.jsx
"use client";

export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-24 rounded-2xl bg-violet-200/40" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-40 rounded-xl bg-gray-200" />
        <div className="h-40 rounded-xl bg-gray-200" />
        <div className="h-40 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
