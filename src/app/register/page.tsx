"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/validations/auth";
import { handleRegister } from "@/actions/authActions";
import { Heart, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const nextRouter = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "volunteer" as const,
    },
  });

  const onSubmit = async (data: any) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("role", data.role);

    const res = await handleRegister(null, formData);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.message || "Registration successful!");
      setTimeout(() => {
        nextRouter.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      {/* Decorative Blur BG */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 glass p-8 rounded-3xl relative z-10 border shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join VolunteerHub to start making a difference
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

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  {...register("name")}
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

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
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </label>
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
            {loading ? "Registering account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
