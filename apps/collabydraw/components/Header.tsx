import { Button } from "@repo/ui/button";
import { PenLine } from "lucide-react";
import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-border/40">
            <div className="container flex h-14 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <PenLine className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">DrawTogether</span>
                </Link>
                <nav className="flex items-center space-x-4">
                    <Link href="/auth/signin">
                        <Button variant="ghost" className="text-primary hover:text-primary/90">
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign Up</Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}