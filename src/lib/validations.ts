import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------------------
// Registration (public form)
// ---------------------------------------------------------------------------
export const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  studentId: z.string().optional(),
  major: z.string().min(1, "Please enter your major").max(100),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your experience level",
  }),
  teamStatus: z.enum(["needs_team", "has_partial_team", "has_full_team", "solo"], {
    required_error: "Please select your team status",
  }),
  teammates: z
    .array(
      z.object({
        firstName: z.string().max(100).optional(),
        lastName: z.string().max(100).optional(),
        email: z.string().email("Must be a valid email").optional().or(z.literal("")),
        studentId: z.string().max(20).optional(),
      }).refine(
        (t) =>
          (t.firstName?.trim() || t.lastName?.trim() || t.email?.trim() || t.studentId?.trim()),
        { message: "Provide at least one piece of info (name, email, or student ID)" }
      )
    )
    .max(3)
    .optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().max(500).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to participate" }),
  }),
  // Honeypot field — must be empty
  website: z.string().max(0).optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  // Honeypot
  website: z.string().max(0).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ---------------------------------------------------------------------------
// Admin — Announcement
// ---------------------------------------------------------------------------
export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  body: z.string().min(1, "Body is required"),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;

// ---------------------------------------------------------------------------
// Admin — FAQ item
// ---------------------------------------------------------------------------
export const faqItemSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().min(1).max(100).default("general"),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export type FaqItemFormData = z.infer<typeof faqItemSchema>;

// ---------------------------------------------------------------------------
// Admin — Schedule day
// ---------------------------------------------------------------------------
export const scheduleDaySchema = z.object({
  label: z.string().min(1, "Label is required").max(200),
  date: z.string().min(1, "Date is required"),
  sortOrder: z.number().int().default(0),
});

// ---------------------------------------------------------------------------
// Admin — Schedule item
// ---------------------------------------------------------------------------
export const scheduleItemSchema = z.object({
  dayId: z.number().int().positive("Day is required"),
  time: z.string().min(1, "Time is required").max(50),
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().optional().nullable(),
  track: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isImportant: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// ---------------------------------------------------------------------------
// Admin — Sponsor
// ---------------------------------------------------------------------------
export const sponsorSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  tier: z.enum(["platinum", "gold", "silver", "bronze", "community"]),
  logoUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export type SponsorFormData = z.infer<typeof sponsorSchema>;

// ---------------------------------------------------------------------------
// Admin — Media item
// ---------------------------------------------------------------------------
export const mediaItemSchema = z.object({
  type: z.enum(["instagram", "youtube", "video", "image", "link"]),
  title: z.string().min(1, "Title is required").max(300),
  caption: z.string().optional().nullable(),
  embedUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type MediaItemFormData = z.infer<typeof mediaItemSchema>;

// ---------------------------------------------------------------------------
// Admin — Site settings
// ---------------------------------------------------------------------------
export const siteSettingsSchema = z.object({
  event_name: z.string().min(1).max(200),
  tagline: z.string().max(300).optional().nullable(),
  event_start: z.string().optional().nullable(),
  event_end: z.string().optional().nullable(),
  venue_name: z.string().max(200).optional().nullable(),
  venue_address: z.string().max(500).optional().nullable(),
  registration_mode: z.enum(["internal", "external"]).default("external"),
  external_registration_url: z.string().url().optional().nullable().or(z.literal("")),
  sponsor_packet_url: z.string().url().optional().nullable().or(z.literal("")),
  instagram_url: z.string().url().optional().nullable().or(z.literal("")),
  twitter_url: z.string().url().optional().nullable().or(z.literal("")),
  linkedin_url: z.string().url().optional().nullable().or(z.literal("")),
  discord_url: z.string().url().optional().nullable().or(z.literal("")),
  contact_email: z.string().email().optional().nullable().or(z.literal("")),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;
