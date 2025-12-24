"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { oauthApi } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing authentication...");

  // Get redirect path based on onboarding status
  const getRedirectPath = () => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    return onboardingCompleted === "true" ? "/war-room" : "/onboarding";
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error from OAuth provider
        const error = searchParams.get("error");
        if (error) {
          throw new Error(error);
        }

        const provider = searchParams.get("provider");
        const redirectPath = getRedirectPath();

        // Check for Supabase callback (hash fragment) - Google OAuth
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const supabaseAccessToken = params.get("access_token");
          const supabaseRefreshToken = params.get("refresh_token");

          if (supabaseAccessToken) {
            setMessage("Syncing with server...");
            // Sync user with backend and get tokens
            const response = await oauthApi.supabaseCallback(
              supabaseAccessToken,
              supabaseRefreshToken || undefined,
              "google"
            );

            // Store Supabase tokens (they work with our backend)
            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("refresh_token", response.refresh_token);
            setStatus("success");
            setMessage("Successfully logged in with Google");
            setTimeout(() => router.push(redirectPath), 1500);
            return;
          }
        }

        // Check for direct tokens (from backend redirect - legacy support)
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
          setStatus("success");
          setMessage(`Successfully logged in with ${provider || "OAuth"}`);
          setTimeout(() => router.push(redirectPath), 1500);
          return;
        }

        // Check for LINE callback with user_id (new Supabase-integrated flow)
        const userId = searchParams.get("user_id");
        if (userId && provider === "line") {
          // LINE users are already created in Supabase
          // We need to exchange for tokens via the line/token endpoint
          const code = searchParams.get("code");
          if (code) {
            setMessage("Completing LINE authentication...");
            const response = await oauthApi.lineCallback(code);
            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("refresh_token", response.refresh_token);
            setStatus("success");
            setMessage("Successfully logged in with LINE");
            setTimeout(() => router.push(redirectPath), 1500);
            return;
          }

          // If no code but has user_id, show success and redirect
          setStatus("success");
          setMessage("Successfully logged in with LINE");
          setTimeout(() => router.push(redirectPath), 1500);
          return;
        }

        // Check for LINE authorization code (SPA flow)
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (code) {
          setMessage("Exchanging authorization code...");
          const response = await oauthApi.lineCallback(code, state || undefined);

          localStorage.setItem("access_token", response.access_token);
          localStorage.setItem("refresh_token", response.refresh_token);
          setStatus("success");
          setMessage("Successfully logged in with LINE");
          setTimeout(() => router.push(redirectPath), 1500);
          return;
        }

        // No valid callback parameters
        throw new Error("Invalid callback parameters");
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Authentication failed"
        );
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-accent-cyan mx-auto mb-4" />
            <p className="text-white/60">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-white">{message}</p>
            <p className="text-white/40 text-sm mt-2">
              Redirecting...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-white">{message}</p>
            <p className="text-white/40 text-sm mt-2">
              Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
