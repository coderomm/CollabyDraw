'use client';

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function SignOutButton() {
    return (
        <Button size="sm" onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left">
            Sign Out
        </Button>
    );
}