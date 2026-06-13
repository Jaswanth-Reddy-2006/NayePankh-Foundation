import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  date: z.string().or(z.date()).refine((val) => {
    return val !== "";
  }, "Please select a valid date"),
  time: z.string().min(1, "Please specify the time"),
  venue: z.string().min(3, "Venue must be at least 3 characters"),
  requiredVolunteers: z.number().min(1, "At least 1 volunteer is required").or(z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 1 : parsed;
  })),
  bannerImage: z.string().or(z.literal("")),
  skillsRequired: z.array(z.string()).default([]),
});
