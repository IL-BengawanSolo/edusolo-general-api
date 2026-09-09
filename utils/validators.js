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
  sort_by: z.enum(["highest-price", "lowest-price", "highest-rating", "review-count", "name-asc", "name-desc", "newest", "oldest"]).optional(),
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

export const singleDestinationSchema = z.object({
  name: z.string().trim().min(1).max(255),
  address: z.string().trim().max(1000).optional().nullable(),
  region_id: z.coerce.number().int().positive().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  ticket_price_min: z.coerce.number().min(0).max(100000000).optional().nullable(),
  ticket_price_max: z.coerce.number().min(0).max(100000000).optional().nullable(),
  ticket_price_info: z.any().optional().nullable(),
  website_url: z.string().trim().url().max(2048).optional().nullable().or(z.literal("")),
  review_count: z.coerce.number().int().min(0).optional().nullable(),
  average_rating: z.coerce.number().min(0).max(5).optional().nullable(),
});

export const updateDestinationSchema = singleDestinationSchema.partial().refine(
  (d) => {
    if (d.ticket_price_min != null && d.ticket_price_max != null && d.ticket_price_min !== "" && d.ticket_price_max !== "" ) {
      const min = Number(d.ticket_price_min);
      const max = Number(d.ticket_price_max);
      if (!Number.isNaN(min) && !Number.isNaN(max)) return max >= min;
    }
    return true;
  },
  { message: "ticket_price_max must be >= min", path: ["ticket_price_max"] }
);

export const imageIdParamSchema = z.object({
  uuid: z.string().uuid(),
  imageId: z.coerce.number().int().positive(),
});
