import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(16).optional().nullable(),
  dob: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const searchQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  region_id: z.union([z.string(), z.array(z.string())]).optional(),
  category_id: z.union([z.string(), z.array(z.string())]).optional(),
  place_type_id: z.union([z.string(), z.array(z.string())]).optional(),
  open_days: z.union([z.string(), z.array(z.string())]).optional(),
  age_category_id: z.string().optional(),
  price_range: z.enum(["free", "lt-10k", "10-30", "30-100", "gt-100k"]).optional(),
  sort_by: z.enum(["highest-price", "lowest-price", "highest-rating", "review-count"]).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(10).optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
});

export const similarQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10).optional(),
});

export const sessionIdParamSchema = z.object({
  session_id: z.coerce.number().int().positive(),
});

export const uuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1).max(255),
});

export const aiRecommendSchema = z.object({
  session_id: z.coerce.number().int().positive(),
  preferred_categories: z.array(z.string().trim().min(1)).max(20).default([]),
  n: z.coerce.number().int().min(1).max(20).default(8),
});

export const chatbotSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().trim().min(1).max(2000),
    })
  ).min(1).max(20),
  message: z.string().trim().max(2000).optional(),
}).refine((d) => d.messages || d.message, { message: "messages or message required" });
