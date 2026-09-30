"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AkunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/login?redirect=/akun");
    }
  }, [isHydrated, isLoggedIn, router]);

  // Loading state while auth is hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-warm text-muted-foreground text-sm">
        Memuat...
      </div>
    );
  }

  // Redirect in progress
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-warm text-muted-foreground text-sm">
        Mengalihkan ke halaman login...
      </div>
    );
  }

  return <>{children}</>;
}
