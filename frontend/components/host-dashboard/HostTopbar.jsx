// components/host-dashboard/HostTopbar.jsx

"use client";
import { clearToken, isAuthenticated } from "@/utils/authClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HostTopbar() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    const onChange = () => setAuthed(isAuthenticated());
    window.addEventListener("storage", onChange);
    window.addEventListener("auth-changed", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("auth-changed", onChange);
    };
  }, []);

  const onSignOut = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-full px-5 lg:px-8 h-16 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight text-[#495560]">Host Dashboard</div>

        {authed && (
          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-md text-white bg-[#7C3AED] hover:bg-[#6B2FE5] active:scale-[0.99] font-semibold"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
