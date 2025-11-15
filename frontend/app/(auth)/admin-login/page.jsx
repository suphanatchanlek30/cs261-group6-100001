// app/(auth)/admin-login/page.jsx

import React, { Suspense } from "react";
import AdminSection from "@/components/auth/admin/AdminSection";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div />}>
      <AdminSection />
    </Suspense>
  );
}