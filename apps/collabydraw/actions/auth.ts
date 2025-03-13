'use server'

import { SignupSchema } from '@repo/common/types';
import client from '@repo/db/client';
import bcrypt from "bcrypt";
import { z } from 'zod';

export async function signUp(values: z.infer<typeof SignupSchema>) {
    const validatedFields = SignupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields." };
    }

    const { name, email, password } = validatedFields.data;

    const existingUser = await client.user.findFirst({
        where: {
            OR: [{ email }, { name }]
        }
    });

    if (existingUser) {
        return { error: "User already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await client.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Some Brutal Error';
        console.error("Error: ", errorMessage)
        return { error: "Error creating user." };
    }
}