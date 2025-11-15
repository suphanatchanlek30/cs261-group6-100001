// components/host-dashboard/profile/RolesBadgeList.jsx
"use client";

export default function RolesBadgeList({ roles = [] }) {
  if (!roles || roles.length === 0) {
    return <div className="text-sm text-gray-500">No roles assigned.</div>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((r) => (
        <span
          key={r}
          className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200"
        >
          {r}
        </span>
      ))}
    </div>
  );
}
