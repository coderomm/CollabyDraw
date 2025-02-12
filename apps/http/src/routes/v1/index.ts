import 'dotenv/config'
import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { compare, hash } from "../../utils/scrypt";
import { SigninSchema, SignupSchema } from '../../utils/schema-types';
import client from '@repo/db/client';

export const router = Router();

if (!process.env.JWT_SECRET || !process.env.FRONTEND_URL) {
    console.error("❌ Missing required environment variables.");
    process.exit(1);
}

const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many signup attempts, please try again later.'
});

router.post('/signup', async (req, res) => {
    try {
        const parsedData = SignupSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: "Signup Validation failed", errors: parsedData.error.format() });
            return;
        }

        const existingUser = await client.user.findFirst({ where: { email: parsedData.data.email } });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await hash(parsedData.data.password);

        const user = await client.user.create({
            data: { email: parsedData.data.email, password: hashedPassword, role: parsedData.data.role }
        });

        res.json({ userId: user.id });
    } catch (error: any) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts, please try again later.'
});

router.post('/signin', async (req, res) => {
    try {
        const parsedData = SigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(403).json({ message: "Signin Validation failed", errors: parsedData.error.format() });
            return;
        }

        const user = await client.user.findUnique({
            where: { email: parsedData.data.email },
            include: { avatar: true }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isValid = await compare(parsedData.data.password, user.password!);
        if (!isValid) {
            res.status(403).json({ message: "Invalid password" });
            return;
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '72h' });

        res.json({
            token,
            user: { email: user.email, role: user.role }
        });
    } catch (error: any) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});