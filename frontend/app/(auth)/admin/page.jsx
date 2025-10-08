// app/(auth)/admin/page.jsx

import React, { Suspense } from "react";
import AdminSection from "@/components/auth/admin/AdminSection";

export default function AdminPage() {
  return (
    <Suspense fallback={<div />}> 
      <AdminSection />
    </Suspense>
  );
}