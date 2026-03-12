import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  emailVerifiedAt: timestamp("email_verified_at"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Email verification tokens
// ---------------------------------------------------------------------------
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// 2FA one-time codes (delivered by email)
// ---------------------------------------------------------------------------
export const twoFactorCodes = pgTable("two_factor_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  attemptCount: integer("attempt_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Password reset tokens
// ---------------------------------------------------------------------------
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  body: text("body").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scheduleDays = pgTable("schedule_days", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  date: text("date").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scheduleItems = pgTable("schedule_items", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id")
    .references(() => scheduleDays.id, { onDelete: "cascade" })
    .notNull(),
  time: text("time").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  track: text("track"),
  location: text("location"),
  isImportant: boolean("is_important").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier", {
    enum: ["platinum", "gold", "silver", "bronze", "community"],
  })
    .notNull()
    .default("community"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaItems = pgTable("media_items", {
  id: serial("id").primaryKey(),
  type: text("type", {
    enum: ["instagram", "youtube", "video", "image", "link"],
  })
    .notNull()
    .default("link"),
  title: text("title").notNull(),
  caption: text("caption"),
  embedUrl: text("embed_url"),
  thumbnailUrl: text("thumbnail_url"),
  externalUrl: text("external_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// email UNIQUE prevents duplicate registrations per participant
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  studentId: text("student_id"),
  major: text("major"),
  experienceLevel: text("experience_level", {
    enum: ["beginner", "intermediate", "advanced"],
  }).notNull(),
  // needs_team     → placed in the matching pool
  // has_partial_team → submitted some teammate emails
  // has_full_team  → submitted a complete set of teammate emails
  // solo           → opting out of team assignment entirely
  teamStatus: text("team_status", {
    enum: ["needs_team", "has_partial_team", "has_full_team", "solo"],
  }).notNull(),
  dietaryRestrictions: text("dietary_restrictions"),
  notes: text("notes"),
  consent: boolean("consent").notNull().default(false),
  confirmationEmailSentAt: timestamp("confirmation_email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Teams can be premade (from teammate entries), auto-matched, or organizer-created
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name"),
  formationType: text("formation_type", {
    enum: ["premade", "auto_matched", "organizer_created"],
  })
    .notNull()
    .default("premade"),
  // forming  → still waiting on members / pending organizer review
  // complete → all members confirmed
  // locked   → finalized by organizer; no further changes
  status: text("status", {
    enum: ["forming", "complete", "locked"],
  })
    .notNull()
    .default("forming"),
  maxSize: integer("max_size").notNull().default(4),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Each registration can only be on one team (unique constraint on registrationId)
export const teamMembers = pgTable(
  "team_members",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    registrationId: integer("registration_id")
      .references(() => registrations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role", { enum: ["lead", "member"] }).notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueRegistration: unique("unique_registration_team").on(t.registrationId),
  })
);

// Structured teammate information submitted at registration time.
// Enables auto-linking when the named teammate later registers with a matching email.
export const teammateEntries = pgTable("teammate_entries", {
  id: serial("id").primaryKey(),
  registrantId: integer("registrant_id")
    .references(() => registrations.id, { onDelete: "cascade" })
    .notNull(),
  teammateFirstName: text("teammate_first_name"),
  teammateLastName: text("teammate_last_name"),
  // Normalized to lowercase for matching; nullable since teammates may provide only name/ID
  teammateEmail: text("teammate_email"),
  teammateStudentId: text("teammate_student_id"),
  // Populated when a registration with a matching email is found
  linkedRegistrationId: integer("linked_registration_id").references(
    () => registrations.id,
    { onDelete: "set null" }
  ),
  status: text("status", { enum: ["pending", "linked"] })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const scheduleDaysRelations = relations(scheduleDays, ({ many }) => ({
  items: many(scheduleItems),
}));

export const scheduleItemsRelations = relations(scheduleItems, ({ one }) => ({
  day: one(scheduleDays, { fields: [scheduleItems.dayId], references: [scheduleDays.id] }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  registration: one(registrations, {
    fields: [teamMembers.registrationId],
    references: [registrations.id],
  }),
}));

export const registrationsRelations = relations(registrations, ({ many }) => ({
  teamMemberships: many(teamMembers),
  submittedEntries: many(teammateEntries, { relationName: "submittedEntries" }),
  linkedByEntries: many(teammateEntries, { relationName: "linkedEntries" }),
}));

export const teammateEntriesRelations = relations(teammateEntries, ({ one }) => ({
  registrant: one(registrations, {
    fields: [teammateEntries.registrantId],
    references: [registrations.id],
    relationName: "submittedEntries",
  }),
  linkedRegistration: one(registrations, {
    fields: [teammateEntries.linkedRegistrationId],
    references: [registrations.id],
    relationName: "linkedEntries",
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  emailVerificationTokens: many(emailVerificationTokens),
  twoFactorCodes: many(twoFactorCodes),
  passwordResetTokens: many(passwordResetTokens),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, { fields: [emailVerificationTokens.userId], references: [users.id] }),
}));

export const twoFactorCodesRelations = relations(twoFactorCodes, ({ one }) => ({
  user: one(users, { fields: [twoFactorCodes.userId], references: [users.id] }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));
