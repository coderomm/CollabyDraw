"use client"

import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";
export default function Provider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}