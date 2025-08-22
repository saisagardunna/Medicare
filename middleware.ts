import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analysis(.*)",
  "/maps(.*)",
  "/chatbot(.*)",
  "/contact(.*)",
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    return auth().then((session) => {
      if (!session.userId) {
        return new Response("Unauthorized", { status: 401 });
      }
    });
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
