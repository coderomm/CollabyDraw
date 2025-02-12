import z from "zod";

export const SignupSchema = z.object({
    email: z.string().email().min(5).max(255),
    password: z.string().min(8).max(255),
    role: z.enum(["USER", "ADMIN"]),
});

export const SigninSchema = z.object({
    email: z.string().email().min(5).max(255),
    password: z.string().min(8).max(255),
});