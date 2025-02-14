import client from '@repo/db/client';
import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { SigninSchema, SignupSchema } from '@repo/common/types';
import { roomRouter } from './room';
import { JWT_SECRET, saltRounds } from "@repo/backend-common/config";
import bcrypt from 'bcrypt';
import { chatRouter } from './chat';

export const router = Router();

if (!JWT_SECRET) {
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

        const existingUser = await client.user.findFirst({ where: { username: parsedData.data.username } });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(parsedData.data.password, saltRounds);

        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                name: parsedData.data.name
            }
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
            where: {
                username: parsedData.data.username
            }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isValid = await bcrypt.compare(user.password, parsedData.data.password);
        if (!isValid) {
            res.status(403).json({ message: "Invalid password" });
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET!, { expiresIn: '72h' });

        res.json({ token });
    } catch (error: any) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.use('/room', roomRouter);
router.use('/chat', chatRouter);
