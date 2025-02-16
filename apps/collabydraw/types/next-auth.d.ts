import { User } from "@repo/db/client"
import "next-auth";

declare module "next-auth" {
    interface Session {
        user: User
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        username?: string;
    }
}