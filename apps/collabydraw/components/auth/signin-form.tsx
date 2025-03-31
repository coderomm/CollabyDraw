'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SigninSchema } from "@repo/common/types";

type SignInFormValues = z.infer<typeof SigninSchema>;

export function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [isPending, startTransition] = useTransition();

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(SigninSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: SignInFormValues) {
        startTransition(async () => {
            try {
                const result = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                });

                if (result?.error) {
                    toast.error(result.error);
                    return;
                }

                toast.success("Signed in successfully");
                router.push(callbackUrl);
                router.refresh();
            } catch (error) {
                toast.error("Something went wrong. Please try again.");
                const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
                console.error(errorMessage)
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="Enter your email"
                                    className="h-12 bg-form-input hover:bg-form-input-hover p-3 border rounded border-color-border-input text-form-color-text !ring-0 !outline-0 focus:border-color-outline-focus focus:border-[2px]"
                                />
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
                                <Input
                                    {...field}
                                    type="password"
                                    disabled={isPending}
                                    placeholder="Enter your password"
                                    className="space-y-[10px] h-12 bg-form-input hover:bg-form-input-hover p-3 border rounded border-color-border-input text-form-color-text !ring-0 !outline-0 focus:border-color-outline-focus focus:border-[2px]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="!mt-[10px] w-full h-12 rounded-md text-sm font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]"
                    disabled={isPending}
                    size={"lg"}
                >
                    {isPending ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </Form>
    );
}