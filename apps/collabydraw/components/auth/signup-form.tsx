'use client'

import { signUp } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod"
import { SignupSchema } from "@repo/common/types";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTransition } from "react";

type SignUpFormValues = z.infer<typeof SignupSchema>;

export function SignUpForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: SignUpFormValues) {
        startTransition(async () => {
            try {
                const result = await signUp(values)

                if (result.error) {
                    toast.error(result.error);
                    return
                }

                toast.success("Account created successfully")
                router.push('/auth/signin')
            } catch (error) {
                toast.error("Something went wrong. Please try again.");
                const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
                console.error(errorMessage)
            }
        })
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input {...field}
                                    disabled={isPending}
                                    placeholder="Enter your username" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field}
                                    disabled={isPending}
                                    placeholder="Enter your email" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field}
                                    disabled={isPending}
                                    placeholder="Enter your password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    Sign Up
                </Button>
            </form>
        </Form>
    )
}