import { SignUpForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-full max-w-md mx-auto flex flex-col justify-center space-y-6 sm:w-[350px]">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">Enter your email below to create your account</CardDescription>
                </CardHeader>
                <CardContent className="!mt-0">
                    <SignUpForm />
                </CardContent>
                <CardFooter className="flex-col !mt-0 gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <Button className="w-full" variant="outline">GitHub</Button>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link href="/auth/signin" className="hover:text-brand underline underline-offset-4">
                            Already have an account? Sign In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}