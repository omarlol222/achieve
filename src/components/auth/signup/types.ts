import * as z from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be less than 20 characters"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .max(50, "Full name must be less than 50 characters"),
  phone: z.string().optional(),
});

export type SignUpForm = z.infer<typeof signUpSchema>;