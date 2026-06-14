"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/auth";
import { Heart, Mail, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showForgot, setShowForgot] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
        setLoading(false);
      } else {
        setSuccess("Login successful! Redirecting...");
        
        // Determine role based on email to avoid getSession client-side race conditions
        const isAdmin = data.email.toLowerCase().includes("admin");
        const targetUrl = isAdmin ? "/admin" : "/dashboard";

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email address first");
      return;
    }
    setError(null);
    setSuccess(`Password reset email simulated! A reset link has been sent to ${resetEmail}.`);
    setResetEmail("");
    setTimeout(() => {
      setShowForgot(false);
      setSuccess(null);
    }, 4000);
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      {/* Decorative Blur BG */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass p-8 rounded-3xl relative z-10 border shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {showForgot ? "Reset password" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {showForgot
              ? "Enter your email to receive a password reset link"
              : "Sign in to your VolunteerHub account"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {!showForgot ? (
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    {...register("email")}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setShowForgot(true);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register("password")}
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={() => {
                  setError(null);
                  setShowForgot(false);
                }}
              >
                Back to Login
              </Button>
              <Button type="submit" className="w-1/2 flex items-center justify-center space-x-1.5">
                <KeyRound className="h-4 w-4" />
                <span>Reset Password</span>
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </div>

        {/* Quick Testing Accounts Note */}
        <div className="pt-4 border-t border-white/5 text-[11px] text-muted-foreground">
          <span className="font-semibold block mb-1">Testing accounts (Password: password123):</span>
          <div className="grid grid-cols-2 gap-x-2">
            <div>Volunteer: <code className="bg-secondary px-1 rounded">john@gmail.com</code></div>
            <div>Admin: <code className="bg-secondary px-1 rounded">admin@volunteerhub.org</code> (PW: admin123)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
