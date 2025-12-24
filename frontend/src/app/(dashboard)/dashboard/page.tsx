"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem("onboarding_completed");

    if (onboardingCompleted === "true") {
      // Redirect to War Room (all features consolidated there)
      router.replace("/war-room");
    } else {
      // Redirect to onboarding for new users
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
        <p className="text-white/60">Redirecting...</p>
      </div>
    </div>
  );
}
