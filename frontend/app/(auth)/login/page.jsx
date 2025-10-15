// app/(auth)/login/page.jsx

import React, { Suspense } from "react";
import LoginSection from "@/components/auth/login/LoginSection";

export default function LoginPage() {
    return (
        <Suspense fallback={<div />}>
            <LoginSection />
        </Suspense>
    );
}