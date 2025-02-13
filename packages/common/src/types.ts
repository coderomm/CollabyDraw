import z from "zod";

export const SignupSchema = z.object({
    username: z.string().email().min(3).max(30),
    password: z.string().min(4).max(18),
    name: z.string().min(3).max(30),
});

export const SigninSchema = z.object({
    username: z.string().email().min(3).max(30),
    password: z.string().min(4).max(18),
});

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(30),
});