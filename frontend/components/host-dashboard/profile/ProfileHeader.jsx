// components/host-dashboard/profile/ProfileHeader.jsx
"use client";

export default function ProfileHeader({ fullName, email }) {
  return (
    <div className="rounded-2xl bg-purple-700 p-6 text-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{fullName || 'Unnamed Host'}</h1>
          <p className="text-violet-100 text-sm mt-1">{email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
            Host Dashboard
          </span>
        </div>
      </div>
    </div>
  );
}
