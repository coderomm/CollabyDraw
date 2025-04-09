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
import { signIn } from "next-auth/react";

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
                const signUpResult = await signUp(values)

                if (signUpResult.error) {
                    toast.error(signUpResult.error);
                    return
                }

                const signInResult = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                });

                if (signInResult?.error) {
                    toast.error(signInResult.error);
                    return;
                }
                toast.success("Account created successfully")
                router.push("/");
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
                            <FormLabel className="sr-only">Username</FormLabel>
                            <FormControl>
                                <Input {...field}
                                    disabled={isPending}
                                    placeholder="Enter your username"
                                    className="h-12 bg-form-input hover:bg-form-input-hover p-3 border rounded border-color-border-input text-form-color-text !ring-0 !outline-0 focus:border-color-outline-focus focus:border-[2px]" />
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
                            <FormLabel className="sr-only">Email</FormLabel>
                            <FormControl>
                                <Input {...field}
                                    disabled={isPending}
                                    placeholder="Enter your email"
                                    className="h-12 bg-form-input hover:bg-form-input-hover p-3 border rounded border-color-border-input text-form-color-text !ring-0 !outline-0 focus:border-color-outline-focus focus:border-[2px]" />
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
                            <FormLabel className="sr-only">Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field}
                                    disabled={isPending}
                                    placeholder="Enter your password"
                                    className="h-12 bg-form-input hover:bg-form-input-hover p-3 border rounded border-color-border-input text-form-color-text !ring-0 !outline-0 focus:border-color-outline-focus focus:border-[2px]" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={isPending} 
                type="submit" 
                className="!mt-[10px] w-full h-12 rounded-md text-sm font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]">
                    Sign Up
                </Button>
            </form>
        </Form>
    )
}