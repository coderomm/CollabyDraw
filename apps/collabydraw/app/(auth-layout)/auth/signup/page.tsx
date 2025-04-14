import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <Card className="border-0 shadow-none lg:shadow-2xl rounded-3xl m-0 mx-auto px-6 py-8 lg:p-16 relative z-10 max-w-[480px] bg-yellow-light">
            <CardHeader className="p-0">
                <CardTitle className="text-2xl font-bold text-center text-[#0a0a0a]">Create an account</CardTitle>
                <CardDescription className="text-sm pb-4 text-primary text-center text-[#171717]">Enter your email below to create your account</CardDescription>
            </CardHeader>
            <CardContent className="p-0 !my-0">
                <SignUpForm />
            </CardContent>
            <CardFooter className="px-0 pt-2 pb-0 flex-col !mt-0 gap-2">
                <div className="relative flex h-7 items-center justify-center gap-2">
                    <div className="w-6 border-t border-yellow-darker"></div>
                    <span className="flex-shrink font-primary text-sm text-yellow-darker">or</span>
                    <div className="w-6 border-t border-yellow-darker"></div>
                </div>
                <div className="flex w-full flex-col items-center gap-3">
                    <Link className="text-color-primary text-sm hover:underline hover:underline-offset-4 transition-all duration-200 ease-in-out" href="/auth/signin">Already have an account? Sign In</Link>
                </div>
                <div className="flex w-full flex-col items-center gap-3">
                    <Link className="text-color-primary text-sm hover:underline hover:underline-offset-4 transition-all duration-200 ease-in-out" href="/">Back to Home</Link>
                </div>
            </CardFooter>
        </Card>
    );
}