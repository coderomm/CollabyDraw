'use client';

import { Button } from "@repo/ui/button";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SignOutButton } from "./SignOutButton";

type UserMenuProps = {
    email: string;
};

export function UserMenu({ email }: UserMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                    <UserCircle className="h-5 w-5" />
                    <span>{email}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/draw">Draw</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}