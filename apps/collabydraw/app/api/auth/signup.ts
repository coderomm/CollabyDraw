import { NextApiRequest, NextApiResponse } from "next";
import client from "@repo/db/client";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { name, email, password } = req.body;

        const existingUser = await client.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await client.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });

        return res.status(200).json({ message: "User created successfully", user });
    }

    return res.status(405).json({ error: "Method not allowed" });
}