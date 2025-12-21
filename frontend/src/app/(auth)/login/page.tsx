"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Brain, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { authApi, oauthApi } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data.email, data.password);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading("google");
    setError(null);
    try {
      const response = await oauthApi.getGoogleAuthUrl();
      window.location.href = response.auth_url;
    } catch (err) {
      setError("Failed to initiate Google login. Please try again.");
      console.error("Google login failed:", err);
      setSocialLoading(null);
    }
  };

  const handleLineLogin = async () => {
    setSocialLoading("line");
    setError(null);
    try {
      const response = await oauthApi.getLineAuthUrl();
      window.location.href = response.auth_url;
    } catch (err) {
      setError("Failed to initiate LINE login. Please try again.");
      console.error("LINE login failed:", err);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* 左側裝飾區塊 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-cyan/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-indigo/20 rounded-full blur-[120px]" />

        {/* 內容 */}
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">STS</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Welcome to Your
            <br />
            <span className="text-gradient">AI Command Center</span>
          </h1>

          <p className="text-lg text-white/60 max-w-md leading-relaxed">
            Access real-time business intelligence, AI-powered insights, and strategic recommendations—all in one platform.
          </p>

          {/* 功能列表 */}
          <div className="mt-12 space-y-4">
            <FeatureItem text="Real-time KPI Dashboard" />
            <FeatureItem text="AI-Powered Analytics" />
            <FeatureItem text="Instant Business Insights" />
          </div>
        </div>
      </div>

      {/* 右側登入表單 */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* 返回首頁 (Mobile) */}
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo (Mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">STS</span>
          </div>

          {/* 標題 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
            <p className="text-white/60">
              Enter your credentials to access the platform
            </p>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 表單 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-cyan focus:ring-accent-cyan/30"
                />
                <span className="text-sm text-white/60">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-950 px-4 text-white/40">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={socialLoading !== null}
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              {socialLoading === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={handleLineLogin}
              disabled={socialLoading !== null}
              className="btn-secondary flex items-center justify-center gap-2 py-3"
            >
              {socialLoading === "line" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LineIcon />
              )}
              <span>LINE</span>
            </button>
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      <span className="text-white/70">{text}</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#06C755"
        d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.813 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.18 14.381 24 12.479 24 10.304zM8.391 13.299a.307.307 0 01-.306.306H4.847a.306.306 0 01-.217-.089.307.307 0 01-.089-.217V8.207a.307.307 0 01.306-.306h.864a.307.307 0 01.306.306v4.17h1.868a.307.307 0 01.306.306v.616zm2.049 0a.307.307 0 01-.306.306h-.864a.307.307 0 01-.306-.306V8.207a.307.307 0 01.306-.306h.864a.307.307 0 01.306.306v5.092zm5.581 0a.307.307 0 01-.306.306h-.863a.313.313 0 01-.062-.006l-.027-.006-.037-.012-.026-.012-.028-.017-.023-.015-.023-.019-.021-.019-2.592-3.499v3.299a.307.307 0 01-.306.306h-.864a.307.307 0 01-.306-.306V8.207a.307.307 0 01.306-.306h.864l.062.006.027.006.037.012.026.012.028.016.024.016.023.018.021.02 2.592 3.498V8.207a.307.307 0 01.306-.306h.864a.307.307 0 01.306.306v5.092zm3.627-3.927a.307.307 0 01-.306.306h-1.868v1.017h1.868a.307.307 0 01.306.306v.617a.307.307 0 01-.306.306h-1.868v1.017h1.868a.307.307 0 01.306.306v.617a.307.307 0 01-.306.306h-3.237a.307.307 0 01-.306-.306V8.207a.307.307 0 01.306-.306h3.237a.307.307 0 01.306.306v.617z"
      />
    </svg>
  );
}
