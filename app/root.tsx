import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { name: "description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students. Get insights into admission requirements and predict your chances for MGHSS, SBASSE, SDSB, and SAHSOL." },
    { name: "keywords", content: "LUMS admissions, LUMS SAT scores, LUMS O levels, LUMS statistics, LUMS MGHSS, LUMS SBASSE, LUMS SDSB, LUMS SAHSOL, Pakistan university admissions, LUMS requirements, LUMS acceptance rate" },
    { name: "author", content: "Abdur Rehman Tariq" },
    { name: "google-site-verification", content: "NowvXA1Cnoi8Ddi97wi-WcKhIYp5PxCVOyN7C7fJTFo" },
    { name: "theme-color", content: "#000000" },
    { property: "og:title", content: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { property: "og:description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students across MGHSS, SBASSE, SDSB, and SAHSOL." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://lumsbythenumbers.vercel.app" },
    { property: "og:image", content: "https://lumsbythenumbers.vercel.app/og.png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:site_name", content: "Lums By The Numbers" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { name: "twitter:description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students." },
    { name: "twitter:image", content: "https://lumsbythenumbers.vercel.app/og.png" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: "English" },
    { name: "revisit-after", content: "7 days" },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="NowvXA1Cnoi8Ddi97wi-WcKhIYp5PxCVOyN7C7fJTFo" />
        <Meta />
        <Links />
      </head>
      <body className="bg-black min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30 z-0">
          {[...Array(12)].map((_, i) => (
            <div 
              key={`v-${i}`}
              className="grid-line"
              style={{
                left: `${(i + 1) * 8.33}%`,
                width: '1px',
                height: '100%',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <div 
              key={`h-${i}`}
              className="grid-line"
              style={{
                top: `${(i + 1) * 12.5}%`,
                width: '100%',
                height: '1px',
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>

        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="bg-element" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }} 
            />
          ))}
        </div>

        <div className="fixed top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-white opacity-20 z-0"></div>
        <div className="fixed top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-white opacity-20 z-0"></div>
        <div className="fixed bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-white opacity-20 z-0"></div>
        <div className="fixed bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-white opacity-20 z-0"></div>

        <div className="relative z-10">
          {children}
        </div>
        
        <footer className="relative z-10 py-2 mt-3">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-white text-sm opacity-70">
              <p>© {new Date().getFullYear()} LUMS By The Numbers</p>
            </div>
          </div>
        </footer>
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
