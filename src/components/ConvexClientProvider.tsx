"use client"; // Ensures this runs as a Client Component

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;


const convex = new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexUrl && process.env.NODE_ENV === "development") {
    console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex features will not work.");
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
