"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { Sparkles, Loader2, ArrowRight, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"

// Role is NOT part of the registration form — always defaults to "faculty" on backend
const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .endsWith("@skit.ac.in", "Only @skit.ac.in emails are allowed"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      // Never send role — backend always assigns "faculty"
      const response = await api.post("/api/v1/auth/register", values)
      return response.data
    },
    onSuccess: () => {
      toast.success("Registration successful! Please login.")
      router.push("/login")
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Registration failed. Please try again."
      )
    },
  })

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-background to-background dark:from-slate-900" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4"
      >
        <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-balance">
              Register for your Faculty Portfolio. Must use an @skit.ac.in email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Faculty role info banner */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <GraduationCap className="size-4 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                All new accounts are registered as{" "}
                <span className="font-semibold text-primary">Faculty</span>. Contact
                your administrator to be assigned an elevated role.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="name@skit.ac.in"
                  className="bg-background/50"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-background/50"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="mt-6 w-full group"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 p-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="h-auto p-0 font-medium"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
