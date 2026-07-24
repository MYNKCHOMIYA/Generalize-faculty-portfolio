"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(1, "Email or Employee ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      // FastAPI OAuth2PasswordRequestForm expects formData
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("password", values.password);

      const response = await api.post("/api/v1/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.access_token);
      toast.success("Login successful!");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Login failed. Please check your credentials."
      );
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Absolute top-right theme toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Cinematic Video Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-background">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50 dark:opacity-40"
        >
          <source src="/login_page_background.mp4" type="video/mp4" />
        </video>
        {/* Soft overlay gradient to ensure UI pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      </div>

      {/* Noise texture for dithering & premium feel */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.06] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4"
      >
        <Card className="border-border/60 bg-background/60 backdrop-blur-[2px] hover:backdrop-blur-sm transition-all duration-500 shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="space-y-2 pb-6 pt-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-foreground text-background shadow-lg rotate-3 transition-transform hover:rotate-6 duration-300">
              <Sparkles className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl tracking-tight font-bold">Welcome back</CardTitle>
            <CardDescription className="text-balance">
              Sign in to your Faculty Portfolio to manage your profile and view analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email or Employee ID</Label>
                <Input
                  id="username"
                  placeholder="Enter your email or ID"
                  className="bg-muted/30 border-border/60 rounded-xl h-12 px-4 focus-visible:ring-foreground/40 transition-all shadow-sm"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-muted/30 border-border/60 rounded-xl h-12 px-4 focus-visible:ring-foreground/40 transition-all shadow-sm pr-11"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="mt-8 w-full group rounded-xl h-12 font-semibold text-[15px] shadow-lg shadow-primary/20"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 p-6 bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="h-auto p-0 font-semibold text-foreground hover:underline" onClick={() => router.push("/register")}>
                Register Now
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
