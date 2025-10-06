import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}

// a convex HTTP client  for server-side actions
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default convex;
