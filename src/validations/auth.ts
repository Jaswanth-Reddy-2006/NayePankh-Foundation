import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["volunteer", "admin"]).default("volunteer"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").or(z.literal("")),
  dob: z.string().or(z.literal("")),
  gender: z.string().or(z.literal("")),
  address: z.string().or(z.literal("")),
  education: z.string().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  profileImage: z.string().or(z.literal("")),
});
