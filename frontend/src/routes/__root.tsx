import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { appConfig, seoConfig } from "../config/app.config";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: appConfig.title },
      { name: "description", content: appConfig.description },
      { name: "author", content: appConfig.author },
      { property: "og:title", content: seoConfig.og.title },
      { property: "og:description", content: seoConfig.og.description },
      { property: "og:type", content: seoConfig.og.type },
      { name: "twitter:card", content: seoConfig.twitter.card },
      { name: "twitter:title", content: seoConfig.twitter.title },
      { name: "twitter:description", content: seoConfig.twitter.description },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { AuthProvider, useAuth } from "../context/auth-context";
import { DashboardLayout } from "../components/dashboard-layout";
import { useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutWrapper />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutWrapper() {
  const { user, isLoading } = useAuth();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;

  const authRoutes = [
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
    "/unauthorized",
  ];
  const isAuthRoute = authRoutes.includes(currentPath);

  // Protected paths list
  const protectedRoutes = [
    "/admin/dashboard",
    "/admin/organizations",
    "/admin/auditors",
    "/admin/training-institutes",
    "/admin/advisory",
    "/admin/credentials",
    "/admin/certificates",
    "/admin/applications",
    "/admin/content",
    "/admin/certificate-templates",
    "/admin/analytics",
    "/admin/audit-logs",
    "/admin/settings",
    "/admin/profile",
    "/admin/advisors",
    "/admin/resources",
    "/admin/news",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) => currentPath === route || currentPath.startsWith(route + "/"),
  );

  useEffect(() => {
    if (!isLoading && isProtectedRoute && !user) {
      navigate({ to: "/admin/login" });
    }
  }, [user, isLoading, isProtectedRoute, currentPath]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F2942] border-t-transparent" />
      </div>
    );
  }

  if (isProtectedRoute) {
    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  }

  // Otherwise, render the standard public website layout
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {!isAuthRoute && <SiteHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthRoute && <SiteFooter />}
    </div>
  );
}
