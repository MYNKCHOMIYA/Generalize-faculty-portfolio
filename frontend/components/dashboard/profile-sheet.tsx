"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, User, X, ChevronRight,
  Building2, Phone, MapPin, Globe,
  BookOpen, Link2, FlaskConical, Sparkles, Code2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  designation: z.string().min(1, "Designation is required"),
  employee_id: z.string().optional(),
  department: z.string().optional(),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  google_scholar: z.string().optional(),
  orcid: z.string().optional(),
  office_location: z.string().optional(),
  specialization: z.string().optional(),
  areas_of_interest: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const SECTIONS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "academic", label: "Academic", icon: FlaskConical },
  { id: "online", label: "Online Presence", icon: Globe },
];

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 border-b border-border/40 pb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

export function ProfileSheet() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/v1/profile/me");
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "", last_name: "", designation: "", employee_id: "",
      department: "", phone_number: "", bio: "", website: "", linkedin: "",
      google_scholar: "", orcid: "", office_location: "", specialization: "",
      areas_of_interest: "", skills: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        designation: profile.designation || "",
        employee_id: profile.employee_id || "",
        department: profile.department || "",
        phone_number: profile.phone_number || "",
        bio: profile.bio || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        google_scholar: profile.google_scholar || "",
        orcid: profile.orcid || "",
        office_location: profile.office_location || "",
        specialization: profile.specialization || "",
        areas_of_interest: profile.areas_of_interest || "",
        skills: profile.skills || "",
      });
    }
  }, [profile, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (profile) {
        const res = await api.put("/api/v1/profile/me", values);
        return res.data;
      } else {
        const res = await api.post("/api/v1/profile/", values);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(profile ? "Profile updated successfully" : "Profile created successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to save profile");
    },
  });

  const onSubmit = (values: ProfileFormValues) => saveMutation.mutate(values);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <User className="h-4 w-4" />
        {profile ? "Edit Profile" : "Create Profile"}
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/20 bg-background/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
                
                {/* Glass shimmer overlay */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />

                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-border/50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="size-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">
                        {profile ? "Edit Faculty Profile" : "Create Faculty Profile"}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {profile ? "Update your professional details" : "Set up your academic portfolio"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Section tabs */}
                <div className="relative flex gap-1 border-b border-border/50 px-6 py-2">
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          activeSection === s.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {s.label}
                        {activeSection === s.id && (
                          <motion.span
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-lg bg-primary/10"
                            style={{ zIndex: -1 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Body */}
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center py-16">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
                      
                      {/* BASIC INFO */}
                      <AnimatePresence mode="wait">
                        {activeSection === "basic" && (
                          <motion.div
                            key="basic"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-5"
                          >
                            <FieldGroup label="Personal Details">
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="First Name *" error={form.formState.errors.first_name?.message}>
                                  <Input placeholder="Ramesh" {...form.register("first_name")} className="bg-background/50" />
                                </Field>
                                <Field label="Last Name *" error={form.formState.errors.last_name?.message}>
                                  <Input placeholder="Kumar" {...form.register("last_name")} className="bg-background/50" />
                                </Field>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Designation *" error={form.formState.errors.designation?.message}>
                                  <Input placeholder="Assistant Professor" {...form.register("designation")} className="bg-background/50" />
                                </Field>
                                <Field label="Employee ID">
                                  <Input placeholder="EMP001" {...form.register("employee_id")} className="bg-background/50" />
                                </Field>
                              </div>
                            </FieldGroup>

                            <FieldGroup label="Contact & Location">
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Department">
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input placeholder="Computer Science" {...form.register("department")} className="pl-9 bg-background/50" />
                                  </div>
                                </Field>
                                <Field label="Phone Number">
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input placeholder="+91 98765 43210" {...form.register("phone_number")} className="pl-9 bg-background/50" />
                                  </div>
                                </Field>
                              </div>
                              <Field label="Office Location">
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                  <Input placeholder="Room 214, Block A" {...form.register("office_location")} className="pl-9 bg-background/50" />
                                </div>
                              </Field>
                            </FieldGroup>

                            <FieldGroup label="Biography">
                              <Field label="About You">
                                <Textarea
                                  rows={4}
                                  placeholder="Brief description of your research, teaching interests and achievements..."
                                  {...form.register("bio")}
                                  className="bg-background/50 resize-none"
                                />
                              </Field>
                            </FieldGroup>
                          </motion.div>
                        )}

                        {/* ACADEMIC */}
                        {activeSection === "academic" && (
                          <motion.div
                            key="academic"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-5"
                          >
                            <FieldGroup label="Research Focus">
                              <Field label="Specialization">
                                <div className="relative">
                                  <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                  <Input placeholder="Machine Learning, Data Science" {...form.register("specialization")} className="pl-9 bg-background/50" />
                                </div>
                              </Field>
                              <Field label="Areas of Interest">
                                <Textarea
                                  rows={3}
                                  placeholder="Computer Vision, NLP, Robotics (comma-separated)"
                                  {...form.register("areas_of_interest")}
                                  className="bg-background/50 resize-none"
                                />
                              </Field>
                            </FieldGroup>

                            <FieldGroup label="Technical Skills">
                              <Field label="Skills (comma-separated)">
                                <div className="relative">
                                  <Code2 className="absolute left-3 top-3 size-3.5 text-muted-foreground" />
                                  <Textarea
                                    rows={3}
                                    placeholder="Python, TensorFlow, React, SQL, Docker"
                                    {...form.register("skills")}
                                    className="pl-9 bg-background/50 resize-none"
                                  />
                                </div>
                              </Field>
                            </FieldGroup>
                          </motion.div>
                        )}

                        {/* ONLINE PRESENCE */}
                        {activeSection === "online" && (
                          <motion.div
                            key="online"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-5"
                          >
                            <FieldGroup label="Web Profiles">
                              <Field label="Personal Website">
                                <div className="relative">
                                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                  <Input type="url" placeholder="https://yourwebsite.com" {...form.register("website")} className="pl-9 bg-background/50" />
                                </div>
                              </Field>
                              <Field label="LinkedIn Profile URL">
                                <div className="relative">
                                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                  <Input type="url" placeholder="https://linkedin.com/in/username" {...form.register("linkedin")} className="pl-9 bg-background/50" />
                                </div>
                              </Field>
                              <Field label="Google Scholar URL">
                                <div className="relative">
                                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                  <Input type="url" placeholder="https://scholar.google.com/citations?user=..." {...form.register("google_scholar")} className="pl-9 bg-background/50" />
                                </div>
                              </Field>
                              <Field label="ORCID ID">
                                <div className="relative">
                                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                  <Input placeholder="0000-0000-0000-0000" {...form.register("orcid")} className="pl-9 bg-background/50" />
                                </div>
                              </Field>
                            </FieldGroup>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </ScrollArea>
                )}

                {/* Footer */}
                <div className="relative flex items-center justify-between border-t border-border/50 px-6 py-4 bg-background/40">
                  <div className="flex gap-1">
                    {SECTIONS.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`size-1.5 rounded-full transition-colors ${
                          activeSection === s.id ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      form="profile-form"
                      disabled={saveMutation.isPending || isLoading}
                      className="gap-2"
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                      {profile ? "Save Changes" : "Create Profile"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
